<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionCredits;
use App\Models\SmsRateCountry;
use Illuminate\Database\Eloquent\Model;

class CreditConsumptionService
{
    /**
     * Consomme des crédits pour un SMS envoyé
     * 
     * @param Company|Subscription $target Soit la Company, soit la Subscription
     * @param string $destinationCountry Code pays (FR, MA, US, etc.)
     * @return array ['success' => bool, 'units_consumed' => float, 'message' => string]
     */
    public function consumeCreditsForSms($target, string $destinationCountry): array
    {
        // Résoudre la subscription
        if ($target instanceof Company) {
            $subscription = $target->subscription;
        } elseif ($target instanceof Subscription) {
            $subscription = $target;
        } else {
            return [
                'success' => false,
                'units_consumed' => 0,
                'message' => 'Invalid target',
            ];
        }

        // Vérifier que la subscription existe
        if (!$subscription) {
            return [
                'success' => false,
                'units_consumed' => 0,
                'message' => 'No active subscription',
            ];
        }

        // Récupérer ou créer les crédits
        $credits = $subscription->credits ?? $this->initializeCredits($subscription);

        // Obtenir le coût en unités pour cette destination
        $unitsCost = SmsRateCountry::getUnitsCost($destinationCountry);

        // Vérifier si suffisant
        if (!$credits->hasEnoughCredits($unitsCost)) {
            return [
                'success' => false,
                'units_consumed' => 0,
                'message' => 'Insufficient credits. Available: ' . 
                    number_format($credits->credits_total_available, 2) . 
                    ' unités, Required: ' . number_format($unitsCost, 2) . ' unités',
            ];
        }

        // Consommer les crédits
        $consumed = $credits->consumeCredits($unitsCost);

        if (!$consumed) {
            return [
                'success' => false,
                'units_consumed' => 0,
                'message' => 'Failed to consume credits',
            ];
        }

        return [
            'success' => true,
            'units_consumed' => $unitsCost,
            'message' => 'SMS sent successfully. ' . 
                number_format($unitsCost, 2) . ' unités consumed. ' .
                'Remaining: ' . $credits->getFormattedBalance(),
        ];
    }

    /**
     * Initialise les crédits pour une subscription
     */
    public function initializeCredits(Subscription $subscription): SubscriptionCredits
    {
        $monthlyCredits = $subscription->plan->credits_monthly ?? 0;

        $credits = SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => $monthlyCredits,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $monthlyCredits,
            'credits_addon_balance' => 0,
            'credits_total_available' => $monthlyCredits,
            'last_reset_date' => now()->toDateString(),
        ]);

        // Recharger la relation
        $subscription->load('credits');

        return $credits;
    }

    /**
     * Ajoute des crédits add-on (recharge)
     */
    public function addAddonCredits(Subscription $subscription, float $amount): array
    {
        // Obtenir ou créer les crédits
        $credits = $subscription->credits ?? $this->initializeCredits($subscription);

        // Ajouter les crédits
        $credits->addAddonCredits($amount);

        return [
            'success' => true,
            'new_balance' => $credits->credits_total_available,
            'message' => 'Add-on credits added. New balance: ' . $credits->getFormattedBalance(),
        ];
    }

    /**
     * Récupère les informations de crédit actuelles
     */
    public function getCreditsInfo(Subscription $subscription): array
    {
        $credits = $subscription->credits;

        if (!$credits) {
            // Auto-initialiser
            $credits = $this->initializeCredits($subscription);
        }

        // Auto-reset si nécessaire
        if ($credits->needsMonthlyReset()) {
            $credits->resetMonthlyCredits();
        }

        return [
            'monthly_quota' => $credits->credits_monthly,
            'monthly_used' => $credits->credits_used_monthly,
            'monthly_available' => $credits->credits_available_monthly,
            'addon_balance' => $credits->credits_addon_balance,
            'total_available' => $credits->credits_total_available,
            'monthly_usage_percentage' => $credits->getMonthlyUsagePercentage(),
            'formatted_balance' => $credits->getFormattedBalance(),
            'last_reset' => $credits->last_reset_date?->format('d/m/Y'),
            'needs_reset' => $credits->needsMonthlyReset(),
        ];
    }

    /**
     * Vérifie si assez de crédits pour plusieurs SMS
     */
    public function canSendSms(Subscription $subscription, string $destinationCountry, int $count = 1): array
    {
        $credits = $subscription->credits ?? $this->initializeCredits($subscription);

        if ($credits->needsMonthlyReset()) {
            $credits->resetMonthlyCredits();
        }

        $unitsCost = SmsRateCountry::getUnitsCost($destinationCountry);
        $totalCost = $unitsCost * $count;

        return [
            'can_send' => $credits->credits_total_available >= $totalCost,
            'available' => $credits->credits_total_available,
            'needed' => $totalCost,
            'message' => $credits->credits_total_available >= $totalCost 
                ? "You can send $count SMS(s) to $destinationCountry"
                : "Insufficient credits. Need: " . number_format($totalCost, 2) . 
                    " unités, Available: " . number_format($credits->credits_total_available, 2) . " unités",
        ];
    }
}
