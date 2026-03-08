<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Plan;
use App\Models\StripeEvent;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeController extends Controller
{
    /**
     * IDs d'add-ons autorisés (whitelist stricte)
     */
    private const ALLOWED_ADDON_IDS = ['100', '300', '1000'];

    /**
     * Extraire current_period_end d'un objet subscription Stripe.
     * Les versions récentes de l'API Stripe ont déplacé ce champ dans items.data[0].
     */
    protected static function extractPeriodEnd($stripeSubscription): ?int
    {
        // Nouvelle API : current_period_end est dans les items
        $fromItem = $stripeSubscription->items->data[0]->current_period_end ?? null;
        if ($fromItem) {
            return (int) $fromItem;
        }

        // Ancienne API : directement sur l'objet subscription
        $fromSub = $stripeSubscription->current_period_end ?? null;
        if ($fromSub && (int) $fromSub > time()) {
            return (int) $fromSub;
        }

        return null;
    }

    // ─── CHECKOUT ────────────────────────────────────────────────

    public function checkoutPlan(int $planId)
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return redirect()->route('subscription.index')
                ->with('error', 'Aucune entreprise associée à votre compte.');
        }

        $plan = Plan::where('id', $planId)->where('is_active', true)->firstOrFail();

        if ($plan->slug === 'free') {
            return redirect()->route('subscription.index')
                ->with('error', 'Le plan FREE ne nécessite pas de paiement.');
        }

        // Empêcher l'achat du même plan
        $currentSubscription = $company->subscription;
        if ($currentSubscription && $currentSubscription->plan_id === $plan->id && $currentSubscription->isActive()) {
            return redirect()->route('subscription.index')
                ->with('error', 'Vous êtes déjà abonné à ce plan.');
        }

        $priceId = config("services.stripe.prices.{$plan->slug}");
        if (!$priceId) {
            Log::error('Stripe price not configured', ['plan_slug' => $plan->slug]);
            return redirect()->route('subscription.index')
                ->with('error', 'Erreur de configuration du plan. Contactez le support.');
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        $this->ensureStripeCustomer($stripe, $company, $user);

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
            'subscription_data' => [
                'metadata' => [
                    'company_id' => $company->id,
                    'plan_id' => $plan->id,
                ],
            ],
            'allow_promotion_codes' => true,
        ]);

        return redirect()->away($session->url);
    }

    public function checkoutAddon(string $addonId)
    {
        // Validation stricte de l'addon ID (whitelist)
        if (!in_array($addonId, self::ALLOWED_ADDON_IDS, true)) {
            Log::warning('Invalid addon ID attempted', ['addon_id' => $addonId, 'user_id' => Auth::id()]);
            abort(400, 'Add-on invalide.');
        }

        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return redirect()->route('subscription.index')
                ->with('error', 'Aucune entreprise associée à votre compte.');
        }

        // Vérifier que l'user a une subscription active
        if (!$company->hasActiveSubscription()) {
            return redirect()->route('subscription.index')
                ->with('error', 'Vous devez avoir un abonnement actif pour acheter des add-ons.');
        }

        $addon = config("services.stripe.addons.{$addonId}");

        if (!$addon || empty($addon['price'])) {
            Log::error('Stripe add-on not configured', ['addon_id' => $addonId]);
            return redirect()->route('subscription.index')
                ->with('error', 'Add-on non configuré. Contactez le support.');
        }

        $stripe = new StripeClient(config('services.stripe.secret'));

        $this->ensureStripeCustomer($stripe, $company, $user);

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
            ->with('success', 'Paiement reçu avec succès ! Vos crédits/abonnement seront mis à jour sous quelques secondes.');
    }

    public function cancel()
    {
        return redirect()->route('subscription.index')
            ->with('error', "Paiement annulé. Aucune modification n'a été appliquée.");
    }

    // ─── WEBHOOK ─────────────────────────────────────────────────

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        // Vérification que le webhook secret est configuré
        if (empty($secret)) {
            Log::critical('STRIPE_WEBHOOK_SECRET is not configured!');
            return response('Webhook secret not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::warning('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
            ]);
            return response('Invalid signature', 400);
        } catch (\Throwable $e) {
            Log::error('Stripe webhook payload error', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        }

        // Idempotence — éviter le traitement en double
        if (StripeEvent::where('event_id', $event->id)->exists()) {
            Log::debug('Stripe event already processed', ['event_id' => $event->id]);
            return response('Already processed', 200);
        }

        // Enregistrer l'événement pour idempotence
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
            match ($event->type) {
                'checkout.session.completed' => $this->handleCheckoutCompleted($event->data->object),
                'customer.subscription.created' => $this->handleSubscriptionCreated($event->data->object),
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
                'customer.subscription.deleted' => $this->handleSubscriptionCanceled($event->data->object),
                'invoice.payment_succeeded' => $this->handleInvoicePaymentSucceeded($event->data->object),
                'invoice.payment_failed' => $this->handleInvoicePaymentFailed($event->data->object),
                default => Log::debug('Unhandled Stripe event type', ['type' => $event->type]),
            };
        } catch (\Throwable $e) {
            Log::error('Stripe webhook handler error', [
                'event_type' => $event->type,
                'event_id' => $event->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Return 200 même en cas d'erreur pour éviter les retries infinis de Stripe
            // L'événement est déjà enregistré, on pourra le retraiter manuellement
            return response('Handler error (logged)', 200);
        }

        return response('ok', 200);
    }

    // ─── WEBHOOK HANDLERS ────────────────────────────────────────

    protected function handleCheckoutCompleted($session): void
    {
        $metadata = (array) ($session->metadata ?? []);
        $type = $metadata['type'] ?? null;

        Log::info('Stripe checkout.session.completed', [
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

        // Fallback : déduire le plan/addon via le price id si metadata absente
        if (($session->mode ?? null) === 'subscription') {
            $this->applyPlanFromSession($session);
        } elseif (($session->mode ?? null) === 'payment') {
            $this->applyAddonCreditsFromSession($session);
        }
    }

    protected function handleSubscriptionCreated($stripeSubscription): void
    {
        $this->syncSubscriptionFromStripe($stripeSubscription, 'created');
    }

    protected function handleSubscriptionUpdated($stripeSubscription): void
    {
        $this->syncSubscriptionFromStripe($stripeSubscription, 'updated');
    }

    /**
     * Synchronise l'état de la souscription Stripe vers notre DB
     * Gère: changement de plan, statut, annulation programmée (cancel_at_period_end)
     */
    protected function syncSubscriptionFromStripe($stripeSubscription, string $eventContext = 'unknown'): void
    {
        if (empty($stripeSubscription->id)) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        // Fallback par customer Stripe
        if (!$subscription && !empty($stripeSubscription->customer)) {
            $company = Company::where('stripe_customer_id', $stripeSubscription->customer)->first();
            if ($company) {
                $subscription = $company->subscription;
                if ($subscription && empty($subscription->stripe_subscription_id)) {
                    $subscription->update(['stripe_subscription_id' => $stripeSubscription->id]);
                }
            }
        }

        if (!$subscription) {
            Log::warning("Stripe subscription {$eventContext}: local subscription not found", [
                'stripe_subscription_id' => $stripeSubscription->id,
                'customer' => $stripeSubscription->customer ?? null,
            ]);
            return;
        }

        // Déduire le plan depuis le price id
        $priceId = $stripeSubscription->items->data[0]->price->id ?? null;
        $resolvedPlanId = $priceId ? $this->resolvePlanIdByPrice($priceId) : null;

        // Déterminer le statut local basé sur Stripe
        $stripeStatus = $stripeSubscription->status ?? $subscription->status;
        $cancelAtPeriodEnd = $stripeSubscription->cancel_at_period_end ?? false;

        // Si cancel_at_period_end=true, le statut reste "active" — le vrai downgrade
        // se fera quand customer.subscription.deleted arrivera
        $localStatus = $stripeStatus;

        $updatePayload = [
            'status' => $localStatus,
            'stripe_subscription_id' => $stripeSubscription->id,
        ];

        $periodEnd = self::extractPeriodEnd($stripeSubscription);
        if ($periodEnd) {
            $updatePayload['ends_at'] = now()->setTimestamp($periodEnd);
        }

        // Changement de plan (upgrade/downgrade via Stripe)
        $planChanged = false;
        if ($resolvedPlanId && $resolvedPlanId !== $subscription->plan_id) {
            $updatePayload['plan_id'] = $resolvedPlanId;
            $planChanged = true;
        }

        $subscription->update($updatePayload);

        // Si le plan a changé, mettre à jour les crédits
        if ($planChanged) {
            $newPlan = Plan::find($resolvedPlanId);
            if ($newPlan && $subscription->credits) {
                $subscription->credits->update([
                    'credits_monthly' => $newPlan->credits_monthly,
                    'credits_used_monthly' => 0,
                    'credits_available_monthly' => $newPlan->credits_monthly,
                    'credits_total_available' => $newPlan->credits_monthly + max(0, $subscription->credits->credits_addon_balance),
                    'last_reset_date' => now(),
                ]);
            }
        }

        // S'assurer que les crédits existent
        if ($subscription->plan && !$subscription->credits) {
            $subscription->credits()->create([
                'credits_monthly' => $subscription->plan->credits_monthly,
                'credits_used_monthly' => 0,
                'credits_available_monthly' => $subscription->plan->credits_monthly,
                'credits_addon_balance' => 0,
                'credits_total_available' => $subscription->plan->credits_monthly,
                'last_reset_date' => now(),
            ]);
        }

        Log::info("Stripe subscription {$eventContext} synchronized", [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'stripe_subscription_id' => $stripeSubscription->id,
            'status' => $localStatus,
            'cancel_at_period_end' => $cancelAtPeriodEnd,
            'plan_changed' => $planChanged,
            'plan_id' => $resolvedPlanId,
        ]);
    }

    /**
     * Invoice payment succeeded — gère le renouvellement mensuel
     * Différencie premier paiement vs renouvellement
     */
    protected function handleInvoicePaymentSucceeded($invoice): void
    {
        if (empty($invoice->subscription)) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
        if (!$subscription || !$subscription->plan || !$subscription->credits) {
            return;
        }

        $billingReason = $invoice->billing_reason ?? 'unknown';

        if ($billingReason === 'subscription_cycle') {
            // RENOUVELLEMENT → reset des crédits mensuels
            DB::transaction(function () use ($subscription) {
                $credits = $subscription->credits()->lockForUpdate()->first();
                if (!$credits) {
                    return;
                }

                $credits->update([
                    'credits_monthly' => $subscription->plan->credits_monthly,
                    'credits_used_monthly' => 0,
                    'credits_available_monthly' => $subscription->plan->credits_monthly,
                    'credits_total_available' => $subscription->plan->credits_monthly + max(0, $credits->credits_addon_balance),
                    'last_reset_date' => now(),
                ]);
            });

            if ($subscription->status !== 'active') {
                $subscription->update(['status' => 'active']);
            }

            Log::info('Monthly subscription renewed - credits reset', [
                'subscription_id' => $subscription->id,
                'company_id' => $subscription->company_id,
                'plan' => $subscription->plan->slug,
            ]);
        } elseif ($billingReason === 'subscription_create') {
            Log::info('Initial subscription payment confirmed', [
                'subscription_id' => $subscription->id,
                'company_id' => $subscription->company_id,
            ]);
        } else {
            Log::info('Invoice payment succeeded', [
                'subscription_id' => $subscription->id,
                'billing_reason' => $billingReason,
            ]);
        }
    }

    /**
     * Annulation effective (subscription.deleted)
     * Se déclenche APRÈS la fin de période si cancel_at_period_end=true
     */
    protected function handleSubscriptionCanceled($stripeSubscription): void
    {
        if (empty($stripeSubscription->id)) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if (!$subscription) {
            Log::warning('Subscription cancel: local subscription not found', [
                'stripe_subscription_id' => $stripeSubscription->id,
            ]);
            return;
        }

        $freePlan = Plan::where('slug', 'free')->first();
        if (!$freePlan) {
            Log::critical('Plan FREE not found during subscription cancellation!');
            return;
        }

        DB::transaction(function () use ($subscription, $freePlan) {
            $subscription->update([
                'plan_id' => $freePlan->id,
                'status' => 'active', // Actif sur FREE — l'user peut toujours utiliser le plan gratuit
                'stripe_subscription_id' => null,
                'ends_at' => null, // FREE n'expire jamais
            ]);

            if ($subscription->credits) {
                $credits = $subscription->credits()->lockForUpdate()->first();
                $addonBalance = max(0, $credits->credits_addon_balance ?? 0);

                $credits->update([
                    'credits_monthly' => $freePlan->credits_monthly,
                    'credits_used_monthly' => 0,
                    'credits_available_monthly' => $freePlan->credits_monthly,
                    'credits_total_available' => $freePlan->credits_monthly + $addonBalance,
                    'last_reset_date' => now(),
                ]);
            } else {
                $subscription->credits()->create([
                    'credits_monthly' => $freePlan->credits_monthly,
                    'credits_used_monthly' => 0,
                    'credits_available_monthly' => $freePlan->credits_monthly,
                    'credits_addon_balance' => 0,
                    'credits_total_available' => $freePlan->credits_monthly,
                    'last_reset_date' => now(),
                ]);
            }
        });

        Log::info('Subscription canceled — downgraded to FREE', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'stripe_subscription_id' => $stripeSubscription->id,
        ]);
    }

    /**
     * Paiement échoué — marquer past_due et envoyer notification
     */
    protected function handleInvoicePaymentFailed($invoice): void
    {
        if (empty($invoice->subscription)) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
        if (!$subscription) {
            return;
        }

        $subscription->update(['status' => 'past_due']);

        // Envoyer un email d'alerte au propriétaire
        try {
            $company = $subscription->company;
            $user = $company?->user;

            if ($user && $user->email) {
                Mail::to($user->email)->send(
                    new \App\Mail\PaymentFailedMail($user, $company, $subscription)
                );
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send payment failed email', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscription->id,
            ]);
        }

        Log::warning('Invoice payment failed', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'invoice_id' => $invoice->id ?? null,
            'attempt_count' => $invoice->attempt_count ?? null,
            'reason' => $invoice->last_payment_error?->message ?? 'Unknown',
        ]);
    }

    // ─── PLAN / ADDON HELPERS ────────────────────────────────────

    protected function applyPlanUpgrade($companyId, $planId, $stripeSubscriptionId = null, $stripeCustomerId = null): void
    {
        if (!$companyId || !$planId) {
            Log::warning('applyPlanUpgrade: missing companyId or planId', compact('companyId', 'planId'));
            return;
        }

        $company = Company::find($companyId);
        $plan = Plan::find($planId);

        if (!$company || !$plan) {
            Log::warning('applyPlanUpgrade: company or plan not found', compact('companyId', 'planId'));
            return;
        }

        if ($stripeCustomerId && !$company->stripe_customer_id) {
            $company->update(['stripe_customer_id' => $stripeCustomerId]);
        }

        // Récupérer ends_at depuis Stripe si possible
        $endsAt = null;
        if ($stripeSubscriptionId) {
            try {
                $stripe = new StripeClient(config('services.stripe.secret'));
                $stripeSub = $stripe->subscriptions->retrieve($stripeSubscriptionId);
                $periodEnd = self::extractPeriodEnd($stripeSub);
                if ($periodEnd) {
                    $endsAt = now()->setTimestamp($periodEnd);
                }
            } catch (\Throwable $e) {
                Log::warning('Could not fetch Stripe subscription for ends_at', [
                    'stripe_subscription_id' => $stripeSubscriptionId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        DB::transaction(function () use ($company, $plan, $stripeSubscriptionId, $endsAt) {
            $subscription = $company->subscription;

            if (!$subscription) {
                $subscription = $company->subscription()->create([
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'stripe_subscription_id' => $stripeSubscriptionId,
                    'ends_at' => $endsAt,
                ]);
            } else {
                $updateData = [
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'stripe_subscription_id' => $stripeSubscriptionId ?? $subscription->stripe_subscription_id,
                ];
                if ($endsAt) {
                    $updateData['ends_at'] = $endsAt;
                }
                $subscription->update($updateData);
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
                    'credits_total_available' => $plan->credits_monthly + max(0, $credits->credits_addon_balance),
                    'last_reset_date' => now(),
                ]);
            }

            Log::info('Plan upgrade applied', [
                'company_id' => $company->id,
                'plan' => $plan->slug,
                'subscription_id' => $subscription->id,
                'stripe_subscription_id' => $stripeSubscriptionId,
            ]);
        });
    }

    protected function applyAddonCredits($companyId, $addonId): void
    {
        if (!$companyId || !$addonId) {
            return;
        }

        if (!in_array((string) $addonId, self::ALLOWED_ADDON_IDS, true)) {
            Log::warning('Invalid addon ID in webhook', ['addon_id' => $addonId]);
            return;
        }

        $addon = config("services.stripe.addons.{$addonId}");
        if (!$addon || empty($addon['credits'])) {
            return;
        }

        $company = Company::find($companyId);
        if (!$company || !$company->subscription || !$company->subscription->credits) {
            Log::warning('applyAddonCredits: company/subscription/credits not found', compact('companyId', 'addonId'));
            return;
        }

        $company->subscription->credits->addAddonCredits((float) $addon['credits'], "addon_{$addonId}");

        Log::info('Addon credits applied', [
            'company_id' => $companyId,
            'addon_id' => $addonId,
            'credits_added' => $addon['credits'],
        ]);
    }

    // ─── FALLBACK RESOLVERS ──────────────────────────────────────

    protected function applyPlanFromSession($session): void
    {
        $companyId = $session->metadata->company_id ?? null;
        if (!$companyId && !empty($session->customer)) {
            $companyId = Company::where('stripe_customer_id', $session->customer)->value('id');
        }
        if (!$companyId || empty($session->subscription)) {
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

    // ─── UTILITIES ───────────────────────────────────────────────

    /**
     * S'assurer que le Stripe customer existe pour cette company
     */
    private function ensureStripeCustomer(StripeClient $stripe, Company $company, $user): void
    {
        if ($company->stripe_customer_id) {
            return;
        }

        $customer = $stripe->customers->create([
            'email' => $user->email,
            'name' => $company->name,
            'metadata' => [
                'company_id' => $company->id,
                'user_id' => $user->id,
            ],
        ]);

        $company->update(['stripe_customer_id' => $customer->id]);
        $company->refresh();
    }
}
