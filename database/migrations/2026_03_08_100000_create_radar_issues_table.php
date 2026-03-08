<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('radar_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('task_id')->nullable()->constrained('tasks')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // service, qualite, proprete, prix, ambiance, menu, etc.
            $table->enum('severity', ['P0', 'P1', 'P2'])->default('P1');
            $table->enum('status', ['detected', 'task_created', 'resolved'])->default('detected');
            $table->timestamp('detected_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });

        Schema::create('radar_issue_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('radar_issue_id')->constrained('radar_issues')->onDelete('cascade');
            $table->foreignId('feedback_id')->constrained('feedback')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['radar_issue_id', 'feedback_id']);
            $table->index('feedback_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('radar_issue_feedback');
        Schema::dropIfExists('radar_issues');
    }
};
