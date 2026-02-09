<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionCredits;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CompanyObserver
{
    /**
     * Handle the Company "created" event.
     * Auto-assign FREE plan and initialize credits
     */
    public function created(Company $company): void
    {
        try {
            // Récupérer le plan FREE
            $freePlan = Plan::where('slug', 'free')->first();

            if (!$freePlan) {
                Log::error('Plan FREE not found during company onboarding', [
                    'company_id' => $company->id,
                ]);
                return;
            }

            // Créer la subscription FREE
            $subscription = Subscription::create([
                'company_id' => $company->id,
                'plan_id' => $freePlan->id,
                'status' => 'active',
                'starts_at' => Carbon::now(),
                'ends_at' => null, // FREE plan n'expire jamais
            ]);

            // Initialiser les crédits avec le quota mensuel du plan FREE
            SubscriptionCredits::create([
                'subscription_id' => $subscription->id,
                'credits_monthly' => $freePlan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $freePlan->credits_monthly, // Available = monthly - used
                'credits_addon_balance' => 0,
                'credits_total_available' => $freePlan->credits_monthly, // Total = available + addons
                'last_reset_date' => Carbon::now(),
            ]);

            Log::info('Company onboarded successfully with FREE plan', [
                'company_id' => $company->id,
                'subscription_id' => $subscription->id,
                'credits_monthly' => $freePlan->credits_monthly,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to onboard company with FREE plan', [
                'company_id' => $company->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
