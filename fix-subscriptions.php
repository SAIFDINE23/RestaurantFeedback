<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== CRÉATION SUBSCRIPTIONS ET CRÉDITS ===\n\n";

// Vérifier les plans existants
$plans = DB::table('plans')->get();
if ($plans->isEmpty()) {
    echo "❌ Aucun plan trouvé. Lancez: php artisan db:seed --class=PlansTableSeeder\n";
    exit(1);
}

echo "✓ Plans existants (" . $plans->count() . ")\n\n";

// On prend BASIC par défaut, sinon FREE
$plan = DB::table('plans')->where('slug', 'basic')->first();
if (!$plan) {
    $plan = DB::table('plans')->where('slug', 'free')->first();
}

if (!$plan) {
    echo "❌ Erreur: Aucun plan utilisable trouvé (basic/free)\n";
    exit(1);
}

// Créer subscriptions pour les companies
$companies = \App\Models\Company::all();
foreach ($companies as $company) {
    $subscription = DB::table('subscriptions')->where('company_id', $company->id)->first();

    if (!$subscription) {
        $subscriptionId = DB::table('subscriptions')->insertGetId([
            'company_id' => $company->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'ends_at' => now()->addYear(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "✓ Subscription créée pour: {$company->name}\n";
    } else {
        $subscriptionId = $subscription->id;
        echo "✓ Subscription existe déjà pour: {$company->name}\n";
    }

    // Initialiser les crédits si manquants
    $creditsExists = DB::table('subscription_credits')
        ->where('subscription_id', $subscriptionId)
        ->exists();

    if (!$creditsExists) {
        DB::table('subscription_credits')->insert([
            'subscription_id' => $subscriptionId,
            'credits_monthly' => $plan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $plan->credits_monthly,
            'credits_addon_balance' => 0,
            'credits_total_available' => $plan->credits_monthly,
            'last_reset_date' => now()->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "  ↳ Crédits initialisés ({$plan->credits_monthly})\n";
    } else {
        echo "  ↳ Crédits déjà existants\n";
    }
}

echo "\n✅ TERMINÉ!";
echo "\n- Total subscriptions: " . DB::table('subscriptions')->count();
echo "\n- Total credits rows: " . DB::table('subscription_credits')->count() . "\n\n";
