<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'currency',
        'billing_period',
        'sms_quota_monthly',
        'email_unlimited',
        'credits_monthly',
        'max_restaurants',
        'max_users',
        'max_feedbacks',
        'features',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sms_quota_monthly' => 'integer',
        'email_unlimited' => 'boolean',
        'credits_monthly' => 'decimal:2',
        'max_restaurants' => 'integer',
        'max_users' => 'integer',
        'max_feedbacks' => 'integer',
        'features' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Relation avec les subscriptions
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Scopes pour récupérer les plans facilement
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFree($query)
    {
        return $query->where('slug', 'free');
    }

    public function scopeBasic($query)
    {
        return $query->where('slug', 'basic');
    }

    public function scopePro($query)
    {
        return $query->where('slug', 'pro');
    }

    /**
     * Vérifie si le plan a une feature spécifique
     */
    public function hasFeature(string $feature): bool
    {
        return isset($this->features[$feature]) && $this->features[$feature] === true;
    }

    /**
     * Vérifie si c'est un plan gratuit
     */
    public function isFree(): bool
    {
        return $this->slug === 'free';
    }

    /**
     * Vérifie si le plan a l'IA de réponses
     */
    public function hasAiReplies(): bool
    {
        return $this->hasFeature('ai_reply_generation');
    }

    /**
     * Vérifie si le plan a le Radar IA
     */
    public function hasRadarAi(): bool
    {
        return $this->hasFeature('radar_ai');
    }

    /**
     * Vérifie si les utilisateurs sont illimités
     */
    public function hasUnlimitedUsers(): bool
    {
        return $this->max_users === null;
    }

    /**
     * Vérifie si les feedbacks sont illimités
     */
    public function hasUnlimitedFeedbacks(): bool
    {
        return $this->max_feedbacks === null;
    }

    /**
     * Retourne le prix formaté
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->price == 0) {
            return 'Gratuit';
        }
        
        return number_format($this->price, 2, ',', ' ') . ' ' . $this->currency;
    }
}
