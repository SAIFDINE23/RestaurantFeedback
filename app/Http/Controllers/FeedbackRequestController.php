<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\FeedbackRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Services\SmsService;
use App\Services\BrevoService;
use App\Services\ReminderService;
use App\Services\FeedbackTemplateService;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FeedbackRequestController extends Controller
{
    public function studio(Request $request, FeedbackTemplateService $templateService)
    {
        $company = $request->user()->company;

        $customers = Customer::where('company_id', $company->id)
            ->with(['feedbackRequests' => fn ($q) => $q->latest()->limit(1)])
            ->orderByDesc('id')
            ->get(['id', 'name', 'email', 'phone']);

        return Inertia::render('FeedbackRequests/Studio', [
            'customers' => $customers,
            'templates' => $templateService->forCompany($company),
        ]);
    }

    public function updateTemplates(Request $request, FeedbackTemplateService $templateService)
    {
        $data = $request->validate([
            'sms_template' => ['required', 'string', 'max:1500'],
            'email_subject_template' => ['required', 'string', 'max:255'],
            'email_body_template' => ['required', 'string', 'max:5000'],
            'qr_template' => ['nullable', 'string', 'max:500'],
        ]);

        foreach (['sms_template', 'email_subject_template', 'email_body_template'] as $field) {
            foreach (FeedbackTemplateService::TOKENS as $token) {
                if (!str_contains($data[$field], $token)) {
                    return back()->withErrors([
                        $field => "Le champ doit contenir le placeholder {$token}",
                    ]);
                }
            }
        }

        $company = $request->user()->company;
        $company->update([
            'feedback_sms_template' => $data['sms_template'],
            'feedback_email_subject_template' => $data['email_subject_template'],
            'feedback_email_body_template' => $data['email_body_template'],
            'feedback_qr_template' => $data['qr_template'],
        ]);

        return back()->with('success', 'Templates mis à jour avec succès.');
    }

    /**
     * Envoyer une demande de feedback (Email ou SMS)
     */
    public function store(Request $request)
    {
        // 🔹 Log de l'arrivée de la requête
        Log::info('FeedbackRequest.store called', [
            'user_id' => Auth::id(),
            'company_id' => Auth::user()->company->id ?? null,
            'payload' => $request->all(),
        ]);

        // ✅ Validation
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'channel'     => 'required|in:email,sms',
        ]);

        // 🔹 Log après validation
        Log::info('FeedbackRequest validated', $data);

        $company = Auth::user()->company;

        // 🔒 Sécurité : empêcher plusieurs feedbacks actifs
        $alreadySent = FeedbackRequest::where('customer_id', $data['customer_id'])
            ->where('company_id', $company->id)
            ->whereIn('status', ['pending', 'sent'])
            ->exists();

        if ($alreadySent) {
            Log::warning('FeedbackRequest already exists', [
                'customer_id' => $data['customer_id'],
                'company_id' => $company->id,
            ]);
            return back()->withErrors([
                'feedback' => 'Un feedback est déjà en attente pour ce client.'
            ]);
        }

        // ✅ Création de la demande (ne pas marquer "sent" avant l'envoi réel)
        $feedbackRequest = FeedbackRequest::create([
            'company_id'  => $company->id,
            'customer_id' => $data['customer_id'],
            'channel'     => $data['channel'],
            'token'       => Str::uuid(),
            'status'      => 'pending',
            'sent_at'     => null,
        ]);

        // 🔹 Log création
        Log::info('FeedbackRequest created', [
            'id' => $feedbackRequest->id,
            'status' => $feedbackRequest->status,
            'token' => $feedbackRequest->token,
        ]);

        /**
         * ==========================
         * EMAIL
         * ==========================
         */
            if ($data['channel'] === 'email') {
            Log::info('Email flow triggered', [
                'to' => $feedbackRequest->customer->email,
            ]);

            try {
                $templateService = app(FeedbackTemplateService::class);
                $brevoService = new BrevoService();
                $link = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;
                $templates = $templateService->forCompany($feedbackRequest->company);
                $variables = $this->templateVariables($feedbackRequest, $link);
                $subject = $templateService->render($templates['email_subject_template'], $variables);
                $emailBody = $templateService->render($templates['email_body_template'], $variables);
                
                $htmlContent = view('emails.feedback-request-custom', [
                    'customerName' => $feedbackRequest->customer->name,
                    'companyName' => $feedbackRequest->company->name,
                    'feedbackLink' => $variables['{{feedback_link}}'],
                    'emailBody' => $emailBody,
                    'companyLogo' => $feedbackRequest->company->logo_url,
                ])->render();

                $success = $brevoService->sendEmail(
                    [
                        'email' => $feedbackRequest->customer->email,
                        'name' => $feedbackRequest->customer->name,
                    ],
                            $subject,
                    $htmlContent
                );

                if ($success) {
                    $feedbackRequest->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                        'provider' => 'brevo',
                    ]);

                    Log::info('Email sent successfully via Brevo', [
                        'to' => $feedbackRequest->customer->email,
                        'feedback_request_id' => $feedbackRequest->id,
                    ]);
                } else {
                    throw new \Exception('Brevo email service returned false');
                }
            } catch (\Throwable $e) {
                $feedbackRequest->update([
                    'status' => 'failed',
                ]);

                Log::error('Email failed', [
                    'to' => $feedbackRequest->customer->email,
                    'error' => $e->getMessage(),
                    'feedback_request_id' => $feedbackRequest->id,
                ]);

                return back()->withErrors([
                    'email' => 'Erreur lors de l\'envoi de l\'email : ' . $e->getMessage()
                ]);
            }
        }


        /**
         * ==========================
         * SMS
         * ==========================
         */
        if ($data['channel'] === 'sms') {
            // 🔐 Validation du numéro
            if (empty($feedbackRequest->customer->phone)) {
                Log::warning('Customer phone missing', [
                    'customer_id' => $feedbackRequest->customer_id,
                ]);

                return back()->withErrors([
                    'phone' => 'Le client ne possède pas de numéro de téléphone.'
                ]);
            }

            // 💳 Récupérer la subscription de la company
            $company = Auth::user()->company;
            $subscription = $company?->subscription;

            Log::info('SMS flow triggered', [
                'customer_id' => $feedbackRequest->customer_id,
                'phone' => $feedbackRequest->customer->phone,
                'company_id' => $company?->id,
                'subscription_id' => $subscription?->id,
            ]);

            try {
                $link = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;
                $templateService = app(FeedbackTemplateService::class);
                $templates = $templateService->forCompany($feedbackRequest->company);
                $smsBody = $templateService->render(
                    $templates['sms_template'],
                    $this->templateVariables($feedbackRequest, $link)
                );

                // 📱 Envoyer SMS avec vérification/consommation de crédits
                $sms = app(SmsService::class)->sendWithCredits(
                    $feedbackRequest->customer->phone,
                    $smsBody,
                    $subscription // Passer la subscription pour la gestion des crédits
                );

                Log::info('SMS sent and credits consumed', [
                    'message_id' => $sms['messageId'] ?? null,
                    'subscription_id' => $subscription?->id,
                ]);

                // 📦 Tracking provider
                $feedbackRequest->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'provider' => 'brevo',
                    'provider_message_id' => $sms['messageId'] ?? null,
                    'provider_response' => json_encode($sms),
                ]);

            } catch (\Throwable $e) {
                $feedbackRequest->update([
                    'status' => 'failed',
                ]);

                Log::error('SMS FAILED', [
                    'to' => $feedbackRequest->customer->phone,
                    'error' => $e->getMessage(),
                ]);

                return back()->withErrors([
                    'sms' => 'Erreur lors de l’envoi du SMS : ' . $e->getMessage()
                ]);
            }
        }

        Log::info('FeedbackRequest flow completed successfully', [
            'id' => $feedbackRequest->id,
            'channel' => $data['channel'],
        ]);

        // 🚀 NOUVEAU: Lance le Job de génération de réponse IA
        // Cela va:
        // 1. Détecter la langue du feedback quand il arrive
        // 2. Générer une réponse en cette langue
        // 3. Escalader automatiquement si note basse
        // Note: Le feedback_text sera rempli quand le client répond
        // Pour l'instant, on peut déclencher le job après réception du feedback
        // dispatch(new GenerateAIReplyJob($feedbackRequest, 4)); // À déclencher après réception

        return back()->with('success', 'Demande de feedback envoyée avec succès');
    }

    /**
     * Envoyer des demandes de feedback en masse
     */
    public function storeBulk(Request $request)
    {
        Log::info('FeedbackRequest.storeBulk called', [
            'user_id' => Auth::id(),
            'company_id' => Auth::user()->company->id ?? null,
            'payload' => $request->all(),
        ]);

        // ✅ Validation
        $data = $request->validate([
            'customer_ids' => 'required|array|min:1',
            'customer_ids.*' => 'exists:customers,id',
            'channel' => 'required|in:email,sms',
        ]);

        $company = Auth::user()->company;
        $successCount = 0;
        $skipCount = 0;
        $errorCount = 0;
        $errors = [];

        foreach ($data['customer_ids'] as $customerId) {
            // 🔒 Vérifier si feedback déjà envoyé
            $alreadySent = FeedbackRequest::where('customer_id', $customerId)
                ->where('company_id', $company->id)
                ->whereIn('status', ['pending', 'sent'])
                ->exists();

            if ($alreadySent) {
                $skipCount++;
                Log::info('Skipping customer - feedback already exists', ['customer_id' => $customerId]);
                continue;
            }

            try {
                // ✅ Création de la demande
                $feedbackRequest = FeedbackRequest::create([
                    'company_id' => $company->id,
                    'customer_id' => $customerId,
                    'channel' => $data['channel'],
                    'token' => Str::uuid(),
                    'status' => 'pending',
                    'sent_at' => null,
                ]);

                // 📧 EMAIL
                if ($data['channel'] === 'email') {
                    try {
                        $templateService = app(FeedbackTemplateService::class);
                        $brevoService = new BrevoService();
                        $link = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;
                        $templates = $templateService->forCompany($feedbackRequest->company);
                        $variables = $this->templateVariables($feedbackRequest, $link);

                        $subject = $templateService->render($templates['email_subject_template'], $variables);
                        $emailBody = $templateService->render($templates['email_body_template'], $variables);

                        $htmlContent = view('emails.feedback-request-custom', [
                            'customerName' => $feedbackRequest->customer->name,
                            'companyName' => $feedbackRequest->company->name,
                            'feedbackLink' => $variables['{{feedback_link}}'],
                            'emailBody' => $emailBody,
                            'companyLogo' => $feedbackRequest->company->logo_url,
                        ])->render();

                        $success = $brevoService->sendEmail(
                            [
                                'email' => $feedbackRequest->customer->email,
                                'name' => $feedbackRequest->customer->name,
                            ],
                            $subject,
                            $htmlContent
                        );

                        if (!$success) {
                            throw new \Exception('Brevo email service returned false');
                        }

                        $feedbackRequest->update([
                            'status' => 'sent',
                            'sent_at' => now(),
                            'provider' => 'brevo',
                        ]);
                        $successCount++;
                    } catch (\Throwable $e) {
                        $feedbackRequest->update([
                            'status' => 'failed',
                        ]);

                        $errorCount++;
                        $errors[] = "Email pour {$feedbackRequest->customer->email}: {$e->getMessage()}";
                        Log::error('Bulk email failed', [
                            'customer_id' => $customerId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                // 📱 SMS
                if ($data['channel'] === 'sms') {
                    if (empty($feedbackRequest->customer->phone)) {
                        $skipCount++;
                        Log::warning('Customer phone missing', ['customer_id' => $customerId]);
                        continue;
                    }

                    try {
                        $link = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;
                        $templateService = app(FeedbackTemplateService::class);
                        $templates = $templateService->forCompany($feedbackRequest->company);

                        $smsBody = $templateService->render(
                            $templates['sms_template'],
                            $this->templateVariables($feedbackRequest, $link)
                        );
                        
                        // \u{1F4B3} Utiliser sendWithCredits pour v\u{E9}rifier et consommer les cr\u{E9}dits
                        $company = Auth::user()->company;
                        $subscription = $company?->subscription;
                        
                        $sms = app(SmsService::class)->sendWithCredits(
                            $feedbackRequest->customer->phone,
                            $smsBody,
                            $subscription
                        );

                        $feedbackRequest->update([
                            'status' => 'sent',
                            'sent_at' => now(),
                            'provider' => 'brevo',
                            'provider_message_id' => $sms['messageId'] ?? null,
                            'provider_response' => json_encode($sms),
                        ]);

                        $successCount++;
                    } catch (\Throwable $e) {
                        $feedbackRequest->update([
                            'status' => 'failed',
                        ]);

                        $errorCount++;
                        $errors[] = "SMS pour {$feedbackRequest->customer->phone}: {$e->getMessage()}";
                        Log::error('Bulk SMS failed', [
                            'customer_id' => $customerId,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                $errorCount++;
                $errors[] = "Client ID {$customerId}: {$e->getMessage()}";
                Log::error('Bulk feedback request creation failed', [
                    'customer_id' => $customerId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('FeedbackRequest.storeBulk completed', [
            'success' => $successCount,
            'skipped' => $skipCount,
            'errors' => $errorCount,
        ]);

        $message = "$successCount demandes envoyées avec succès";
        if ($skipCount > 0) {
            $message .= ", $skipCount ignorées (déjà envoyées ou sans téléphone)";
        }
        if ($errorCount > 0) {
            $message .= ", $errorCount erreurs";
        }

        if ($errorCount > 0 && count($errors) > 0) {
            return back()->with('success', $message)->withErrors(['bulk_errors' => $errors]);
        }

        return back()->with('success', $message);
    }

    private function templateVariables(FeedbackRequest $feedbackRequest, string $link): array
    {
        return [
            '{{customer_name}}' => $feedbackRequest->customer->name ?: 'client',
            '{{company_name}}' => $feedbackRequest->company->name ?: 'notre équipe',
            '{{feedback_link}}' => $link,
        ];
    }

    /**
     * Envoyer un reminder pour un feedbackRequest non répondu
     */
    public function sendReminder(Request $request, int $feedbackRequestId)
    {
        $feedbackRequest = FeedbackRequest::findOrFail($feedbackRequestId);

        // Vérifier que l'utilisateur appartient à la bonne company
        $company = Auth::user()->company;
        if ($feedbackRequest->company_id !== $company->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Vérifier que le feedbackRequest n'a pas encore de feedback
        if ($feedbackRequest->feedback()->exists()) {
            return response()->json(['success' => false, 'message' => 'Un feedback a déjà été reçu pour cette demande'], 400);
        }

        // Vérifier le statut
        if (!in_array($feedbackRequest->status, ['pending', 'sent'])) {
            return response()->json(['success' => false, 'message' => 'Cette demande de feedback ne peut pas recevoir de rappel'], 400);
        }

        // Envoyer le reminder via ReminderService
        $reminderService = new ReminderService();
        $success = $reminderService->sendReminder($feedbackRequest, maxReminders: 3);

        if ($success) {
            // Recharger pour avoir les données mises à jour
            $feedbackRequest->refresh();
            
            Log::info('Reminder sent successfully', [
                'feedback_request_id' => $feedbackRequestId,
                'channel' => $feedbackRequest->channel,
                'reminder_count' => $feedbackRequest->reminder_count,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rappel envoyé avec succès via ' . strtoupper($feedbackRequest->channel),
                'reminder_count' => $feedbackRequest->reminder_count,
            ]);
        } else {
            Log::warning('Reminder send failed', [
                'feedback_request_id' => $feedbackRequestId,
                'reason' => 'Service returned false or validation failed',
            ]);

            // Vérifier si un message d'erreur spécifique a été défini par le service
            $errorMessage = $feedbackRequest->reminder_error_message ?? 'Impossible d\'envoyer le rappel. Vérifiez les conditions (max 3 rappels, délai minimum 72h)';

            return response()->json([
                'success' => false,
                'message' => $errorMessage
            ], 400);
        }
    }

    /**
     * Envoyer des reminders en masse
     */
    public function sendAllReminders(Request $request)
    {
        $company = Auth::user()->company;

        Log::info('Batch reminders requested', [
            'user_id' => Auth::id(),
            'company_id' => $company->id,
        ]);

        $reminderService = new ReminderService();
        $stats = $reminderService->sendAllReminders(maxReminders: 3, companyId: $company->id);

        // Message détaillé avec statut
        $message = "Total: {$stats['total']} | Envoyés: {$stats['sent']}";
        
        if ($stats['skipped'] > 0) {
            $message .= " | Ignorés: {$stats['skipped']}";
        }
        
        if ($stats['failed'] > 0) {
            $message .= " | Erreurs: {$stats['failed']}";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'stats' => [
                'total' => $stats['total'],
                'sent' => $stats['sent'],
                'failed' => $stats['failed'],
                'skipped' => $stats['skipped'],
            ],
            'details' => $stats['details'],
        ], 200);
    }
}