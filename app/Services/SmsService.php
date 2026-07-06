<?php

namespace App\Services;

use App\Models\Subscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Vérifier et envoyer un SMS avec consommation de crédits
     *
     * @param  string  $to  Numéro de téléphone
     * @param  string  $message  Contenu du message
     * @param  Subscription|null  $subscription  La subscription de la company (optionnel)
     *
     * @throws \RuntimeException Si crédits insuffisants ou erreur Brevo
     */
    public function sendWithCredits(string $to, string $message, ?Subscription $subscription = null): array
    {
        // Si pas de subscription, on envoie simplement (backward compatible)
        if (! $subscription) {
            return $this->send($to, $message);
        }

        // 1️⃣ Vérifier les crédits disponibles
        $creditService = app(\App\Services\CreditConsumptionService::class);

        // Extraire le code pays du numéro (approx)
        $countryCode = $this->extractCountryCode($to);

        // canSendSms() renvoie un tableau ['can_send' => bool, ...] : il FAUT tester
        // la clé, sinon la condition est toujours fausse (tableau non vide = truthy)
        // et le contrôle de crédits ne bloque jamais (fuite de revenus).
        $check = $creditService->canSendSms($subscription, $countryCode, 1);
        if (! ($check['can_send'] ?? false)) {
            throw new \RuntimeException($check['message'] ?? 'Crédits insuffisants pour envoyer ce SMS.');
        }

        // 2️⃣ Envoyer le SMS
        $result = $this->send($to, $message);

        // 3️⃣ Consommer les crédits (le SMS est déjà parti : ne jamais bloquer la réponse)
        try {
            $consumption = $creditService->consumeCreditsForSms($subscription, $countryCode);

            if (! ($consumption['success'] ?? false)) {
                Log::error('SMS envoyé mais consommation des crédits échouée', [
                    'subscription_id' => $subscription->id,
                    'country_code' => $countryCode,
                    'message_id' => $result['messageId'] ?? null,
                    'reason' => $consumption['message'] ?? 'unknown',
                ]);
            } else {
                Log::info('SMS envoyé et crédits consommés', [
                    'subscription_id' => $subscription->id,
                    'country_code' => $countryCode,
                    'units_consumed' => $consumption['units_consumed'] ?? null,
                    'message_id' => $result['messageId'] ?? null,
                ]);
            }
        } catch (\Exception $e) {
            // Log l'erreur mais ne bloque pas (SMS déjà envoyé)
            Log::error('Erreur lors de la consommation des crédits', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
                'message_id' => $result['messageId'] ?? null,
            ]);
        }

        return $result;
    }

    /**
     * Envoyer un SMS simple (sans vérification de crédits)
     */
    public function send(string $to, string $message): array
    {
        $to = $this->normalizePhoneNumber($to);
        $apiKey = config('services.brevo.api_key');
        $sender = config('services.brevo.sms_sender');

        if (empty($apiKey) || empty($sender)) {
            throw new \RuntimeException('Brevo SMS config manquante (BREVO_API_KEY ou BREVO_SMS_SENDER).');
        }

        $response = Http::withHeaders([
            'api-key' => $apiKey,
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])->post('https://api.brevo.com/v3/transactionalSMS/sms', [
            'sender' => $sender,
            'recipient' => $to,
            'content' => $message,
            'type' => 'transactional',
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Brevo SMS error: '.$response->body());
        }

        return [
            'messageId' => $response->json('messageId'),
            'status' => $response->status(),
            'response' => $response->json(),
        ];
    }

    /**
     * Extraire le code pays du numéro de téléphone
     * Format: +33... → FR, +212... → MA, +1... → US, etc.
     */
    private function extractCountryCode(string $phone): string
    {
        $phone = $this->normalizePhoneNumber($phone);

        // Mappings pays courants
        $countryMap = [
            '+33' => 'FR',  // France
            '+212' => 'MA', // Maroc
            '+34' => 'ES',  // Espagne
            '+39' => 'IT',  // Italie
            '+49' => 'DE',  // Allemagne
            '+44' => 'GB',  // UK
            '+1' => 'US',   // USA/Canada
            '+44' => 'GB',  // UK
            '+45' => 'DK',  // Danemark
            '+46' => 'SE',  // Suède
            '+47' => 'NO',  // Norvège
            '+41' => 'CH',  // Suisse
            '+43' => 'AT',  // Autriche
            '+32' => 'BE',  // Belgique
            '+31' => 'NL',  // Pays-Bas
            '+40' => 'RO',  // Roumanie
            '+48' => 'PL',  // Pologne
            '+420' => 'CZ', // Tchéquie
            '+36' => 'HU',  // Hongrie
        ];

        // Chercher le code pays le plus long en match
        foreach ($countryMap as $prefix => $code) {
            if (str_starts_with($phone, $prefix)) {
                return $code;
            }
        }

        // Default: FR si on ne reconnaît pas
        return 'FR';
    }

    private function normalizePhoneNumber(string $phone): string
    {
        $phone = trim($phone);

        if ($phone === '') {
            return $phone;
        }

        // Keep a leading + if present, remove all other non-digits.
        $normalized = preg_replace('/(?!^\+)[^\d]/', '', $phone) ?? $phone;

        // Collapse multiple leading + signs if any.
        $normalized = preg_replace('/^\++/', '+', $normalized) ?? $normalized;

        return $normalized;
    }
}
