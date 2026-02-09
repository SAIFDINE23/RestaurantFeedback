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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            
            // Identification du plan
            $table->string('name'); // FREE, BASIC, PRO
            $table->string('slug')->unique(); // free, basic, pro
            
            // Prix
            $table->decimal('price', 8, 2); // 0.00, 29.00, 59.00
            $table->string('currency')->default('EUR');
            $table->enum('billing_period', ['month', 'year'])->default('month');
            
            // Quotas SMS
            $table->integer('sms_quota_monthly')->default(0); // Ancien champ (dépendance)
            $table->boolean('email_unlimited')->default(true); // Tous ont emails illimités
            
            // Quotas Crédits (Unités Luminea)
            $table->decimal('credits_monthly', 10, 2)->default(0); // 500, 5000, 10000 unités
            
            // Limites
            $table->integer('max_restaurants')->default(1); // Tous à 1 restaurant
            $table->integer('max_users')->nullable(); // 1 pour FREE, null (illimité) pour BASIC/PRO
            $table->integer('max_feedbacks')->nullable(); // 20 pour FREE, null (illimité) pour BASIC/PRO
            
            // Features IA (JSON pour flexibilité)
            $table->json('features')->nullable(); 
            // {
            //   "ai_reply_generation": false/true,
            //   "auto_reply": false/true,
            //   "google_redirect": true,
            //   "radar_ai": false/true,
            //   "dashboard": "basic"/"advanced",
            //   "analytics": false/true
            // }
            
            // Metadata
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0); // Pour affichage (FREE=0, BASIC=1, PRO=2)
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
