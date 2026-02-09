<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class SubscriptionCredits extends Model
{
    protected $table = 'subscription_credits';

    protected $fillable = [
        'subscription_id',
        'credits_monthly',
        'credits_used_monthly',
        'credits_available_monthly',
        'credits_addon_balance',
        'credits_total_available',
        'last_reset_date',
    ];

    protected $casts = [
        'credits_monthly' => 'decimal:2',
        'credits_used_monthly' => 'decimal:2',
        'credits_available_monthly' => 'decimal:2',
        'credits_addon_balance' => 'decimal:2',
        'credits_total_available' => 'decimal:2',
        'last_reset_date' => 'date',
    ];

    /**
     * Relation avec Subscription
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Vérifie si un reset mensuel est nécessaire
     */
    public function needsMonthlyReset(): bool
    {
        return $this->last_reset_date === null || 
               $this->last_reset_date->month !== now()->month ||
               $this->last_reset_date->year !== now()->year;
    }

    /**
     * Effectue le reset mensuel
     */
    public function resetMonthlyCredits(): void
    {
        $this->credits_used_monthly = 0;
        $this->credits_available_monthly = $this->credits_monthly;
        $this->credits_total_available = $this->credits_monthly + $this->credits_addon_balance;
        $this->last_reset_date = now()->toDateString();
        $this->save();
    }

    /**
     * Ajoute des crédits add-on (recharge)
     */
    public function addAddonCredits(float $amount, string $reference = null): void
    {
        $this->credits_addon_balance += $amount;
        $this->recalculateTotalAvailable();
        $this->save();
    }

    /**
     * Consomme des crédits
     * Consomme d'abord le quota mensuel, puis les add-ons
     */
    public function consumeCredits(float $amount): bool
    {
        // Auto-reset si nécessaire
        if ($this->needsMonthlyReset()) {
            $this->resetMonthlyCredits();
        }

        // Vérifier si suffisant
        if ($this->credits_total_available < $amount) {
            return false;
        }

        // Consommer d'abord le quota mensuel
        if ($this->credits_available_monthly >= $amount) {
            $this->credits_used_monthly += $amount;
            $this->credits_available_monthly -= $amount;
        } else {
            // Consommer le reste du quota, puis les add-ons
            $toConsume = $amount - $this->credits_available_monthly;
            $this->credits_used_monthly += $this->credits_available_monthly;
            $this->credits_available_monthly = 0;
            $this->credits_addon_balance -= $toConsume;
        }

        $this->recalculateTotalAvailable();
        $this->save();

        return true;
    }

    /**
     * Recalcule le total disponible
     */
    public function recalculateTotalAvailable(): void
    {
        $this->credits_total_available = 
            $this->credits_available_monthly + $this->credits_addon_balance;
    }

    /**
     * Vérifie si suffisant de crédits
     */
    public function hasEnoughCredits(float $amount): bool
    {
        // Auto-reset si nécessaire
        if ($this->needsMonthlyReset()) {
            $this->resetMonthlyCredits();
        }

        return $this->credits_total_available >= $amount;
    }

    /**
     * Récupère le solde formaté
     */
    public function getFormattedBalance(): string
    {
        return number_format($this->credits_total_available, 2, ',', ' ') . ' unités';
    }

    /**
     * Récupère le pourcentage de quota utilisé
     */
    public function getMonthlyUsagePercentage(): float
    {
        if ($this->credits_monthly == 0) {
            return 0;
        }

        return round(
            ($this->credits_used_monthly / $this->credits_monthly) * 100,
            2
        );
    }
}
