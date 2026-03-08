<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class BrevoService
{
    protected $client;
    protected $apiKey;
    protected $smsSender;
    protected $baseUrl = 'https://api.brevo.com/v3';

    public function __construct()
    {
        $this->apiKey = config('services.brevo.api_key');
        $this->smsSender = config('services.brevo.sms_sender');
        $this->client = new Client([
            'headers' => [
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ]
        ]);
    }

    /**
     * Envoyer un email via Brevo
     *
     * @param array $to Format: ['email' => 'user@example.com', 'name' => 'User Name']
     * @param string $subject Sujet de l'email
     * @param string $htmlContent Contenu HTML
     * @param array $cc (optionnel)
     * @param array $bcc (optionnel)
     * @return bool
     */
    public function sendEmail(array $to, string $subject, string $htmlContent, array $cc = [], array $bcc = []): bool
    {
        try {
            $payload = [
                'sender' => [
                    'name' => config('mail.from.name'),
                    'email' => config('mail.from.address'),
                ],
                'to' => [$to],
                'subject' => $subject,
                'htmlContent' => $htmlContent,
            ];

            if (!empty($cc)) {
                $payload['cc'] = $cc;
            }

            if (!empty($bcc)) {
                $payload['bcc'] = $bcc;
            }

            $response = $this->client->post($this->baseUrl . '/smtp/email', [
                'json' => $payload,
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode === 201) {
                Log::info('Email sent successfully via Brevo', [
                    'to' => $to['email'],
                    'subject' => $subject,
                ]);
                return true;
            }

            Log::warning('Unexpected response from Brevo', [
                'status' => $statusCode,
                'body' => $response->getBody(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Error sending email via Brevo', [
                'message' => $e->getMessage(),
                'to' => $to['email'] ?? 'unknown',
            ]);
            return false;
        }
    }

    /**
     * Envoyer un SMS via Brevo
     *
     * @param string $phoneNumber Numéro de téléphone (format international: +33...)
     * @param string $message Message SMS
     * @return bool
     */
    public function sendSMS(string $phoneNumber, string $message): bool
    {
        try {
            // Vérifier que le numéro commence par +
            if (!str_starts_with($phoneNumber, '+')) {
                $phoneNumber = '+' . $phoneNumber;
            }

            $payload = [
                'sender' => $this->smsSender,
                'recipient' => $phoneNumber,
                'content' => $message,
            ];

            $response = $this->client->post($this->baseUrl . '/transactionalSMS/sms', [
                'json' => $payload,
            ]);

            $statusCode = $response->getStatusCode();
            if ($statusCode === 201) {
                Log::info('SMS sent successfully via Brevo', [
                    'phone' => $phoneNumber,
                    'message' => substr($message, 0, 50) . '...',
                ]);
                return true;
            }

            Log::warning('Unexpected response from Brevo SMS', [
                'status' => $statusCode,
                'body' => $response->getBody(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Error sending SMS via Brevo', [
                'message' => $e->getMessage(),
                'phone' => $phoneNumber,
            ]);
            return false;
        }
    }

    /**
     * Vérifier la configuration
     *
     * @return array
     */
    public function checkConfiguration(): array
    {
        return [
            'api_key_set' => !empty($this->apiKey),
            'sms_sender_set' => !empty($this->smsSender),
            'mail_config' => [
                'host' => config('mail.host'),
                'port' => config('mail.port'),
                'username' => config('mail.username'),
                'from' => config('mail.from'),
            ]
        ];
    }

    /**
     * Récupérer les informations de compte Brevo (crédits SMS, etc.)
     */
    public function getAccountInfo(): array
    {
        try {
            $response = $this->client->get($this->baseUrl . '/account');
            
            if ($response->getStatusCode() === 200) {
                $data = json_decode($response->getBody(), true);
                
                Log::info('Brevo account info retrieved', [
                    'plan' => $data['plan'] ?? null,
                    'sms_prepaid' => $data['smsPrepaids'] ?? null,
                ]);
                
                return [
                    'success' => true,
                    'email' => $data['email'] ?? null,
                    'first_name' => $data['firstName'] ?? null,
                    'last_name' => $data['lastName'] ?? null,
                    'company' => $data['companyName'] ?? null,
                    'plan' => $data['plan'] ?? null,
                    'credits' => $data['smsCredits'] ?? 0,
                    'sms_prepaid' => $data['smsPrepaids'] ?? [],
                    'raw' => $data,
                ];
            }
            
            return [
                'success' => false,
                'error' => 'Unexpected status code: ' . $response->getStatusCode(),
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching Brevo account info', [
                'error' => $e->getMessage(),
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Récupérer les crédits SMS restants
     */
    public function getSmsCredits(): ?int
    {
        $accountInfo = $this->getAccountInfo();
        
        if (!$accountInfo['success']) {
            Log::warning('Could not fetch SMS credits from Brevo API');
            return null;
        }
        
        // Les crédits SMS peuvent être dans:
        // 1. plan[] array avec type: 'sms'
        // 2. smsPrepaids[] array
        
        $totalCredits = 0;
        
        // Vérifier dans plan
        $plan = $accountInfo['plan'] ?? [];
        if (is_array($plan)) {
            foreach ($plan as $item) {
                if (isset($item['type']) && $item['type'] === 'sms' && isset($item['credits'])) {
                    $totalCredits += (int)$item['credits'];
                    Log::info('SMS credits found in plan', ['credits' => $item['credits']]);
                }
            }
        }
        
        // Vérifier dans smsPrepaids
        $smsPrepaids = $accountInfo['sms_prepaid'] ?? [];
        if (!empty($smsPrepaids) && is_array($smsPrepaids)) {
            foreach ($smsPrepaids as $prepaid) {
                if (isset($prepaid['remainingCredits'])) {
                    $totalCredits += (int)$prepaid['remainingCredits'];
                    Log::info('SMS Prepaid found', ['credits' => $prepaid['remainingCredits']]);
                }
            }
        }
        
        Log::info('Total SMS Credits calculated', ['total' => $totalCredits, 'plan' => $plan, 'prepaids' => $smsPrepaids]);
        
        return $totalCredits > 0 ? $totalCredits : null;
    }

    /**
     * Récupérer la date d'expiration des crédits SMS
     */
    public function getSmsCreditsExpiryDate(): ?\DateTime
    {
        $accountInfo = $this->getAccountInfo();
        
        if (!$accountInfo['success']) {
            return null;
        }
        
        $smsPrepaids = $accountInfo['sms_prepaid'] ?? [];
        if (empty($smsPrepaids)) {
            return null;
        }
        
        $expiryDate = null;
        foreach ($smsPrepaids as $prepaid) {
            if (isset($prepaid['expiryDate'])) {
                $date = new \DateTime($prepaid['expiryDate']);
                if (!$expiryDate || $date < $expiryDate) {
                    $expiryDate = $date;
                }
            }
        }
        
        return $expiryDate;
    }

    /**
     * Récupérer les informations de crédits SMS (crédits + expiration)
     */
    public function getSmsCreditsInfo(): array
    {
        $credits = $this->getSmsCredits();
        $expiryDate = $this->getSmsCreditsExpiryDate();
        
        Log::info('SMS Credits Info', [
            'credits' => $credits,
            'expiry_date' => $expiryDate?->format('Y-m-d'),
        ]);
        
        return [
            'remaining_credits' => $credits ?? 0,
            'expiry_date' => $expiryDate?->format('Y-m-d'),
            'expires_in_days' => $expiryDate ? (int)$expiryDate->diff(now())->days : null,
            'is_low' => $credits !== null && $credits < 10,
            'is_critical' => $credits !== null && $credits < 1,
        ];
    }
}
