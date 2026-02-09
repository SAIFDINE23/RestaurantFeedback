<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migration des données existantes si nécessaire
        // Cette migration est vide si la base est nouvelle
    }

    public function down(): void
    {
        // Pas de rollback nécessaire pour cette migration de données
    }
};
