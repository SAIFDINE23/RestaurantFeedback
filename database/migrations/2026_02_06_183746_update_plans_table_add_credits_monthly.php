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
        // Cette migration est déjà intégrée dans create_plans_table
        // On la laisse vide pour éviter les doublons
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rien à faire
    }
};
