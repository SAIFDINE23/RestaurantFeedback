<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ajouter les nouvelles colonnes à customers
        Schema::table('customers', function (Blueprint $table) {
            $table->enum('source', ['qr_code', 'manual', 'import'])->default('manual')->after('phone');
            $table->text('notes')->nullable()->after('source');
        });

        // 2. Migrer les données de customer_contacts vers customers (s'il y en a)
        if (Schema::hasTable('customer_contacts')) {
            $contacts = DB::table('customer_contacts')->get();
            foreach ($contacts as $contact) {
                // Vérifier que le contact n'existe pas déjà dans customers
                $exists = DB::table('customers')
                    ->where('company_id', $contact->company_id)
                    ->where('email', $contact->email)
                    ->exists();

                if (!$exists) {
                    DB::table('customers')->insert([
                        'company_id' => $contact->company_id,
                        'name' => $contact->name,
                        'email' => $contact->email,
                        'phone' => $contact->phone,
                        'source' => $contact->source,
                        'notes' => $contact->notes,
                        'created_at' => $contact->created_at,
                        'updated_at' => $contact->updated_at,
                    ]);
                }
            }

            // 3. Supprimer la table customer_contacts (devenue inutile)
            Schema::dropIfExists('customer_contacts');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['source', 'notes']);
        });
    }
};
