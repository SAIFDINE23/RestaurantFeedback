#!/usr/bin/env php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\FeedbackRequest;
use App\Models\Customer;
use App\Models\Company;
use App\Services\ReminderService;

echo "=== TEST REMINDER SYSTEM ===" . PHP_EOL;
echo PHP_EOL;

// 1. Vérifier s'il y a des feedback requests en attente
echo "1. Checking for pending feedback requests..." . PHP_EOL;
$pendingCount = FeedbackRequest::whereIn('status', ['sent', 'pending'])
    ->whereDoesntHave('feedback')
    ->count();
echo "   Found: $pendingCount pending requests" . PHP_EOL;
echo PHP_EOL;

// 2. Trouver un feedback request de test
$fr = FeedbackRequest::whereIn('status', ['sent', 'pending'])
    ->whereDoesntHave('feedback')
    ->first();

if (!$fr) {
    echo "2. No pending feedback request found. Creating test data..." . PHP_EOL;
    
    $company = Company::first();
    if (!$company) {
        echo "   ERROR: No company found in database!" . PHP_EOL;
        exit(1);
    }
    
    $customer = Customer::where('company_id', $company->id)->first();
    if (!$customer) {
        echo "   Creating test customer..." . PHP_EOL;
        $customer = Customer::create([
            'company_id' => $company->id,
            'name' => 'Test Customer Reminder',
            'email' => 'test.reminder@example.com',
            'phone' => '+33612345678',
        ]);
    }
    
    echo "   Creating test feedback request..." . PHP_EOL;
    $fr = FeedbackRequest::create([
        'company_id' => $company->id,
        'customer_id' => $customer->id,
        'channel' => 'email',
        'status' => 'sent',
        'sent_at' => now()->subDays(4),
        'token' => Illuminate\Support\Str::uuid(),
        'reminder_count' => 0,
        'last_reminder_sent_at' => null,
        'first_reminder_sent_at' => null,
    ]);
    echo "   ✓ Created feedback request #" . $fr->id . PHP_EOL;
} else {
    echo "2. Found existing feedback request #" . $fr->id . PHP_EOL;
}
echo PHP_EOL;

// 3. Afficher les détails
echo "3. Feedback Request Details:" . PHP_EOL;
echo "   ID: " . $fr->id . PHP_EOL;
echo "   Status: " . $fr->status . PHP_EOL;
echo "   Channel: " . $fr->channel . PHP_EOL;
echo "   Reminder count: " . $fr->reminder_count . PHP_EOL;
echo "   Last reminder: " . ($fr->last_reminder_sent_at ?? 'never') . PHP_EOL;
echo "   Customer: " . $fr->customer->email . PHP_EOL;

if ($fr->last_reminder_sent_at) {
    $hoursSince = now()->diffInHours($fr->last_reminder_sent_at);
    echo "   Hours since last: " . $hoursSince . "h" . PHP_EOL;
    echo "   Can send (>72h): " . ($hoursSince >= 72 ? 'YES' : 'NO (need ' . (72 - $hoursSince) . 'h more)') . PHP_EOL;
}
echo PHP_EOL;

// 4. Tester l'envoi de reminder
echo "4. Testing reminder send..." . PHP_EOL;
try {
    $reminderService = new ReminderService();
    $result = $reminderService->sendReminder($fr);
    
    echo "   Result: " . ($result ? '✓ SUCCESS' : '✗ FAILED') . PHP_EOL;
    
    // Recharger les données
    $fr->refresh();
    echo "   New reminder count: " . $fr->reminder_count . PHP_EOL;
    echo "   New last reminder: " . ($fr->last_reminder_sent_at ?? 'null') . PHP_EOL;
} catch (\Exception $e) {
    echo "   ✗ EXCEPTION: " . $e->getMessage() . PHP_EOL;
    echo "   Stack trace:" . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
echo PHP_EOL;

// 5. Vérifier les logs
echo "5. Recent logs (last 20 lines with 'Reminder'):" . PHP_EOL;
$logFile = storage_path('logs/laravel.log');
if (file_exists($logFile)) {
    $logs = shell_exec("tail -100 $logFile | grep -i reminder | tail -20");
    echo $logs ?: "   No reminder logs found" . PHP_EOL;
} else {
    echo "   Log file not found" . PHP_EOL;
}

echo PHP_EOL;
echo "=== TEST COMPLETE ===" . PHP_EOL;
