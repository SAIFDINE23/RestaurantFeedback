#!/usr/bin/env php
<?php
/**
 * Script de diagnostic complet du système de reminder
 * Usage: php diagnostic-reminder.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║     DIAGNOSTIC SYSTÈME DE REMINDER - FEEDORA              ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";
echo "\n";

$errors = [];
$warnings = [];
$success = [];

// 1. Vérifier que la route existe
echo "🔍 Test 1: Routes\n";
echo "   ├─ Checking route 'feedback-request.remind'... ";
try {
    $routeExists = Route::has('feedback-request.remind');
    if ($routeExists) {
        echo "✅ EXISTS\n";
        $success[] = "Route feedback-request.remind exists";
        
        // Vérifier la méthode
        $route = Route::getRoutes()->getByName('feedback-request.remind');
        $methods = $route->methods();
        echo "   ├─ Methods: " . implode(', ', $methods) . "\n";
        if (!in_array('POST', $methods)) {
            $errors[] = "Route should accept POST method";
            echo "   └─ ❌ POST method not allowed!\n";
        } else {
            echo "   └─ ✅ POST method allowed\n";
        }
    } else {
        echo "❌ NOT FOUND\n";
        $errors[] = "Route feedback-request.remind not found";
    }
} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    $errors[] = "Route check failed: " . $e->getMessage();
}
echo "\n";

// 2. Vérifier que ReminderService existe
echo "🔍 Test 2: Services\n";
echo "   ├─ Checking ReminderService class... ";
if (class_exists('App\Services\ReminderService')) {
    echo "✅ EXISTS\n";
    $success[] = "ReminderService class found";
    
    // Vérifier les méthodes
    $reflection = new ReflectionClass('App\Services\ReminderService');
    $methods = $reflection->getMethods(ReflectionMethod::IS_PUBLIC);
    $methodNames = array_map(fn($m) => $m->getName(), $methods);
    
    echo "   ├─ Public methods: " . implode(', ', $methodNames) . "\n";
    
    $required = ['sendReminder', 'sendAllReminders'];
    foreach ($required as $method) {
        if (in_array($method, $methodNames)) {
            echo "   ├─ ✅ Method '$method' exists\n";
        } else {
            echo "   ├─ ❌ Method '$method' missing\n";
            $errors[] = "Method $method not found in ReminderService";
        }
    }
    echo "   └─ Service structure OK\n";
} else {
    echo "❌ NOT FOUND\n";
    $errors[] = "ReminderService class not found";
}
echo "\n";

// 3. Vérifier la structure de la table feedback_requests
echo "🔍 Test 3: Database Schema\n";
echo "   ├─ Checking feedback_requests table... ";
try {
    // PostgreSQL compatible query
    $columns = DB::select("
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'feedback_requests' 
        AND table_schema = 'public'
    ");
    $columnNames = array_column($columns, 'column_name');
    echo "✅ EXISTS\n";
    
    $requiredColumns = [
        'reminder_count',
        'last_reminder_sent_at',
        'first_reminder_sent_at',
    ];
    
    foreach ($requiredColumns as $col) {
        if (in_array($col, $columnNames)) {
            echo "   ├─ ✅ Column '$col' exists\n";
        } else {
            echo "   ├─ ❌ Column '$col' missing\n";
            $errors[] = "Column $col not found in feedback_requests table";
        }
    }
    echo "   └─ Schema OK\n";
} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    $errors[] = "Database schema check failed";
}
echo "\n";

// 4. Vérifier le template email
echo "🔍 Test 4: Email Templates\n";
echo "   ├─ Checking feedback-reminder template... ";
$templatePath = resource_path('views/emails/feedback-reminder.blade.php');
if (file_exists($templatePath)) {
    echo "✅ EXISTS\n";
    $success[] = "Email template found";
    $size = filesize($templatePath);
    echo "   └─ Size: " . number_format($size) . " bytes\n";
} else {
    echo "❌ NOT FOUND\n";
    $errors[] = "Email template not found at $templatePath";
}
echo "\n";

// 5. Vérifier Brevo configuration
echo "🔍 Test 5: Brevo Configuration\n";
echo "   ├─ Checking BREVO_API_KEY... ";
$apiKey = config('services.brevo.api_key');
if ($apiKey) {
    echo "✅ SET (" . substr($apiKey, 0, 10) . "...)\n";
    $success[] = "Brevo API key configured";
} else {
    echo "❌ NOT SET\n";
    $errors[] = "BREVO_API_KEY not configured";
}

echo "   ├─ Checking BREVO_SMS_SENDER... ";
$smsSender = config('services.brevo.sms_sender');
if ($smsSender) {
    echo "✅ SET ($smsSender)\n";
    $success[] = "Brevo SMS sender configured";
} else {
    echo "❌ NOT SET\n";
    $warnings[] = "BREVO_SMS_SENDER not configured (SMS reminders won't work)";
}
echo "\n";

// 6. Test de connexion BrevoService
echo "🔍 Test 6: Brevo Service\n";
echo "   ├─ Testing BrevoService instantiation... ";
try {
    $brevoService = new \App\Services\BrevoService();
    echo "✅ SUCCESS\n";
    $success[] = "BrevoService can be instantiated";
} catch (\Exception $e) {
    echo "❌ FAILED: " . $e->getMessage() . "\n";
    $errors[] = "BrevoService instantiation failed";
}
echo "\n";

// 7. Vérifier les données de test
echo "🔍 Test 7: Test Data\n";
$companies = \App\Models\Company::count();
$feedbackRequests = \App\Models\FeedbackRequest::count();
$pendingRequests = \App\Models\FeedbackRequest::whereIn('status', ['sent', 'pending'])
    ->whereDoesntHave('feedback')
    ->count();

echo "   ├─ Companies: $companies\n";
echo "   ├─ Feedback Requests: $feedbackRequests\n";
echo "   └─ Pending (eligible for reminders): $pendingRequests\n";

if ($companies === 0) {
    $warnings[] = "No companies in database (test environment)";
}
if ($pendingRequests === 0) {
    $warnings[] = "No pending feedback requests found";
}
echo "\n";

// 8. Vérifier la commande artisan
echo "🔍 Test 8: Artisan Command\n";
echo "   ├─ Checking 'reminders:send' command... ";
try {
    $output = shell_exec('php artisan list | grep "reminders:send"');
    if ($output && strpos($output, 'reminders:send') !== false) {
        echo "✅ EXISTS\n";
        $success[] = "Artisan command reminders:send found";
    } else {
        echo "❌ NOT FOUND\n";
        $warnings[] = "Artisan command reminders:send not found (automatic reminders won't work)";
    }
} catch (\Exception $e) {
    echo "❌ ERROR\n";
}
echo "\n";

// 9. Vérifier le scheduler
echo "🔍 Test 9: Scheduler Configuration\n";
echo "   ├─ Checking Kernel schedule... ";
$kernelPath = app_path('Console/Kernel.php');
if (file_exists($kernelPath)) {
    $content = file_get_contents($kernelPath);
    if (strpos($content, 'reminders:send') !== false) {
        echo "✅ CONFIGURED\n";
        $success[] = "Scheduler configured for automatic reminders";
        
        // Extraire la configuration
        if (preg_match('/dailyAt\([\'"](\d{2}:\d{2})[\'"]\)/', $content, $matches)) {
            echo "   └─ Scheduled at: " . $matches[1] . "\n";
        }
    } else {
        echo "❌ NOT CONFIGURED\n";
        $warnings[] = "Scheduler not configured (automatic reminders won't run)";
    }
} else {
    echo "❌ Kernel.php not found\n";
}
echo "\n";

// 10. Résumé
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║                         RÉSUMÉ                             ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";
echo "\n";

echo "✅ Succès (" . count($success) . "):\n";
foreach ($success as $msg) {
    echo "   • $msg\n";
}
echo "\n";

if (count($warnings) > 0) {
    echo "⚠️  Avertissements (" . count($warnings) . "):\n";
    foreach ($warnings as $msg) {
        echo "   • $msg\n";
    }
    echo "\n";
}

if (count($errors) > 0) {
    echo "❌ Erreurs (" . count($errors) . "):\n";
    foreach ($errors as $msg) {
        echo "   • $msg\n";
    }
    echo "\n";
    echo "🔧 Actions requises pour corriger les erreurs:\n";
    echo "   1. Vérifier que toutes les migrations ont été exécutées\n";
    echo "   2. Vérifier la configuration Brevo dans .env\n";
    echo "   3. Vérifier que les routes sont correctement enregistrées\n";
    echo "\n";
    exit(1);
} else {
    echo "🎉 Tous les tests sont passés! Le système de reminder est correctement configuré.\n";
    echo "\n";
    echo "💡 Pour tester manuellement:\n";
    echo "   • Cliquez sur le bouton 'Relancer' dans la page Feedbacks ou Customers\n";
    echo "   • Vérifiez les logs: tail -f storage/logs/laravel.log | grep Reminder\n";
    echo "   • Testez la commande: php artisan reminders:send\n";
    echo "\n";
    exit(0);
}
