<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $creditsBySlug = [
            'free'  => 10,
            'basic' => 100,
            'pro'   => 200,
        ];

        foreach ($creditsBySlug as $slug => $credits) {
            DB::table('plans')
                ->where('slug', $slug)
                ->update([
                    'sms_quota_monthly' => $credits,
                    'credits_monthly'   => $credits,
                    'updated_at'        => now(),
                ]);
        }

        // Synchroniser les crédits mensuels des subscriptions actives
        $subscriptions = DB::table('subscriptions')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->whereIn('plans.slug', array_keys($creditsBySlug))
            ->select('subscriptions.id as subscription_id', 'plans.credits_monthly')
            ->get();

        foreach ($subscriptions as $sub) {
            $c = (float) $sub->credits_monthly;

            DB::table('subscription_credits')
                ->where('subscription_id', $sub->subscription_id)
                ->update([
                    'credits_monthly'           => $c,
                    'credits_used_monthly'      => 0,
                    'credits_available_monthly'  => $c,
                    'credits_total_available'    => DB::raw($c . ' + GREATEST(0, credits_addon_balance)'),
                    'last_reset_date'           => now(),
                    'updated_at'                => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $defaultsBySlug = [
            'free' => 20,
            'basic' => 200,
            'pro' => 400,
        ];

        foreach ($defaultsBySlug as $slug => $credits) {
            DB::table('plans')
                ->where('slug', $slug)
                ->update([
                    'sms_quota_monthly' => $credits,
                    'credits_monthly' => $credits,
                    'updated_at' => now(),
                ]);
        }

        // Recalage des crédits abonnements sur le quota du plan après rollback
        $subscriptions = DB::table('subscriptions')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->whereIn('plans.slug', array_keys($defaultsBySlug))
            ->select('subscriptions.id as subscription_id', 'plans.credits_monthly')
            ->get();

        foreach ($subscriptions as $subscription) {
            $credits = (float) $subscription->credits_monthly;

            DB::table('subscription_credits')
                ->where('subscription_id', $subscription->subscription_id)
                ->update([
                    'credits_monthly' => $credits,
                    'credits_used_monthly' => 0,
                    'credits_available_monthly' => $credits,
                    'credits_total_available' => DB::raw($credits . ' + GREATEST(0, credits_addon_balance)'),
                    'last_reset_date' => now(),
                    'updated_at' => now(),
                ]);
        }
    }
};
