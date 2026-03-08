<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'sector',
        'google_place_id',
        'google_review_url',
        'stripe_customer_id',
        'qr_code_token',
        'logo_url',
        'design_settings',
        'review_platforms',
        'feedback_sms_template',
        'feedback_email_subject_template',
        'feedback_email_body_template',
        'feedback_qr_template',
    ];

    protected $casts = [
        'design_settings' => 'array',
        'review_platforms' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function feedbackRequests()
    {
        return $this->hasMany(FeedbackRequest::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->latest();
    }

    public function feedbackReplies()
    {
        return $this->hasMany(FeedbackReply::class);
    }

    public function responsePolicy()
    {
        return $this->hasOne(CompanyResponsePolicy::class);
    }

    /**
     * Récupère le plan actuel de la company
     */
    public function currentPlan()
    {
        return $this->subscription?->plan;
    }

    /**
     * Vérifie si la company a une subscription active
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscription && $this->subscription->isActive();
    }

    /**
     * Vérifie si la company est sur le plan FREE
     */
    public function isOnFreePlan(): bool
    {
        return $this->subscription && $this->subscription->isFree();
    }

    /**
     * Vérifie si la company a accès à une feature
     */
    public function hasFeature(string $feature): bool
    {
        return $this->subscription && $this->subscription->hasFeature($feature);
    }

    /**
     * Vérifie si la company a accès au Radar IA
     */
    public function hasRadarAi(): bool
    {
        return $this->subscription && $this->subscription->hasRadarAi();
    }

    /**
     * Vérifie si la company a accès à l'IA de réponses
     */
    public function hasAiReplies(): bool
    {
        return $this->subscription && $this->subscription->hasAiReplies();
    }

    /**
     * Récupère le quota SMS mensuel de la company
     */
    public function getSmsQuotaMonthly(): int
    {
        return $this->currentPlan()?->sms_quota_monthly ?? 0;
    }

    /**
     * Génère un token unique pour le QR code si absent
     */
    public function generateQrCodeToken(): string
    {
        if (!$this->qr_code_token) {
            $this->qr_code_token = \Illuminate\Support\Str::random(32);
            $this->save();
        }
        return $this->qr_code_token;
    }

    /**
     * Récupère l'URL du formulaire public
     */
    public function getPublicFormUrl(): string
    {
        return route('public.form.show', ['token' => $this->qr_code_token ?? $this->generateQrCodeToken()]);
    }
}