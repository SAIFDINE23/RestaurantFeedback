<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Plan;
use App\Models\StripeEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function checkoutPlan(int $planId)
    {
        $user = Auth::user();
        $company = $user->company;
        $plan = Plan::where('id', $planId)->where('is_active', true)->firstOrFail();

        if ($plan->slug === 'free') {
            return redirect()->route('subscription.index')
                ->with('error', 'Le plan FREE ne nécessite pas de paiement.');
        }

        $priceId = config("services.stripe.prices.{$plan->slug}");
        if (!$priceId) {
            abort(500, 'Stripe price not configured for this plan.');
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        if (!$company->stripe_customer_id) {
            $customer = $stripe->customers->create([
                'email' => $user->email,
                'name' => $company->name,
                'metadata' => [
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                ],
            ]);

            $company->update(['stripe_customer_id' => $customer->id]);
        }

        $session = $stripe->checkout->sessions->create([
            'mode' => 'subscription',
            'customer' => $company->stripe_customer_id,
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1,
            ]],
            'success_url' => route('stripe.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('stripe.cancel'),
            'metadata' => [
                'type' => 'plan',
                'plan_id' => $plan->id,
                'company_id' => $company->id,
                'user_id' => $user->id,
            ],
        ]);

        return redirect()->away($session->url);
    }

    public function checkoutAddon(string $addonId)
    {
        $user = Auth::user();
        $company = $user->company;
        $addon = config("services.stripe.addons.{$addonId}");

        if (!$addon || empty($addon['price'])) {
            abort(500, 'Stripe add-on not configured.');
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        if (!$company->stripe_customer_id) {
            $customer = $stripe->customers->create([
                'email' => $user->email,
                'name' => $company->name,
                'metadata' => [
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                ],
            ]);

            $company->update(['stripe_customer_id' => $customer->id]);
        }

        $session = $stripe->checkout->sessions->create([
            'mode' => 'payment',
            'customer' => $company->stripe_customer_id,
            'line_items' => [[
                'price' => $addon['price'],
                'quantity' => 1,
            ]],
            'success_url' => route('stripe.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('stripe.cancel'),
            'metadata' => [
                'type' => 'addon',
                'addon_id' => $addonId,
                'company_id' => $company->id,
                'user_id' => $user->id,
            ],
        ]);

        return redirect()->away($session->url);
    }

    public function success()
    {
        return redirect()->route('subscription.index')
            ->with('success', 'Paiement reçu. Votre abonnement/crédits seront mis à jour.');
    }

    public function cancel()
    {
        return redirect()->route('subscription.index')
            ->with('error', 'Paiement annulé. Aucune modification n’a été appliquée.');
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Throwable $e) {
            Log::error('Stripe webhook signature error: ' . $e->getMessage());
            return response('Invalid payload', 400);
        }

        // Idempotence
        if (StripeEvent::where('event_id', $event->id)->exists()) {
            return response('ok', 200);
        }

        StripeEvent::create([
            'event_id' => $event->id,
            'type' => $event->type,
            'payload' => $event->data->object ?? null,
            'received_at' => now(),
        ]);

        Log::info('Stripe webhook received', [
            'type' => $event->type,
            'event_id' => $event->id,
        ]);

        try {
            switch ($event->type) {
                case 'checkout.session.completed':
                    $session = $event->data->object;
                    $this->handleCheckoutCompleted($session);
                    break;

                case 'invoice.payment_succeeded':
                    $invoice = $event->data->object;
                    $this->handleInvoicePaymentSucceeded($invoice);
                    break;

                case 'invoice.payment_failed':
                    $invoice = $event->data->object;
                    $this->handleInvoicePaymentFailed($invoice);
                    break;

                case 'customer.subscription.deleted':
                    $subscription = $event->data->object;
                    $this->handleSubscriptionCanceled($subscription);
                    break;
            }
        } catch (\Throwable $e) {
            Log::error('Stripe webhook handler error: ' . $e->getMessage(), [
                'event_type' => $event->type,
                'trace' => $e->getTraceAsString(),
            ]);
            return response('Handler error', 500);
        }

        return response('ok', 200);
    }

    protected function handleCheckoutCompleted($session): void
    {
        $metadata = (array) ($session->metadata ?? []);
        $type = $metadata['type'] ?? null;

        Log::info('Stripe checkout.session.completed metadata', [
            'session_id' => $session->id ?? null,
            'mode' => $session->mode ?? null,
            'metadata' => $metadata,
        ]);

        if ($type === 'plan') {
            $this->applyPlanUpgrade(
                $metadata['company_id'] ?? null,
                $metadata['plan_id'] ?? null,
                $session->subscription ?? null,
                $session->customer ?? null
            );
            return;
        }

        if ($type === 'addon') {
            $this->applyAddonCredits(
                $metadata['company_id'] ?? null,
                $metadata['addon_id'] ?? null
            );
            return;
        }

        // Fallback si metadata absente : déduire le plan via le price id
        if (($session->mode ?? null) === 'subscription') {
            $this->applyPlanFromSession($session);
            return;
        }

        // Fallback si metadata absente : déduire l'add-on via le price id
        if (($session->mode ?? null) === 'payment') {
            $this->applyAddonCreditsFromSession($session);
        }
    }

    protected function applyPlanFromSession($session): void
    {
        $companyId = $session->metadata->company_id ?? null;
        if (!$companyId && !empty($session->customer)) {
            $companyId = Company::where('stripe_customer_id', $session->customer)->value('id');
        }
        if (!$companyId) {
            return;
        }

        if (empty($session->subscription)) {
            return;
        }

        $stripe = new StripeClient(config('services.stripe.secret'));
        $stripeSub = $stripe->subscriptions->retrieve($session->subscription, ['expand' => ['items.data.price']]);
        $priceId = $stripeSub->items->data[0]->price->id ?? null;
        if (!$priceId) {
            return;
        }

        $planId = $this->resolvePlanIdByPrice($priceId);
        if (!$planId) {
            return;
        }

        $this->applyPlanUpgrade($companyId, $planId, $session->subscription, $session->customer ?? null);
    }

    protected function applyAddonCreditsFromSession($session): void
    {
        $companyId = $session->metadata->company_id ?? null;
        if (!$companyId && !empty($session->customer)) {
            $companyId = Company::where('stripe_customer_id', $session->customer)->value('id');
        }
        if (!$companyId) {
            return;
        }

        $stripe = new StripeClient(config('services.stripe.secret'));
        $lineItems = $stripe->checkout->sessions->allLineItems($session->id, ['limit' => 1]);
        $priceId = $lineItems->data[0]->price->id ?? null;

        if (!$priceId) {
            return;
        }

        $addonId = $this->resolveAddonIdByPrice($priceId);
        if (!$addonId) {
            return;
        }

        $this->applyAddonCredits($companyId, $addonId);
    }

    protected function resolveAddonIdByPrice(string $priceId): ?string
    {
        $addons = config('services.stripe.addons');
        foreach ($addons as $key => $addon) {
            if (!empty($addon['price']) && $addon['price'] === $priceId) {
                return (string) $key;
            }
        }

        return null;
    }

    protected function resolvePlanIdByPrice(string $priceId): ?int
    {
        $prices = config('services.stripe.prices');
        foreach ($prices as $slug => $configuredPriceId) {
            if ($configuredPriceId === $priceId) {
                return Plan::where('slug', $slug)->value('id');
            }
        }

        return null;
    }

    protected function handleInvoicePaymentSucceeded($invoice): void
    {
        if (empty($invoice->subscription)) {
            return;
        }

        $subscription = \App\Models\Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
        if (!$subscription || !$subscription->plan || !$subscription->credits) {
            return;
        }

        $subscription->credits->update([
            'credits_monthly' => $subscription->plan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $subscription->plan->credits_monthly,
            'credits_total_available' => $subscription->plan->credits_monthly + $subscription->credits->credits_addon_balance,
            'last_reset_date' => now(),
        ]);
    }

    protected function applyPlanUpgrade($companyId, $planId, $stripeSubscriptionId = null, $stripeCustomerId = null): void
    {
        if (!$companyId || !$planId) {
            return;
        }

        $company = Company::find($companyId);
        $plan = Plan::find($planId);

        if (!$company || !$plan) {
            return;
        }

        if ($stripeCustomerId && !$company->stripe_customer_id) {
            $company->update(['stripe_customer_id' => $stripeCustomerId]);
        }

        $subscription = $company->subscription;

        if (!$subscription) {
            $subscription = $company->subscription()->create([
                'plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
                'stripe_subscription_id' => $stripeSubscriptionId,
            ]);
        } else {
            $subscription->update([
                'plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
                'stripe_subscription_id' => $stripeSubscriptionId ?? $subscription->stripe_subscription_id,
            ]);
        }

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
            $credits->update([
                'credits_monthly' => $plan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $plan->credits_monthly,
                'credits_total_available' => $plan->credits_monthly + $credits->credits_addon_balance,
                'last_reset_date' => now(),
            ]);
        }
    }

    protected function applyAddonCredits($companyId, $addonId): void
    {
        if (!$companyId || !$addonId) {
            return;
        }

        $addon = config("services.stripe.addons.{$addonId}");
        if (!$addon || empty($addon['credits'])) {
            return;
        }

        $company = Company::find($companyId);
        if (!$company || !$company->subscription || !$company->subscription->credits) {
            return;
        }

        $company->subscription->credits->addAddonCredits((float) $addon['credits']);
    }

    protected function handleSubscriptionCanceled($stripeSubscription): void
    {
        if (empty($stripeSubscription->id)) {
            return;
        }

        $subscription = \App\Models\Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if (!$subscription) {
            return;
        }

        // Récupérer le plan FREE
        $freePlan = Plan::where('slug', 'free')->first();
        if (!$freePlan) {
            Log::error('Plan FREE not found during subscription cancellation', [
                'subscription_id' => $subscription->id,
            ]);
            return;
        }

        // Mettre à jour le plan vers FREE
        $subscription->update([
            'plan_id' => $freePlan->id,
            'status' => 'canceled',
        ]);

        // Réinitialiser les crédits mensuels au quota du plan FREE, mais garder les add-ons
        if ($subscription->credits) {
            $subscription->credits->update([
                'credits_monthly' => $freePlan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $freePlan->credits_monthly,
                'credits_total_available' => $freePlan->credits_monthly + $subscription->credits->credits_addon_balance,
                'last_reset_date' => now(),
            ]);
        } else {
            // Créer les crédits s'ils n'existent pas
            $subscription->credits()->create([
                'credits_monthly' => $freePlan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $freePlan->credits_monthly,
                'credits_addon_balance' => 0,
                'credits_total_available' => $freePlan->credits_monthly,
                'last_reset_date' => now(),
            ]);
        }

        Log::info('Subscription canceled and downgraded to FREE', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'stripe_subscription_id' => $stripeSubscription->id,
        ]);
    }

    protected function handleInvoicePaymentFailed($invoice): void
    {
        if (empty($invoice->subscription)) {
            return;
        }

        $subscription = \App\Models\Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
        if (!$subscription) {
            return;
        }

        // Mark subscription as past_due (Stripe automatically does this, but we can log/alert)
        $subscription->update([
            'status' => 'past_due',
        ]);

        Log::warning('Stripe invoice payment failed', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'stripe_subscription_id' => $invoice->subscription,
            'invoice_id' => $invoice->id,
            'reason' => $invoice->last_payment_error?->message ?? 'Unknown',
        ]);

        // TODO: Send email to company (payment failed warning)
    }
}
