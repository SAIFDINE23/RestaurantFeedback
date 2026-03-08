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
        Schema::table('feedback', function (Blueprint $table) {
            $table->boolean('is_pinned')->default(false)->comment('Feedback épinglé');
            $table->boolean('is_favorited')->default(false)->comment('Feedback en favoris');
            $table->timestamp('pinned_at')->nullable()->comment('Date d\'épinglage');
            $table->timestamp('favorited_at')->nullable()->comment('Date d\'ajout aux favoris');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            $table->dropColumn(['is_pinned', 'is_favorited', 'pinned_at', 'favorited_at']);
        });
    }
};
