<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('feedback_public_token', 16)->nullable()->unique()->after('qr_code_token');
        });

        // Générer un token pour chaque company existante
        DB::table('companies')->whereNull('feedback_public_token')->get()->each(function ($company) {
            DB::table('companies')
                ->where('id', $company->id)
                ->update(['feedback_public_token' => Str::random(12)]);
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('feedback_public_token');
        });
    }
};
