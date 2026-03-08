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
        Schema::table('feedback_requests', function (Blueprint $table) {
            // Champs pour tracker les reminders
            $table->integer('reminder_count')->default(0)->comment('Nombre de reminders envoyés');
            $table->timestamp('last_reminder_sent_at')->nullable()->comment('Dernier reminder envoyé');
            $table->timestamp('first_reminder_sent_at')->nullable()->comment('Premier reminder envoyé');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedback_requests', function (Blueprint $table) {
            $table->dropColumn(['reminder_count', 'last_reminder_sent_at', 'first_reminder_sent_at']);
        });
    }
};
