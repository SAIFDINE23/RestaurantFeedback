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
        Schema::create('sms_credit_rates', function (Blueprint $table) {
            $table->id();
            
            // Pays
            $table->string('country_code')->unique(); // FR, MA, UK, US, etc.
            $table->string('country_name');
            
            // Coûts réels Brevo
            $table->decimal('brevo_credit_cost', 8, 2); // 4.50, 20.00, etc.
            
            // Ratio de conversion vers Unités Luminea
            // Base : 1 Unité = 4.50 crédits Brevo (France)
            $table->decimal('units_per_sms', 8, 2); // 1.0, 4.5, 5.0, etc.
            
            // Description
            $table->text('description')->nullable();
            
            // Activation
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sms_credit_rates');
    }
};
