<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PostgreSQL uses a CHECK constraint for Laravel enum columns.
        // We need to drop the old constraint and recreate it with 'expired' added.
        DB::statement("ALTER TABLE feedback_requests DROP CONSTRAINT IF EXISTS feedback_requests_status_check");
        DB::statement("ALTER TABLE feedback_requests ADD CONSTRAINT feedback_requests_status_check CHECK (status IN ('pending', 'sent', 'completed', 'failed', 'responded', 'expired'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE feedback_requests DROP CONSTRAINT IF EXISTS feedback_requests_status_check");
        DB::statement("ALTER TABLE feedback_requests ADD CONSTRAINT feedback_requests_status_check CHECK (status IN ('pending', 'sent', 'completed', 'failed', 'responded'))");
    }
};
