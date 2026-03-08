<?php

namespace App\Console\Commands;

use App\Models\SubscriptionCredits;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ResetMonthlyCredits extends Command
{
    protected $signature = 'credits:reset-monthly';
    protected $description = 'Reset monthly credits for all subscriptions that need it';

    public function handle(): int
    {
        $this->info('Starting monthly credits reset...');

        $credits = SubscriptionCredits::whereNull('last_reset_date')
            ->orWhere('last_reset_date', '<', now()->startOfMonth())
            ->get();

        $count = 0;
        foreach ($credits as $credit) {
            if ($credit->needsMonthlyReset()) {
                $credit->resetMonthlyCredits();
                $count++;
            }
        }

        $this->info("Reset {$count} subscription credits.");
        Log::info("Monthly credits reset completed: {$count} subscriptions.");

        return self::SUCCESS;
    }
}
