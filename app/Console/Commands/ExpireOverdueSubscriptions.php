<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpireOverdueSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire-overdue';
    protected $description = 'Downgrade subscriptions that are past_due for more than 14 days to FREE';

    public function handle(): int
    {
        $this->info('Checking for overdue subscriptions...');

        $freePlan = Plan::where('slug', 'free')->first();
        if (!$freePlan) {
            $this->error('FREE plan not found!');
            return self::FAILURE;
        }

        // Subscriptions past_due depuis plus de 14 jours
        $overdueSubscriptions = Subscription::where('status', 'past_due')
            ->where('updated_at', '<', now()->subDays(14))
            ->with(['credits', 'plan'])
            ->get();

        $count = 0;
        foreach ($overdueSubscriptions as $subscription) {
            DB::transaction(function () use ($subscription, $freePlan, &$count) {
                $subscription->update([
                    'plan_id' => $freePlan->id,
                    'status' => 'active', // Actif sur FREE — l'user garde l'accès au plan gratuit
                    'stripe_subscription_id' => null,
                    'ends_at' => null, // FREE n'expire jamais
                ]);

                if ($subscription->credits) {
                    $addonBalance = max(0, $subscription->credits->credits_addon_balance ?? 0);
                    $subscription->credits->update([
                        'credits_monthly' => $freePlan->credits_monthly,
                        'credits_used_monthly' => 0,
                        'credits_available_monthly' => $freePlan->credits_monthly,
                        'credits_total_available' => $freePlan->credits_monthly + $addonBalance,
                        'last_reset_date' => now(),
                    ]);
                }

                $count++;

                Log::warning('Overdue subscription force-downgraded to FREE', [
                    'subscription_id' => $subscription->id,
                    'company_id' => $subscription->company_id,
                ]);
            });
        }

        $this->info("Downgraded {$count} overdue subscriptions to FREE.");

        return self::SUCCESS;
    }
}
