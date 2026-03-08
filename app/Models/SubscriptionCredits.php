<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
     * Effectue le reset mensuel (avec lock pour éviter les race conditions)
     */
    public function resetMonthlyCredits(): void
    {
        DB::transaction(function () {
            // Recharger avec lock pessimiste
            $locked = self::where('id', $this->id)->lockForUpdate()->first();
            if (!$locked || !$locked->needsMonthlyReset()) {
                return; // Déjà reseté par un autre process
            }

            $locked->credits_used_monthly = 0;
            $locked->credits_available_monthly = $locked->credits_monthly;
            $locked->credits_total_available = $locked->credits_monthly + max(0, $locked->credits_addon_balance);
            $locked->last_reset_date = now()->toDateString();
            $locked->save();

            // Sync état local
            $this->refresh();

            Log::info('Monthly credits reset', [
                'subscription_id' => $this->subscription_id,
                'credits_monthly' => $this->credits_monthly,
            ]);
        });
    }

    /**
     * Ajoute des crédits add-on (recharge) — avec transaction DB
     */
    public function addAddonCredits(float $amount, string $reference = null): void
    {
        if ($amount <= 0) {
            return;
        }

        DB::transaction(function () use ($amount, $reference) {
            $locked = self::where('id', $this->id)->lockForUpdate()->first();

            $locked->credits_addon_balance += $amount;
            $locked->recalculateTotalAvailable();
            $locked->save();

            // Sync état local
            $this->refresh();

            Log::info('Addon credits added', [
                'subscription_id' => $this->subscription_id,
                'amount' => $amount,
                'reference' => $reference,
                'new_addon_balance' => $locked->credits_addon_balance,
                'new_total' => $locked->credits_total_available,
            ]);
        });
    }

    /**
     * Consomme des crédits avec protection race condition
     * Consomme d'abord le quota mensuel, puis les add-ons
     * Utilise un lock pessimiste DB pour garantir l'intégrité
     */
    public function consumeCredits(float $amount): bool
    {
        if ($amount <= 0) {
            return true;
        }

        return DB::transaction(function () use ($amount) {
            // Lock pessimiste — empêche les lectures concurrentes
            $locked = self::where('id', $this->id)->lockForUpdate()->first();

            if (!$locked) {
                return false;
            }

            // Auto-reset si nécessaire
            if ($locked->needsMonthlyReset()) {
                $locked->credits_used_monthly = 0;
                $locked->credits_available_monthly = $locked->credits_monthly;
                $locked->credits_addon_balance = max(0, $locked->credits_addon_balance);
                $locked->credits_total_available = $locked->credits_monthly + $locked->credits_addon_balance;
                $locked->last_reset_date = now()->toDateString();
            }

            // Vérifier si suffisant
            if ($locked->credits_total_available < $amount) {
                Log::warning('Credit consumption rejected: insufficient credits', [
                    'subscription_id' => $locked->subscription_id,
                    'requested' => $amount,
                    'available' => $locked->credits_total_available,
                ]);
                return false;
            }

            // Consommer d'abord le quota mensuel
            if ($locked->credits_available_monthly >= $amount) {
                $locked->credits_used_monthly += $amount;
                $locked->credits_available_monthly -= $amount;
            } else {
                // Consommer le reste du quota, puis les add-ons
                $fromMonthly = $locked->credits_available_monthly;
                $fromAddon = $amount - $fromMonthly;

                $locked->credits_used_monthly += $fromMonthly;
                $locked->credits_available_monthly = 0;
                $locked->credits_addon_balance = max(0, $locked->credits_addon_balance - $fromAddon);
            }

            $locked->recalculateTotalAvailable();

            // Protection ultime contre les valeurs négatives
            $locked->credits_available_monthly = max(0, $locked->credits_available_monthly);
            $locked->credits_addon_balance = max(0, $locked->credits_addon_balance);
            $locked->credits_total_available = max(0, $locked->credits_total_available);

            $locked->save();

            // Sync état local
            $this->refresh();

            Log::info('Credits consumed', [
                'subscription_id' => $locked->subscription_id,
                'amount' => $amount,
                'monthly_remaining' => $locked->credits_available_monthly,
                'addon_remaining' => $locked->credits_addon_balance,
                'total_remaining' => $locked->credits_total_available,
            ]);

            return true;
        });
    }

    /**
     * Recalcule le total disponible (avec floor à 0)
     */
    public function recalculateTotalAvailable(): void
    {
        $this->credits_total_available = max(0,
            max(0, $this->credits_available_monthly) + max(0, $this->credits_addon_balance)
        );
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
        return number_format(max(0, $this->credits_total_available), 2, ',', ' ') . ' unités';
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
