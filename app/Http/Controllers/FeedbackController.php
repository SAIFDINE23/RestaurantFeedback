<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\FeedbackRequest;
use App\Jobs\GenerateAIReplyJob;
use App\Services\AIReplyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    /**
     * Liste de tous les feedbacks (admin)
     */
    public function index()
    {
        $company = Auth::user()->company;

        $feedbacks = FeedbackRequest::where('company_id', $company->id)
            ->whereHas('customer')
            ->with(['customer', 'feedback'])
            ->latest()
            ->paginate(15)
            ->through(fn ($f) => [
                'id' => $f->id,
                'feedback_id' => $f->feedback?->id,
                'token' => $f->token,
                'customer' => [
                    'id' => $f->customer->id,
                    'name' => $f->customer->name,
                ],
                'status' => $f->status,
                'channel' => $f->channel,
                'feedback' => [
                    'id' => $f->feedback?->id,
                    'rating' => $f->feedback?->rating,
                    'comment' => $f->feedback?->comment,
                ],
                'created_at' => $f->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Feedbacks/Index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    /**
     * Page feedback (client – via token)
     */
    public function show(string $token)
    {
        $feedbackRequest = FeedbackRequest::with('company', 'customer')
            ->where('token', $token)
            ->firstOrFail();

        if (in_array($feedbackRequest->status, ['completed', 'expired'], true)) {
            return Inertia::render('Feedback/AlreadySubmitted', [
                'company' => $feedbackRequest->company->name,
            ]);
        }

        // Valeurs par défaut si aucun design n'est configuré
        $defaultSettings = [
            'primary_color' => '#3b82f6',
            'secondary_color' => '#1e40af',
            'star_style' => 'classic',
            'star_color' => '#fbbf24',
            'font_family' => 'Inter',
            'background_color' => '#f9fafb',
            'card_background' => '#ffffff',
            'text_color' => '#111827',
            'button_style' => 'rounded',
            'show_logo' => true,
            'custom_message' => 'Votre avis compte pour nous!',
        ];

        return Inertia::render('Feedback/Create', [
            'token'   => $token,
            'postUrl' => route('feedback.store', $token),
            'company' => [
                'name' => $feedbackRequest->company->name,
                'logo_url' => $feedbackRequest->company->logo_url,
                'design_settings' => $feedbackRequest->company->design_settings ?? $defaultSettings,
            ],
            'customer'=> optional($feedbackRequest->customer)->name,
        ]);
    }

    /**
     * Soumission du feedback
     */
    public function store(Request $request, string $token)
    {
        $request->validate([
            'rating'  => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string'],
        ]);

        $feedbackRequest = FeedbackRequest::with('company')
            ->where('token', $token)
            ->whereNotIn('status', ['completed', 'expired'])
            ->firstOrFail();

        // ✅ Création du feedback
        $feedback = Feedback::create([
            'feedback_request_id' => $feedbackRequest->id,
            'rating'              => $request->rating,
            'comment'             => $request->comment,
            'is_public'           => true,
        ]);

        // 🌍 Détecte la langue du commentaire (si fourni)
        $aiService = new AIReplyService();
        $detectedLanguage = 'en'; // Défaut
        
        if ($request->comment) {
            $detectedLanguage = $aiService->detectLanguage($request->comment);
        }

        // ✅ Update request avec langue détectée et contenu du feedback
        $feedbackRequest->update([
            'status'              => 'completed',
            'responded_at'        => now(),
            'detected_language'   => $detectedLanguage,
            'feedback_text'       => $request->comment,
        ]);

        if ($feedbackRequest->channel === 'qr') {
            FeedbackRequest::where('customer_id', $feedbackRequest->customer_id)
                ->where('company_id', $feedbackRequest->company_id)
                ->where('channel', 'qr')
                ->whereIn('status', ['pending', 'sent'])
                ->update(['status' => 'expired']);

            FeedbackRequest::create([
                'company_id' => $feedbackRequest->company_id,
                'customer_id' => $feedbackRequest->customer_id,
                'channel' => 'qr',
                'token' => \Illuminate\Support\Str::uuid(),
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        // 🤖 Lance le Job de génération de réponse IA (multilingue)
        dispatch(new GenerateAIReplyJob($feedback));

        // ✅ Logique Google Reviews (legacy) et Plateformes multiples
        $googleUrl = null;
        $reviewPlatforms = $feedbackRequest->company->review_platforms;

        if ($feedback->rating >= 4) {
            $googleUrl = $feedbackRequest->company->google_review_url;
        }

        return Inertia::render('Feedback/ThankYou', [
            'rating'          => $feedback->rating,
            'googleUrl'       => $googleUrl,
            'company'         => $feedbackRequest->company->name,
            'reviewPlatforms' => $reviewPlatforms,
        ]);
    }

    /**
     * Admin view
     */
    public function adminShow(int $id)
    {
        $feedbackRequest = FeedbackRequest::with('feedback', 'customer', 'company')
            ->findOrFail($id);

        return Inertia::render('Feedback/Show', [
            'token'    => $feedbackRequest->token,
            'feedback' => $feedbackRequest->feedback,
            'status'   => $feedbackRequest->status,
            'company'  => $feedbackRequest->company->name,
            'customer' => optional($feedbackRequest->customer)->name,
            'isAdmin'  => Auth::check(), 
        // ou Auth::user()?->is_admin si tu as un champ
        ]);
    }
}
