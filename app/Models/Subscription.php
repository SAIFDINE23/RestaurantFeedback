<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'plan_id',
        'stripe_subscription_id',
        'status',
        'trial_ends_at',
        'ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /**
     * Relation avec Company
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Relation avec SubscriptionCredits
     */
    public function credits()
    {
        return $this->hasOne(SubscriptionCredits::class);
    }

    /**
     * Relation avec Plan
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCanceled($query)
    {
        return $query->where('status', 'canceled');
    }

    public function scopeTrialing($query)
    {
        return $query->where('status', 'trialing');
    }

    public function scopeExpired($query)
    {
        return $query->where('ends_at', '<', now());
    }

    /**
     * Vérifie si la subscription est active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && 
               ($this->ends_at === null || $this->ends_at->isFuture());
    }

    /**
     * Vérifie si la subscription est en période d'essai
     */
    public function isTrialing(): bool
    {
        return $this->status === 'trialing' && 
               $this->trial_ends_at && 
               $this->trial_ends_at->isFuture();
    }

    /**
     * Vérifie si la subscription est annulée
     */
    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }

    /**
     * Vérifie si la subscription est expirée
     */
    public function isExpired(): bool
    {
        return $this->ends_at && $this->ends_at->isPast();
    }

    /**
     * Vérifie si c'est un plan FREE
     */
    public function isFree(): bool
    {
        return $this->plan->isFree();
    }

    /**
     * Vérifie si la subscription a accès à une feature
     */
    public function hasFeature(string $feature): bool
    {
        return $this->plan->hasFeature($feature);
    }

    /**
     * Vérifie si la subscription a accès au Radar IA
     */
    public function hasRadarAi(): bool
    {
        return $this->isActive() && $this->plan->hasRadarAi();
    }

    /**
     * Vérifie si la subscription a accès à l'IA de réponses
     */
    public function hasAiReplies(): bool
    {
        return $this->isActive() && $this->plan->hasAiReplies();
    }
}

