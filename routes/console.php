<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\GlobalRadarBuilder;
use App\Services\RadarAnalysisService;

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
*/

// Reset mensuel des crédits (chaque 1er du mois à 00:05)
Schedule::command('credits:reset-monthly')->monthlyOn(1, '00:05');

// Downgrade des subscriptions past_due > 14 jours (tous les jours à 02:00)
Schedule::command('subscriptions:expire-overdue')->dailyAt('02:00');

// Cleanup des vieux événements Stripe > 90 jours (chaque dimanche à 03:00)
Schedule::command('stripe:cleanup-events --days=90')->weeklyOn(0, '03:00');

/*
|--------------------------------------------------------------------------
| Artisan Commands
|--------------------------------------------------------------------------
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('radar:global {--days=30} {--force}', function (GlobalRadarBuilder $builder, RadarAnalysisService $radar) {
    $days = (int) $this->option('days');
    $days = max(7, min($days, 90));
    $force = (bool) $this->option('force');

    $data = $builder->build($days);

    $analysis = $radar->analyzeGlobalWithCache(
        feedbacks: $data['analysis_feedbacks'],
        sentimentStats: $data['sentiment'],
        feedbacksWithComments: $data['feedbacks_with_comments'],
        context: [
            'period' => $data['period'],
            'kpis' => $data['kpis'],
            'ops' => $data['ops'],
        ],
        force: $force
    );

    $this->info('Radar IA global généré.');
    $this->line('Période: ' . $data['period']['from'] . ' → ' . $data['period']['to']);
    $this->line('Status: ' . ($analysis['status'] ?? 'unknown') . ' | Cached: ' . (($analysis['cached'] ?? false) ? 'yes' : 'no'));
})->purpose('Générer le Radar IA global (admin plateforme)');
