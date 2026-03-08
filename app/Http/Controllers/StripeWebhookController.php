<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    /**
     * Gérer les webhooks Stripe
     * 
     * Événements gérés:
     * - invoice.payment_succeeded: Renouvellement de l'abonnement
     * - customer.subscription.updated: Mise à jour des paramètres
     * - customer.subscription.deleted: Annulation de l'abonnement
     */
    public function handle(Request $request)
    {
        $payload = @file_get_contents('php://input');
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sig_header,
                config('services.stripe.webhook_secret')
            );
        } catch (SignatureVerificationException $e) {
            Log::error('Webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);
            return response('Invalid signature', 403);
        } catch (\UnexpectedValueException $e) {
            Log::error('Webhook payload parsing failed', [
                'error' => $e->getMessage(),
            ]);
            return response('Invalid payload', 400);
        }

        // Traiter les différents événements
        switch ($event->type) {
            case 'invoice.payment_succeeded':
                $this->handleInvoicePaymentSucceeded($event->data->object);
                break;

            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;

            default:
                Log::info('Unhandled webhook event', [
                    'type' => $event->type,
                    'id' => $event->id,
                ]);
        }

        return response('Webhook processed', 200);
    }

    /**
     * Traiter le paiement réussi d'une facture (renouvellement)
     */
    private function handleInvoicePaymentSucceeded($invoice)
    {
        // Vérifier que c'est un paiement de renouvellement (subscription_id présent)
        if (!$invoice->subscription) {
            Log::info('Invoice processed but no subscription attached', [
                'invoice_id' => $invoice->id,
            ]);
            return;
        }

        // Trouver l'abonnement
        $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)
            ->first();

        if (!$subscription) {
            Log::warning('Subscription not found for Stripe subscription', [
                'stripe_subscription_id' => $invoice->subscription,
            ]);
            return;
        }

        // Mettre à jour la date d'expiration
        $ends_at = \Carbon\Carbon::createFromTimestamp($invoice->period_end);
        $subscription->update([
            'ends_at' => $ends_at,
            'status' => 'active',
        ]);

        Log::info('Subscription renewed', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'new_ends_at' => $ends_at,
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * Traiter la mise à jour d'un abonnement
     */
    private function handleSubscriptionUpdated($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)
            ->first();

        if (!$subscription) {
            Log::warning('Subscription not found for update', [
                'stripe_subscription_id' => $stripeSubscription->id,
            ]);
            return;
        }

        // Mettre à jour le statut et la date d'expiration
        // Stripe API récente : current_period_end est dans items.data[0]
        $periodEnd = $stripeSubscription->items->data[0]->current_period_end
            ?? $stripeSubscription->current_period_end
            ?? null;

        $updateData = [
            'status' => $stripeSubscription->status,
            'trial_ends_at' => $stripeSubscription->trial_end 
                ? \Carbon\Carbon::createFromTimestamp($stripeSubscription->trial_end)
                : null,
        ];

        if ($periodEnd && (int) $periodEnd > time()) {
            $updateData['ends_at'] = \Carbon\Carbon::createFromTimestamp((int) $periodEnd);
        }

        $subscription->update($updateData);

        Log::info('Subscription updated', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
            'new_status' => $stripeSubscription->status,
            'new_ends_at' => $updateData['ends_at'] ?? null,
        ]);
    }

    /**
     * Traiter l'annulation d'un abonnement
     */
    private function handleSubscriptionDeleted($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)
            ->first();

        if (!$subscription) {
            Log::warning('Subscription not found for deletion', [
                'stripe_subscription_id' => $stripeSubscription->id,
            ]);
            return;
        }

        // Marquer comme annulé
        $subscription->update([
            'status' => 'canceled',
            'ends_at' => now(),
        ]);

        Log::info('Subscription canceled', [
            'subscription_id' => $subscription->id,
            'company_id' => $subscription->company_id,
        ]);
    }
}
