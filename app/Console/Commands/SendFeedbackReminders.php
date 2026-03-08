<?php

namespace App\Console\Commands;

use App\Services\ReminderService;
use Illuminate\Console\Command;

class SendFeedbackReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reminders:send {--max-reminders=3} {--dry-run}';

    /**
     * The console command description.
     */
    protected $description = 'Envoyer des reminders automatiques pour les feedbackRequests non répondus';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $maxReminders = (int) $this->option('max-reminders');
        $dryRun = $this->option('dry-run');

        $this->info('🚀 Envoi des reminders de feedback...');
        $this->line('');

        if ($dryRun) {
            $this->warn('Mode DRY-RUN: aucun email ne sera envoyé');
            $this->line('');
        }

        $reminderService = new ReminderService();
        $stats = $reminderService->sendAllReminders(maxReminders: $maxReminders);

        // Afficher les résultats
        $this->info('✅ Reminders envoyés: ' . $stats['sent']);
        $this->warn('❌ Reminders échoués: ' . $stats['failed']);
        $this->line('');

        if ($stats['sent'] > 0) {
            $this->newLine();
            $this->info('Total: ' . ($stats['sent'] + $stats['failed']) . ' reminders traités');
        }

        return $stats['failed'] > 0 ? 1 : 0;
    }
}
