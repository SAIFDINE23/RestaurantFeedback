<?php

namespace Database\Seeders;

use App\Models\SmsRateCountry;
use Illuminate\Database\Seeder;

class SmsRatesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Données réelles Brevo :
     * Base : France = 4,50 crédits/SMS = 1 Unité Luminea
     * Ratio pour chaque pays : brevo_cost / 4,50
     */
    public function run(): void
    {
        SmsRateCountry::truncate();

        $rates = [
            // Zone France (Europe - bas coût)
            [
                'country_code' => 'FR',
                'country_name' => 'France',
                'brevo_credit_cost' => 4.50,
                'units_per_sms' => 1.0,
                'description' => 'France métropolitaine',
                'is_active' => true,
            ],
            [
                'country_code' => 'DE',
                'country_name' => 'Allemagne',
                'brevo_credit_cost' => 4.50,
                'units_per_sms' => 1.0,
                'description' => 'Allemagne',
                'is_active' => true,
            ],
            [
                'country_code' => 'ES',
                'country_name' => 'Espagne',
                'brevo_credit_cost' => 4.50,
                'units_per_sms' => 1.0,
                'description' => 'Espagne',
                'is_active' => true,
            ],
            [
                'country_code' => 'IT',
                'country_name' => 'Italie',
                'brevo_credit_cost' => 4.50,
                'units_per_sms' => 1.0,
                'description' => 'Italie',
                'is_active' => true,
            ],
            [
                'country_code' => 'BE',
                'country_name' => 'Belgique',
                'brevo_credit_cost' => 4.50,
                'units_per_sms' => 1.0,
                'description' => 'Belgique',
                'is_active' => true,
            ],
            [
                'country_code' => 'NL',
                'country_name' => 'Pays-Bas',
                'brevo_credit_cost' => 4.50,
                'units_per_sms' => 1.0,
                'description' => 'Pays-Bas',
                'is_active' => true,
            ],

            // Zone Afrique du Nord (coût moyen-élevé)
            [
                'country_code' => 'MA',
                'country_name' => 'Maroc',
                'brevo_credit_cost' => 20.00,
                'units_per_sms' => 4.44,
                'description' => 'Maroc - Coût international moyen',
                'is_active' => true,
            ],
            [
                'country_code' => 'DZ',
                'country_name' => 'Algérie',
                'brevo_credit_cost' => 20.00,
                'units_per_sms' => 4.44,
                'description' => 'Algérie',
                'is_active' => true,
            ],
            [
                'country_code' => 'TN',
                'country_name' => 'Tunisie',
                'brevo_credit_cost' => 20.00,
                'units_per_sms' => 4.44,
                'description' => 'Tunisie',
                'is_active' => true,
            ],

            // Zone International (coût élevé)
            [
                'country_code' => 'US',
                'country_name' => 'États-Unis',
                'brevo_credit_cost' => 14.50,
                'units_per_sms' => 3.22,
                'description' => 'États-Unis',
                'is_active' => true,
            ],
            [
                'country_code' => 'CA',
                'country_name' => 'Canada',
                'brevo_credit_cost' => 14.50,
                'units_per_sms' => 3.22,
                'description' => 'Canada',
                'is_active' => true,
            ],
            [
                'country_code' => 'GB',
                'country_name' => 'Royaume-Uni',
                'brevo_credit_cost' => 9.50,
                'units_per_sms' => 2.11,
                'description' => 'Royaume-Uni',
                'is_active' => true,
            ],
            [
                'country_code' => 'SG',
                'country_name' => 'Singapour',
                'brevo_credit_cost' => 18.00,
                'units_per_sms' => 4.00,
                'description' => 'Singapour',
                'is_active' => true,
            ],
            [
                'country_code' => 'AE',
                'country_name' => 'Émirats Arabes Unis',
                'brevo_credit_cost' => 18.00,
                'units_per_sms' => 4.00,
                'description' => 'Émirats Arabes Unis',
                'is_active' => true,
            ],
            [
                'country_code' => 'JP',
                'country_name' => 'Japon',
                'brevo_credit_cost' => 22.00,
                'units_per_sms' => 4.89,
                'description' => 'Japon',
                'is_active' => true,
            ],
            [
                'country_code' => 'CN',
                'country_name' => 'Chine',
                'brevo_credit_cost' => 25.00,
                'units_per_sms' => 5.56,
                'description' => 'Chine',
                'is_active' => true,
            ],
            [
                'country_code' => 'BR',
                'country_name' => 'Brésil',
                'brevo_credit_cost' => 16.00,
                'units_per_sms' => 3.56,
                'description' => 'Brésil',
                'is_active' => true,
            ],
            [
                'country_code' => 'MX',
                'country_name' => 'Mexique',
                'brevo_credit_cost' => 14.50,
                'units_per_sms' => 3.22,
                'description' => 'Mexique',
                'is_active' => true,
            ],
            [
                'country_code' => 'IN',
                'country_name' => 'Inde',
                'brevo_credit_cost' => 12.00,
                'units_per_sms' => 2.67,
                'description' => 'Inde',
                'is_active' => true,
            ],
            [
                'country_code' => 'AU',
                'country_name' => 'Australie',
                'brevo_credit_cost' => 18.00,
                'units_per_sms' => 4.00,
                'description' => 'Australie',
                'is_active' => true,
            ],
        ];

        foreach ($rates as $rate) {
            SmsRateCountry::create($rate);
        }
    }
}
