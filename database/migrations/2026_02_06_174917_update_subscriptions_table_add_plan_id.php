<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Supprimer l'ancien champ 'plan' (string)
            $table->dropColumn('plan');
            
            // Ajouter la foreign key vers la table plans
            $table->foreignId('plan_id')
                ->after('company_id')
                ->constrained('plans')
                ->onDelete('restrict'); // Empêche la suppression d'un plan utilisé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Supprimer la foreign key
            $table->dropForeignIdFor(\App\Models\Plan::class);
            $table->dropColumn('plan_id');
        });
    }
};
