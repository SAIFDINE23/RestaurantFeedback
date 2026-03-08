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
            $table->timestamp('resolved_at')->nullable()->after('replied_at');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null')->after('resolved_at');
            $table->text('resolution_note')->nullable()->after('resolved_by');
            $table->index('resolved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            $table->dropForeign(['resolved_by']);
            $table->dropIndex(['resolved_at']);
            $table->dropColumn(['resolved_at', 'resolved_by', 'resolution_note']);
        });
    }
};
