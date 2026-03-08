<?php

namespace App\Console\Commands;

use App\Services\BrevoService;
use Illuminate\Console\Command;

class TestBrevoConfiguration extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'brevo:test {--email=} {--sms=} {--phone=}';

    /**
     * The console command description.
     */
    protected $description = 'Tester la configuration Brevo et envoyer des emails/SMS';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $brevoService = new BrevoService();

        // Vérifier la configuration
        $this->info('📋 Vérification de la configuration Brevo...');
        $config = $brevoService->checkConfiguration();

        $this->table(
            ['Configuration', 'Statut'],
            [
                ['API Key', $config['api_key_set'] ? '✅ Configuré' : '❌ Manquant'],
                ['SMS Sender', $config['sms_sender_set'] ? '✅ Configuré' : '❌ Manquant'],
                ['Mail Host', $config['mail_config']['host'] ?? 'N/A'],
                ['Mail Port', $config['mail_config']['port'] ?? 'N/A'],
                ['Mail From', $config['mail_config']['from']['address'] ?? 'N/A'],
            ]
        );

        // Test d'envoi d'email
        if ($this->option('email')) {
            $this->info("\n📧 Test d'envoi d'email...");
            
            $email = $this->option('email');
            $subject = 'Test Brevo - Email';
            $htmlContent = '<html><body><h1>Test d\'email Brevo</h1><p>Cet email a été envoyé avec succès via Brevo!</p></body></html>';

            $success = $brevoService->sendEmail(
                ['email' => $email, 'name' => 'Test User'],
                $subject,
                $htmlContent
            );

            if ($success) {
                $this->info("✅ Email envoyé avec succès à: $email");
            } else {
                $this->error("❌ Erreur lors de l'envoi de l'email");
            }
        }

        // Test d'envoi d'SMS
        if ($this->option('sms') && $this->option('phone')) {
            $this->info("\n📱 Test d'envoi d'SMS...");
            
            $phone = $this->option('phone');
            $message = $this->option('sms');

            $success = $brevoService->sendSMS($phone, $message);

            if ($success) {
                $this->info("✅ SMS envoyé avec succès à: $phone");
            } else {
                $this->error("❌ Erreur lors de l'envoi du SMS");
            }
        }

        $this->info("\n✅ Test terminé!");
    }
}
