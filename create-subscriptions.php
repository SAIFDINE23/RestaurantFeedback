<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Subscription;

echo "\n=== CRÉATION SUBSCRIPTIONS ===\n\n";

$users = ['saif@gmail.com', 'amin@gmail.com'];

foreach ($users as $email) {
    $user = User::where('email', $email)->first();
    
    if (!$user) {
        echo "❌ User $email non trouvé\n";
        continue;
    }
    
    if (!$user->company) {
        echo "❌ Pas de company pour $email\n";
        continue;
    }
    
    $company = $user->company;
    $sub = Subscription::where('company_id', $company->id)->first();
    
    if ($sub) {
        echo "✓ $email: Subscription existe déjà ({$sub->plan_name})\n";
    } else {
        $sub = Subscription::create([
            'company_id' => $company->id,
            'plan_name' => 'Starter',
            'plan_price' => 29.99,
            'status' => 'active',
            'monthly_email_quota' => 100,
            'monthly_sms_quota' => 50,
            'starts_at' => now(),
            'ends_at' => now()->addYear(),
        ]);
        echo "✓ $email: Subscription créée (Starter - 100 emails / 50 SMS)\n";
    }
}

echo "\n✅ TERMINÉ!\n\n";
