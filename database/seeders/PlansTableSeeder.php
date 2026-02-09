<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlansTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Nettoyer les anciens plans si besoin
        Plan::truncate();

        // 🟢 PLAN FREE - Découverte
        Plan::create([
            'name' => 'FREE',
            'slug' => 'free',
            'price' => 0.00,
            'currency' => 'EUR',
            'billing_period' => 'month',
            
            // Quotas
            'sms_quota_monthly' => 20, // Ancien champ (dépendance)
            'credits_monthly' => 20, // 20 unités/mois (~0.90€ coût)
            'email_unlimited' => true,
            
            // Limites
            'max_restaurants' => 1,
            'max_users' => 1,
            'max_feedbacks' => 20,
            
            // Features
            'features' => [
                'feedback_page' => true,
                'google_redirect' => true,
                'ai_reply_generation' => false,
                'auto_reply' => false,
                'radar_ai' => false,
                'dashboard' => 'basic',
                'advanced_analytics' => false,
            ],
            
            'description' => 'Testez la valeur de Feedora gratuitement',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        // 🔵 PLAN BASIC - Booster d'avis
        Plan::create([
            'name' => 'BASIC',
            'slug' => 'basic',
            'price' => 29.00,
            'currency' => 'EUR',
            'billing_period' => 'month',
            
            // Quotas
            'sms_quota_monthly' => 200,
            'credits_monthly' => 200, // 200 unités/mois (~9€ coût, 70% marge)
            'email_unlimited' => true,
            
            // Limites
            'max_restaurants' => 1,
            'max_users' => null,
            'max_feedbacks' => null,
            
            // Features
            'features' => [
                'feedback_page' => true,
                'google_redirect' => true,
                'ai_reply_generation' => true,
                'auto_reply' => true,
                'radar_ai' => false,
                'dashboard' => 'complete',
                'advanced_analytics' => false,
                'multi_language' => true,
                'professional_tone' => true,
            ],
            
            'description' => 'Gagnez du temps et augmentez vos avis Google',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // 🔴 PLAN PRO - Feedora Radar IA
        Plan::create([
            'name' => 'PRO',
            'slug' => 'pro',
            'price' => 59.00,
            'currency' => 'EUR',
            'billing_period' => 'month',
            
            // Quotas
            'sms_quota_monthly' => 400,
            'credits_monthly' => 400, // 400 unités/mois (~18€ coût, 70% marge)
            'email_unlimited' => true,
            
            // Limites
            'max_restaurants' => 1,
            'max_users' => null,
            'max_feedbacks' => null,
            
            // Features
            'features' => [
                'feedback_page' => true,
                'google_redirect' => true,
                'ai_reply_generation' => true,
                'auto_reply' => true,
                'radar_ai' => true,
                'intelligent_summary' => true,
                'problem_detection' => true,
                'monthly_trends' => true,
                'actionable_recommendations' => true,
                'historical_comparison' => true,
                'dashboard' => 'advanced',
                'advanced_analytics' => true,
                'multi_language' => true,
                'professional_tone' => true,
            ],
            
            'description' => 'Comprenez vos clients et améliorez votre restaurant',
            'is_active' => true,
            'sort_order' => 2,
        ]);;
    }
}
