<?php

namespace App\Services;

use App\Models\FeedbackRequest;
use App\Services\FeedbackTemplateService;
use Illuminate\Support\Facades\Log;

class ReminderService
{
    protected $brevoService;

    public function __construct()
    {
        $this->brevoService = new BrevoService();
    }

    /**
     * Envoyer un reminder pour un feedbackRequest non répondu
     *
     * @param FeedbackRequest $feedbackRequest
     * @param int $maxReminders Nombre maximum de reminders à envoyer (défaut: 3)
     * @return bool
     */
    public function sendReminder(FeedbackRequest $feedbackRequest, int $maxReminders = 3): bool
    {
        // Validation: le feedbackRequest doit être en status 'pending' ou 'sent'
        if (!in_array($feedbackRequest->status, ['pending', 'sent'])) {
            Log::warning('Cannot send reminder: FeedbackRequest is not pending/sent', [
                'feedback_request_id' => $feedbackRequest->id,
                'status' => $feedbackRequest->status,
            ]);
            return false;
        }

        // Validation: le client ne doit pas avoir déjà répondu
        if ($feedbackRequest->feedback()->exists()) {
            Log::warning('Cannot send reminder: Feedback already exists', [
                'feedback_request_id' => $feedbackRequest->id,
            ]);
            return false;
        }

        // Validation: limiter le nombre de reminders
        if ($feedbackRequest->reminder_count >= $maxReminders) {
            Log::warning('Maximum reminders reached', [
                'feedback_request_id' => $feedbackRequest->id,
                'reminder_count' => $feedbackRequest->reminder_count,
                'max_reminders' => $maxReminders,
            ]);
            
            $feedbackRequest->reminder_error_message = sprintf(
                'Limite maximale atteinte! Vous avez déjà envoyé %d reminders (maximum: %d). Impossible d\'envoyer plus de rappels à ce client.',
                $feedbackRequest->reminder_count,
                $maxReminders
            );
            
            return false;
        }

        // Validation: vérifier que c'est pas un envoi trop rapide (< 3 jours)
        if ($feedbackRequest->last_reminder_sent_at) {
            $canSendAt = $feedbackRequest->last_reminder_sent_at->copy()->addHours(72);
            
            if (now()->isBefore($canSendAt)) {
                // Trop tôt - calculer les heures restantes
                $hoursRemaining = now()->diffInHours($canSendAt);
                $daysRemaining = ceil($hoursRemaining / 24);
                
                Log::warning('Cannot send reminder: Too soon since last reminder', [
                    'feedback_request_id' => $feedbackRequest->id,
                    'last_reminder_sent_at' => $feedbackRequest->last_reminder_sent_at->format('Y-m-d H:i:s'),
                    'can_send_at' => $canSendAt->format('Y-m-d H:i:s'),
                    'hours_remaining' => $hoursRemaining,
                    'days_remaining' => $daysRemaining,
                ]);
                
                // Stocker le message d'erreur pour le contrôleur
                $feedbackRequest->reminder_error_message = sprintf(
                    'Trop tôt! Vous devez attendre 72h (3 jours) entre chaque reminder. Temps restant: %d heures (~%d jours). Prochain envoi possible: %s',
                    $hoursRemaining,
                    $daysRemaining,
                    $canSendAt->format('d/m/Y à H:i')
                );
                
                return false;
            }
        }

        // Envoyer via le même canal que la demande originale
        $success = false;

        if ($feedbackRequest->channel === 'email') {
            $success = $this->sendEmailReminder($feedbackRequest);
        } elseif ($feedbackRequest->channel === 'sms') {
            $success = $this->sendSmsReminder($feedbackRequest);
        }

        // Update tracking fields si succès
        if ($success) {
            $feedbackRequest->update([
                'reminder_count' => $feedbackRequest->reminder_count + 1,
                'last_reminder_sent_at' => now(),
                'first_reminder_sent_at' => $feedbackRequest->first_reminder_sent_at ?? now(),
            ]);

            Log::info('Reminder sent successfully', [
                'feedback_request_id' => $feedbackRequest->id,
                'channel' => $feedbackRequest->channel,
                'reminder_count' => $feedbackRequest->reminder_count + 1,
            ]);
        }

        return $success;
    }

