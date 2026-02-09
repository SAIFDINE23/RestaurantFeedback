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
        Schema::create('subscription_credits', function (Blueprint $table) {
            $table->id();
            
            // Relation avec subscription
            $table->foreignId('subscription_id')
                ->constrained('subscriptions')
                ->cascadeOnDelete();
            
            // Quotas mensuels
            $table->decimal('credits_monthly', 10, 2); // 500, 5000, 10000 du plan
            $table->decimal('credits_used_monthly', 10, 2)->default(0); // Consommés ce mois
            $table->decimal('credits_available_monthly', 10, 2); // = monthly - used
            
            // Add-ons (recharges)
            $table->decimal('credits_addon_balance', 10, 2)->default(0); // Pool d'add-ons achetés
            
            // Solde total disponible
            $table->decimal('credits_total_available', 10, 2); // monthly_available + addon_balance
            
            // Reset mensuel
            $table->date('last_reset_date'); // Quand le quota mensuel a été reset
            
            $table->timestamps();
            $table->unique('subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_credits');
    }
};
