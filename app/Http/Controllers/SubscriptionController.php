<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    /**
     * Afficher la page d'abonnement et crédits
     */
    public function index()
    {
        $company = Auth::user()->company;
        $subscription = $company?->subscription;
        $credits = $subscription?->credits;
        $plans = Plan::active()->orderBy('sort_order')->get();
        $feedbacksThisMonth = $company
            ? $company->feedbackRequests()->whereMonth('created_at', now()->month)->count()
            : 0;
        $maxFeedbacks = $subscription?->plan?->max_feedbacks;
        $feedbacksRemaining = $maxFeedbacks !== null
            ? max(0, $maxFeedbacks - $feedbacksThisMonth)
            : null;

        // Vérifier si l'abonnement Stripe est en annulation programmée
        $cancelAtPeriodEnd = false;
        if ($subscription && $subscription->stripe_subscription_id) {
            try {
                $stripe = new StripeClient(config('services.stripe.secret'));
                $stripeSub = $stripe->subscriptions->retrieve($subscription->stripe_subscription_id);
                $cancelAtPeriodEnd = $stripeSub->cancel_at_period_end ?? false;
            } catch (\Throwable $e) {
                // Si erreur Stripe, on continue sans bloquer
            }
        }

        return Inertia::render('Subscription', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan' => $subscription->plan?->toArray(),
                'status' => $subscription->status,
                'ends_at' => $subscription->ends_at,
                'has_stripe_subscription' => !empty($subscription->stripe_subscription_id),
                'cancel_at_period_end' => $cancelAtPeriodEnd,
                'limits' => [
                    'feedbacks_used' => $feedbacksThisMonth,
                    'feedbacks_limit' => $maxFeedbacks,
                    'feedbacks_remaining' => $feedbacksRemaining,
                ],
            ] : null,
            'credits' => $credits ? [
                'credits_monthly' => $credits->credits_monthly,
                'credits_used_monthly' => $credits->credits_used_monthly,
                'credits_available_monthly' => $credits->credits_available_monthly,
                'credits_addon_balance' => $credits->credits_addon_balance,
                'credits_total_available' => $credits->credits_total_available,
                'last_reset_date' => $credits->last_reset_date,
            ] : null,
            'plans' => $plans,
        ]);
    }

    /**
     * Upgrader vers un plan (page de confirmation)
     */
    public function upgrade($planId)
    {
        $company = Auth::user()->company;
        $plan = Plan::where('id', $planId)->where('is_active', true)->firstOrFail();
        $subscription = $company?->subscription;

        // Vérifier que c'est un upgrade (pas le même plan)
        if ($subscription && $subscription->plan_id === $plan->id) {
            return back()->with('error', 'Vous êtes déjà sur ce plan.');
        }

        return Inertia::render('UpgradePlan', [
            'currentPlan' => $subscription?->plan,
            'newPlan' => $plan,
            'subscription' => $subscription,
        ]);
    }

    /**
     * Confirmer l'upgrade (sans Stripe pour l'instant)
     */
    public function confirmUpgrade($planId)
    {
        $company = Auth::user()->company;
        $plan = Plan::where('id', $planId)->where('is_active', true)->firstOrFail();
        $subscription = $company?->subscription;

        // Les plans payants doivent passer par Stripe Checkout
        if ($plan->slug !== 'free') {
            return redirect()->route('subscription.upgrade', ['planId' => $plan->id])
                ->with('error', 'Pour un plan payant, utilisez le paiement Stripe.');
        }

        // Créer la subscription si elle n'existe pas
        if (!$subscription) {
            $subscription = $company->subscription()->create([
                'plan_id' => $plan->id,
                'status' => 'active',
            ]);
        } else {
            // Mettre à jour le plan
            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
            ]);
        }

        // Mettre à jour/réinitialiser les crédits
        $credits = $subscription->credits;
        if (!$credits) {
            $subscription->credits()->create([
                'credits_monthly' => $plan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $plan->credits_monthly,
                'credits_addon_balance' => 0,
                'credits_total_available' => $plan->credits_monthly,
                'last_reset_date' => now(),
            ]);
        } else {
            // Reset les crédits mensuels mais garde les add-ons
            $credits->update([
                'credits_monthly' => $plan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $plan->credits_monthly,
                'credits_total_available' => $plan->credits_monthly + $credits->credits_addon_balance,
                'last_reset_date' => now(),
            ]);
        }

        return redirect()->route('subscription.index')
            ->with('success', "Vous avez été upgradé vers le plan {$plan->name} ! 🎉");
    }

    /**
     * Rediriger vers le Stripe Customer Portal
     */
    public function portal()
    {
        $company = Auth::user()->company;
        $subscription = $company?->subscription;

        if (!$subscription) {
            return back()->with('error', 'Aucune subscription trouvée.');
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        try {
            // Créer automatiquement le customer Stripe si manquant
            if (!$company->stripe_customer_id) {
                $customer = $stripe->customers->create([
                    'email' => Auth::user()->email,
                    'name' => $company->name,
                    'metadata' => [
                        'company_id' => $company->id,
                        'user_id' => Auth::id(),
                    ],
                ]);

                $company->update(['stripe_customer_id' => $customer->id]);
                $company->refresh();
            }

            // Synchroniser l'ID d'abonnement Stripe si manquant
            if (empty($subscription?->stripe_subscription_id) && !empty($company->stripe_customer_id)) {
                $stripeSubscriptions = $stripe->subscriptions->all([
                    'customer' => $company->stripe_customer_id,
                    'status' => 'all',
                    'limit' => 10,
                ]);

                $activeOrLatest = collect($stripeSubscriptions->data ?? [])
                    ->first(function ($sub) {
                        return in_array($sub->status ?? null, ['active', 'trialing', 'past_due', 'unpaid'], true);
                    });

                if (!$activeOrLatest) {
                    $activeOrLatest = ($stripeSubscriptions->data ?? [])[0] ?? null;
                }

                if ($activeOrLatest && !empty($subscription)) {
                    $subscription->update([
                        'stripe_subscription_id' => $activeOrLatest->id,
                        'status' => $activeOrLatest->status ?? $subscription->status,
                        'ends_at' => !empty($activeOrLatest->current_period_end)
                            ? now()->setTimestamp((int) $activeOrLatest->current_period_end)
                            : $subscription->ends_at,
                    ]);
                    $subscription->refresh();
                }
            }

            // Ouvrir le portail général Stripe (gestion factures, méthode paiement, annulation)
            $session = $stripe->billingPortal->sessions->create([
                'customer' => $company->stripe_customer_id,
                'return_url' => route('subscription.index'),
            ]);

            return redirect()->away($session->url);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Stripe Portal Error', [
                'company_id' => $company->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'Erreur d\'accès au portail. ' . $e->getMessage());
        }
    }

}
