<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Mettre à jour les ends_at existants avec une date dans 30 jours
            DB::statement('UPDATE subscriptions SET ends_at = NOW() + INTERVAL \'30 days\' WHERE ends_at IS NULL AND status = ?', ['active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            DB::statement('UPDATE subscriptions SET ends_at = NULL WHERE ends_at IS NOT NULL');
        });
    }
};