    /**
     * Envoyer un reminder par email
     */
    protected function sendEmailReminder(FeedbackRequest $feedbackRequest): bool
    {
        try {
            $link = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;

            $templateService = app(FeedbackTemplateService::class);
            $templates = $templateService->forCompany($feedbackRequest->company);
            $variables = [
                '{{customer_name}}' => $feedbackRequest->customer->name ?: 'client',
                '{{company_name}}' => $feedbackRequest->company->name ?: 'notre équipe',
                '{{feedback_link}}' => $link,
            ];

            $subject = '⏰ Rappel: ' . $templateService->render($templates['email_subject_template'], $variables);
            $emailBody = $templateService->render($templates['email_body_template'], $variables);

            // Générer HTML du reminder
            $htmlContent = view('emails.feedback-request-custom', [
                'customerName' => $feedbackRequest->customer->name,
                'companyName' => $feedbackRequest->company->name,
                'feedbackLink' => $link,
                'emailBody' => $emailBody,
                'companyLogo' => $feedbackRequest->company->logo_url,
            ])->render();

            return $this->brevoService->sendEmail(
                [
                    'email' => $feedbackRequest->customer->email,
                    'name' => $feedbackRequest->customer->name,
                ],
                $subject,
                $htmlContent
            );
        } catch (\Exception $e) {
            Log::error('Error sending email reminder', [
                'feedback_request_id' => $feedbackRequest->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Envoyer un reminder par SMS
     */
    protected function sendSmsReminder(FeedbackRequest $feedbackRequest): bool
    {
        try {
            $link = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;

            $templateService = app(FeedbackTemplateService::class);
            $templates = $templateService->forCompany($feedbackRequest->company);

            $message = $templateService->render(
                $templates['sms_template'],
                [
                    '{{customer_name}}' => $feedbackRequest->customer->name ?: 'client',
                    '{{company_name}}' => $feedbackRequest->company->name ?: 'notre équipe',
                    '{{feedback_link}}' => $link,
                ]
            );

            // Préfixer avec indicateur de rappel
            $message = "⏰ Rappel\n" . $message;

            return $this->brevoService->sendSMS(
                $feedbackRequest->customer->phone,
                $message
            );
        } catch (\Exception $e) {
            Log::error('Error sending SMS reminder', [
                'feedback_request_id' => $feedbackRequest->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Envoyer des reminders en masse pour tous les feedbackRequests non répondus
     *
     * @param int $maxReminders
     * @return array ['sent' => count, 'failed' => count, 'details' => array]
     */
    public function sendAllReminders(int $maxReminders = 3, ?int $companyId = null): array
    {
        $stats = [
            'sent' => 0, 
            'failed' => 0,
            'skipped' => 0,
            'total' => 0,
            'details' => [
                'success' => [],
                'failed' => [],
                'skipped' => []
            ]
        ];

        // Récupérer tous les feedbackRequests non répondus
        $query = FeedbackRequest::whereIn('status', ['pending', 'sent'])
            ->where('reminder_count', '<', $maxReminders)
            ->whereHas('customer') // Vérifier que le customer existe
            ->doesntHave('feedback') // Pas encore de feedback
            ->with('customer'); // Eager load pour éviter N+1 queries

        // Filtrer par company si spécifié (sécurité multi-tenant)
        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        $pendingRequests = $query->get();

        $stats['total'] = $pendingRequests->count();

        foreach ($pendingRequests as $request) {
            try {
                // Réinitialiser le message d'erreur
                $request->reminder_error_message = null;
                
                $success = $this->sendReminder($request, $maxReminders);
                
                if ($success) {
                    $stats['sent']++;
                    $stats['details']['success'][] = [
                        'id' => $request->id,
                        'customer' => $request->customer->name,
                        'email' => $request->customer->email,
                        'channel' => $request->channel,
                        'reminder_count' => $request->reminder_count,
                    ];
                } else {
                    // Échec de validation (délai 72h, max atteint, etc.)
                    $stats['skipped']++;
                    $stats['details']['skipped'][] = [
                        'id' => $request->id,
                        'customer' => $request->customer->name,
                        'email' => $request->customer->email,
                        'reason' => $request->reminder_error_message ?? 'Validation failed',
                    ];
                }
            } catch (\Exception $e) {
                // Erreur technique (API Brevo down, etc.)
                $stats['failed']++;
                $stats['details']['failed'][] = [
                    'id' => $request->id,
                    'customer' => $request->customer->name ?? 'Unknown',
                    'email' => $request->customer->email ?? 'N/A',
                    'error' => $e->getMessage(),
                ];
                
                Log::error('Exception during batch reminder send', [
                    'feedback_request_id' => $request->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Log::info('Batch reminders completed', [
            'total' => $stats['total'],
            'sent' => $stats['sent'],
            'failed' => $stats['failed'],
            'skipped' => $stats['skipped'],
        ]);
        
        return $stats;
    }
}
