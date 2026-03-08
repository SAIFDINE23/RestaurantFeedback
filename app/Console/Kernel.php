<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        /**
         * Envoyer les reminders de feedback automatiquement
         * Chaque jour à 09:00
         * 
         * ⏰ LOGIQUE:
         * - Jour 1: FeedbackRequest envoyé
         * - Jour 4: Premier reminder (Cron check: 3 jours écoulés ✓ → Envoie)
         * - Jour 7: Deuxième reminder (Cron check: 3 jours depuis dernier ✓ → Envoie)
         * - Jour 10: Troisième reminder (Cron check: 3 jours depuis dernier ✓ → Envoie)
         * - Jour 10+: Aucun reminder (reminder_count = 3, max atteint)
         */
        $schedule->command('reminders:send')
            ->dailyAt('09:00')
            ->name('send-feedback-reminders')
            ->description('Envoyer les reminders de feedback (chaque 3 jours)')
            ->onSuccess(function () {
                \Illuminate\Support\Facades\Log::info('✅ Feedback reminders sent successfully');
            })
            ->onFailure(function () {
                \Illuminate\Support\Facades\Log::error('❌ Feedback reminders job failed');
            });

        /**
         * ALTERNATIVES (décommenter si tu veux):
         * 
         * // Envoyer tous les 3 jours exactement
         * $schedule->command('reminders:send')->everyThreeHours();
         * 
         * // Envoyer deux fois par jour (matin et soir)
         * $schedule->command('reminders:send')->dailyAt('09:00');
         * $schedule->command('reminders:send')->dailyAt('18:00');
         * 
         * // Envoyer chaque semaine le lundi
         * $schedule->command('reminders:send')->weeklyOn(1, '09:00');
         */
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
