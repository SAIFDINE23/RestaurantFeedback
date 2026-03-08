<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$planCols = DB::table('information_schema.columns')
    ->where('table_schema', 'public')
    ->where('table_name', 'plans')
    ->orderBy('ordinal_position')
    ->pluck('column_name')
    ->all();

$subCols = DB::table('information_schema.columns')
    ->where('table_schema', 'public')
    ->where('table_name', 'subscriptions')
    ->orderBy('ordinal_position')
    ->pluck('column_name')
    ->all();

echo "plans columns:\n- " . implode("\n- ", $planCols) . "\n\n";
echo "subscriptions columns:\n- " . implode("\n- ", $subCols) . "\n\n";

echo "plans count: ".DB::table('plans')->count()."\n";
echo "subscriptions count: ".DB::table('subscriptions')->count()."\n";
