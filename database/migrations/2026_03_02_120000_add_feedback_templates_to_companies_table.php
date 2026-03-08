<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->text('feedback_sms_template')->nullable()->after('review_platforms');
            $table->string('feedback_email_subject_template')->nullable()->after('feedback_sms_template');
            $table->text('feedback_email_body_template')->nullable()->after('feedback_email_subject_template');
            $table->text('feedback_qr_template')->nullable()->after('feedback_email_body_template');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'feedback_sms_template',
                'feedback_email_subject_template',
                'feedback_email_body_template',
                'feedback_qr_template',
            ]);
        });
    }
};
