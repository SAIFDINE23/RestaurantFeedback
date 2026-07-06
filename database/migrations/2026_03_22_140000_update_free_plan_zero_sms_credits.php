<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * FREE plan : 0 SMS, 0 crédits, emails limités (max_feedbacks=20).
     * Les plans BASIC (100) et PRO (200) restent inchangés.
     */
    public function up(): void
    {
        // 1. Mettre à jour le plan FREE
        DB::table('plans')
            ->where('slug', 'free')
            ->update([
                'sms_quota_monthly' => 0,
                'credits_monthly'   => 0,
                'email_unlimited'   => false,
                'updated_at'        => now(),
            ]);

        // 2. Synchroniser les crédits des abonnements FREE existants
        $freeSubscriptionIds = DB::table('subscriptions')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->where('plans.slug', 'free')
            ->pluck('subscriptions.id');

        if ($freeSubscriptionIds->isNotEmpty()) {
            DB::table('subscription_credits')
                ->whereIn('subscription_id', $freeSubscriptionIds)
                ->update([
                    'credits_monthly'           => 0,
                    'credits_used_monthly'      => 0,
                    'credits_available_monthly'  => 0,
                    'credits_total_available'    => DB::raw('GREATEST(0, credits_addon_balance)'),
                    'last_reset_date'           => now(),
                    'updated_at'                => now(),
                ]);
        }
    }

    /**
     * Rollback : remettre FREE à 10 crédits (état précédent).
     */
    public function down(): void
    {
        DB::table('plans')
            ->where('slug', 'free')
            ->update([
                'sms_quota_monthly' => 10,
                'credits_monthly'   => 10,
                'email_unlimited'   => true,
                'updated_at'        => now(),
            ]);

        $freeSubscriptionIds = DB::table('subscriptions')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->where('plans.slug', 'free')
            ->pluck('subscriptions.id');

        if ($freeSubscriptionIds->isNotEmpty()) {
            DB::table('subscription_credits')
                ->whereIn('subscription_id', $freeSubscriptionIds)
                ->update([
                    'credits_monthly'           => 10,
                    'credits_used_monthly'      => 0,
                    'credits_available_monthly'  => 10,
                    'credits_total_available'    => DB::raw('10 + GREATEST(0, credits_addon_balance)'),
                    'last_reset_date'           => now(),
                    'updated_at'                => now(),
                ]);
        }
    }
};
