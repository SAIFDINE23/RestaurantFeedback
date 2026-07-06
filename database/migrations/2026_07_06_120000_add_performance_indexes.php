<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * INFRA-03 — Index de performance.
 *
 * Contexte : la prod tourne sur PostgreSQL (Supabase). Contrairement à MySQL,
 * Postgres ne crée PAS d'index automatique sur les colonnes de clés étrangères.
 * Les colonnes ci-dessous sont utilisées dans les requêtes les plus fréquentes
 * (ReminderService, dashboards, contrôle anti-fraude, Resolution Velocity) et
 * n'étaient pas indexées → scans de table sous charge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feedback_requests', function (Blueprint $table) {
            // ReminderService : whereIn('status') + where('company_id')
            $table->index(['company_id', 'status'], 'fr_company_status_idx');
            // Dashboards / analytics : filtres temporels par company
            $table->index(['company_id', 'created_at'], 'fr_company_created_idx');
            // Customer::feedbackRequests() + attribution réactivation (FK non indexée sur PG)
            $table->index('customer_id', 'fr_customer_idx');
        });

        Schema::table('feedback', function (Blueprint $table) {
            // Relation feedback → feedbackRequest (FK non indexée sur PG)
            $table->index('feedback_request_id', 'fb_request_idx');
            // Contrôle anti-fraude (comptage mensuel) + dashboards
            $table->index('created_at', 'fb_created_idx');
            // Resolution Velocity : "négatifs non résolus" (rating <= X AND resolved_at IS NULL)
            $table->index(['rating', 'resolved_at'], 'fb_rating_resolved_idx');
        });
    }

    public function down(): void
    {
        Schema::table('feedback_requests', function (Blueprint $table) {
            $table->dropIndex('fr_company_status_idx');
            $table->dropIndex('fr_company_created_idx');
            $table->dropIndex('fr_customer_idx');
        });

        Schema::table('feedback', function (Blueprint $table) {
            $table->dropIndex('fb_request_idx');
            $table->dropIndex('fb_created_idx');
            $table->dropIndex('fb_rating_resolved_idx');
        });
    }
};
