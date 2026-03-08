<?php

/**
 * Créer des données de test pour le système de batch reminders
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Company;
use App\Models\Customer;
use App\Models\FeedbackRequest;
use Illuminate\Support\Facades\DB;

echo "\n=== CRÉATION DE DONNÉES DE TEST POUR BATCH REMINDERS ===\n\n";

// Trouver une entreprise active
$company = Company::first();

if (!$company) {
    echo "❌ Aucune entreprise trouvée\n";
    exit(1);
}

echo "✓ Entreprise: {$company->name} (ID: {$company->id})\n\n";

// Scénario de test: créer 5 demandes avec différents états
$scenarios = [
    [
        'name' => 'Test Client 1 - Envoi immédiat',
        'status' => 'sent',
        'reminder_count' => 0,
        'last_reminder_sent_at' => null,
        'description' => 'Peut recevoir un reminder immédiatement'
    ],
    [
        'name' => 'Test Client 2 - Envoyé il y a 80h',
        'status' => 'sent',
        'reminder_count' => 1,
        'last_reminder_sent_at' => now()->subHours(80),
        'description' => 'Peut recevoir un 2ème reminder (> 72h)'
    ],
    [
        'name' => 'Test Client 3 - Envoyé il y a 50h',
        'status' => 'sent',
        'reminder_count' => 1,
        'last_reminder_sent_at' => now()->subHours(50),
        'description' => 'BLOQUÉ - doit attendre 22h de plus'
    ],
    [
        'name' => 'Test Client 4 - Max atteint',
        'status' => 'sent',
        'reminder_count' => 3,
        'last_reminder_sent_at' => now()->subDays(5),
        'description' => 'BLOQUÉ - 3 reminders déjà envoyés'
    ],
    [
        'name' => 'Test Client 5 - Pending',
        'status' => 'pending',
        'reminder_count' => 0,
        'last_reminder_sent_at' => null,
        'description' => 'Peut recevoir un reminder immédiatement'
    ],
];

echo "📝 Création de " . count($scenarios) . " demandes de test...\n\n";

$created = [];

DB::beginTransaction();

try {
    foreach ($scenarios as $index => $scenario) {
        // Créer ou trouver le client
        $customer = Customer::firstOrCreate(
            [
                'email' => "test.batch.{$index}@feedora-test.local",
                'company_id' => $company->id,
            ],
            [
                'name' => $scenario['name'],
                'phone' => '+33612345' . str_pad($index, 3, '0'),
            ]
        );

        // Supprimer les anciennes demandes de test de ce client
        FeedbackRequest::where('customer_id', $customer->id)->delete();

        // Créer la nouvelle demande
        $request = FeedbackRequest::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'channel' => 'email',
            'status' => $scenario['status'],
            'token' => \Illuminate\Support\Str::random(32),
            'expires_at' => now()->addDays(30),
            'reminder_count' => $scenario['reminder_count'],
            'last_reminder_sent_at' => $scenario['last_reminder_sent_at'],
            'first_reminder_sent_at' => $scenario['reminder_count'] > 0 
                ? ($scenario['last_reminder_sent_at'] ?? now()->subDays(1))
                : null,
        ]);

        $created[] = $request;

        $hours = $scenario['last_reminder_sent_at'] 
            ? now()->diffInHours($scenario['last_reminder_sent_at']) 
            : null;

        echo sprintf(
            "  ✓ %s\n    ID: %d | Status: %s | Reminders: %d | Dernier: %s\n    → %s\n\n",
            $scenario['name'],
            $request->id,
            $request->status,
            $request->reminder_count,
            $hours ? "{$hours}h ago" : 'Jamais',
            $scenario['description']
        );
    }

    DB::commit();
    
    echo "✅ " . count($created) . " demandes créées avec succès!\n\n";
    
    echo "🎯 PRÉDICTIONS POUR LE TEST:\n";
    echo str_repeat('-', 60) . "\n";
    echo "  • Envoyés attendus:  2 (Client 1 + Client 2)\n";
    echo "  • Pending attendu:   1 (Client 5)\n";
    echo "  • Ignorés attendus:  2 (Client 3: < 72h, Client 4: max)\n";
    echo str_repeat('-', 60) . "\n\n";
    
    echo "🚀 Pour tester maintenant, lance:\n";
    echo "   php test-batch-reminder.php\n\n";
    
    echo "💡 Les IDs créés:\n";
    foreach ($created as $req) {
        echo "   - FeedbackRequest #{$req->id}\n";
    }
    echo "\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
