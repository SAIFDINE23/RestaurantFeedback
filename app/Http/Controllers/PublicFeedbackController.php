<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Feedback;
use App\Models\FeedbackRequest;
use App\Jobs\GenerateAIReplyJob;
use App\Services\AIReplyService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PublicFeedbackController extends Controller
{
    /**
     * Affiche le formulaire public de feedback (QR sur table).
     */
    public function show(string $token)
    {
        $company = Company::where('feedback_public_token', $token)->firstOrFail();

        $defaultDesign = [
            'primary_color'    => '#3b82f6',
            'secondary_color'  => '#1e40af',
            'star_style'       => 'classic',
            'star_color'       => '#fbbf24',
            'font_family'      => 'Inter',
            'background_color' => '#f9fafb',
            'card_background'  => '#ffffff',
            'text_color'       => '#111827',
            'button_style'     => 'rounded',
            'show_logo'        => true,
            'custom_message'   => 'Votre avis compte pour nous !',
        ];

        return Inertia::render('PublicFeedback/Show', [
            'company' => [
                'name'            => $company->name,
                'logo_url'        => $company->logo_url,
                'design_settings' => $company->design_settings ?? $defaultDesign,
            ],
            'token'   => $token,
            'postUrl' => route('public.feedback.store', ['token' => $token]),
        ]);
    }

    /**
     * Enregistre le feedback soumis publiquement.
     */
    public function store(Request $request, string $token)
    {
        $company = Company::where('feedback_public_token', $token)->firstOrFail();

        $request->validate([
            'rating'  => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'name'    => ['nullable', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255'],
            'phone'   => ['nullable', 'string', 'max:30'],
        ]);

        // 🛡️ Anti-fraude : vérifier max_feedbacks du plan
        $plan = $company->subscription?->plan;

        if ($plan && $plan->max_feedbacks !== null) {
            $receivedThisMonth = Feedback::whereHas('feedbackRequest', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })->whereMonth('created_at', now()->month)
              ->whereYear('created_at', now()->year)
              ->count();

            if ($receivedThisMonth >= $plan->max_feedbacks) {
                return Inertia::render('Feedback/LimitReached', [
                    'company' => $company->name,
                ]);
            }
        }

        // 👤 Créer ou retrouver le customer si contact fourni
        $customer = null;
        $hasContact = $request->filled('email') || $request->filled('phone');

        if ($hasContact && $request->filled('name')) {
            $query = Customer::where('company_id', $company->id);

            if ($request->filled('email')) {
                $query->where('email', $request->email);
            } elseif ($request->filled('phone')) {
                $query->where('phone', $request->phone);
            }

            $customer = $query->first();

            if (!$customer) {
                $customer = Customer::create([
                    'company_id' => $company->id,
                    'name'       => $request->name,
                    'email'      => $request->email ?: null,
                    'phone'      => $request->phone ?: null,
                    'source'     => 'qr_code',
                ]);
            }
        }

        // Si aucun customer (anonyme), créer un customer anonyme
        if (!$customer) {
            $customer = Customer::create([
                'company_id' => $company->id,
                'name'       => 'Client anonyme',
                'email'      => 'anonymous-' . Str::random(8) . '@feedback.local',
                'source'     => 'qr_code',
            ]);
        }

        // 📝 Créer la FeedbackRequest (channel = qr)
        $feedbackRequest = FeedbackRequest::create([
            'company_id'  => $company->id,
            'customer_id' => $customer->id,
            'token'       => Str::uuid()->toString(),
            'channel'     => 'qr',
            'status'      => 'completed',
            'sent_at'     => now(),
            'responded_at'=> now(),
        ]);

        // ⭐ Créer le Feedback
        $feedback = Feedback::create([
            'feedback_request_id' => $feedbackRequest->id,
            'rating'              => $request->rating,
            'comment'             => $request->comment,
            'is_public'           => true,
        ]);

        // 🌍 Détection langue + mise à jour request
        $detectedLanguage = 'fr';
        if ($request->comment) {
            try {
                $aiService = new AIReplyService();
                $detectedLanguage = $aiService->detectLanguage($request->comment);
            } catch (\Exception $e) {
                // Silently default to FR
            }
        }

        $feedbackRequest->update([
            'detected_language' => $detectedLanguage,
            'feedback_text'     => $request->comment,
        ]);

        // 🤖 Job IA de réponse
        dispatch(new GenerateAIReplyJob($feedback));

        // ✅ Redirection Google si note >= 4
        $googleUrl       = null;
        $reviewPlatforms = $company->review_platforms;

        if ($feedback->rating >= 4) {
            $googleUrl = $company->google_review_url;
        }

        return Inertia::render('Feedback/ThankYou', [
            'rating'          => $feedback->rating,
            'googleUrl'       => $googleUrl,
            'company'         => $company->name,
            'reviewPlatforms' => $reviewPlatforms,
        ]);
    }
}
