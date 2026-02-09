<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsRateCountry extends Model
{
    protected $table = 'sms_credit_rates';

    protected $fillable = [
        'country_code',
        'country_name',
        'brevo_credit_cost',
        'units_per_sms',
        'description',
        'is_active',
    ];

    protected $casts = [
        'brevo_credit_cost' => 'decimal:2',
        'units_per_sms' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Récupère le taux pour un pays
     */
    public static function getRate(string $countryCode): ?self
    {
        return self::where('country_code', strtoupper($countryCode))
            ->active()
            ->first();
    }

    /**
     * Récupère le coût en unités pour un pays
     */
    public static function getUnitsCost(string $countryCode): float
    {
        $rate = self::getRate($countryCode);
        return $rate?->units_per_sms ?? 1.0; // Par défaut 1 unité si pays non trouvé
    }

    /**
     * Récupère le coût en crédits Brevo pour un pays
     */
    public static function getBrevoCredits(string $countryCode): float
    {
        $rate = self::getRate($countryCode);
        return $rate?->brevo_credit_cost ?? 4.5; // Par défaut coût France
    }
}
