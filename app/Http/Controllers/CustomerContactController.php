<?php

namespace App\Http\Controllers;

use App\Models\CustomerContact;
use App\Models\FeedbackRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CustomerContactController extends Controller
{
    /**
     * Affiche la liste des contacts
     */
    public function index(Request $request)
    {
        $company = $request->user()->company;

        $query = CustomerContact::where('company_id', $company->id)
            ->orderBy('created_at', 'desc');

        // Filtrer par source si demandé
        if ($request->has('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        // Recherche par nom ou email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%");
            });
        }

        $contacts = $query->paginate(20)->withQueryString();

        // Stats
        $stats = [
            'total' => CustomerContact::where('company_id', $company->id)->count(),
            'qr_code' => CustomerContact::where('company_id', $company->id)->where('source', 'qr_code')->count(),
            'manual' => CustomerContact::where('company_id', $company->id)->where('source', 'manual')->count(),
            'import' => CustomerContact::where('company_id', $company->id)->where('source', 'import')->count(),
            'recent' => CustomerContact::where('company_id', $company->id)->recent(7)->count(),
        ];

        // QR Code URL
        $qrCodeUrl = $company->getPublicFormUrl();

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'stats' => $stats,
            'filters' => [
                'source' => $request->source ?? 'all',
                'search' => $request->search ?? '',
            ],
            'qrCodeUrl' => $qrCodeUrl,
        ]);
    }

    /**
     * Ajoute un contact manuellement
     */
    public function store(Request $request)
    {
        $company = $request->user()->company;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Vérifier si le contact existe déjà
        $existingContact = CustomerContact::where('company_id', $company->id)
            ->where('email', $request->email)
            ->first();

        if ($existingContact) {
            return back()->withErrors(['email' => 'Ce contact existe déjà dans votre liste.']);
        }

        CustomerContact::create([
            'company_id' => $company->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'source' => 'manual',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Contact ajouté avec succès.');
    }

    /**
     * Supprime un contact
     */
    public function destroy(Request $request, CustomerContact $contact)
    {
        $company = $request->user()->company;

        // Vérifier que le contact appartient à cette company
        if ($contact->company_id !== $company->id) {
            abort(403);
        }

        $contact->delete();

        return back()->with('success', 'Contact supprimé avec succès.');
    }

    /**
     * Importe des contacts via CSV
     */
    public function import(Request $request)
    {
        $company = $request->user()->company;

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $file = $request->file('file');
        $path = $file->getRealPath();
        $csv = array_map('str_getcsv', file($path));

        // Supprimer l'en-tête
        $header = array_shift($csv);

        $imported = 0;
        $skipped = 0;
        $errors = [];

        foreach ($csv as $index => $row) {
            // Vérifier qu'on a au moins name et email
            if (count($row) < 2) {
                $skipped++;
                continue;
            }

            $name = trim($row[0] ?? '');
            $email = trim($row[1] ?? '');
            $phone = trim($row[2] ?? '');

            // Validation basique
            if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Ligne " . ($index + 2) . ": email invalide ou nom manquant";
                $skipped++;
                continue;
            }

            // Vérifier si le contact existe déjà
            $existingContact = CustomerContact::where('company_id', $company->id)
                ->where('email', $email)
                ->first();

            if ($existingContact) {
                $skipped++;
                continue;
            }

            // Créer le contact
            CustomerContact::create([
                'company_id' => $company->id,
                'name' => $name,
                'email' => $email,
                'phone' => $phone ?: null,
                'source' => 'import',
            ]);

            $imported++;
        }

        $message = "{$imported} contact(s) importé(s) avec succès.";
        if ($skipped > 0) {
            $message .= " {$skipped} contact(s) ignoré(s) (doublons ou invalides).";
        }

        return back()->with('success', $message)->with('import_errors', $errors);
    }

    /**
     * Envoie une demande de feedback à un ou plusieurs contacts
     */
    public function sendFeedbackRequest(Request $request)
    {
        $company = $request->user()->company;

        $validator = Validator::make($request->all(), [
            'contact_ids' => 'required|array|min:1',
            'contact_ids.*' => 'exists:customer_contacts,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $contacts = CustomerContact::whereIn('id', $request->contact_ids)
            ->where('company_id', $company->id)
            ->get();

        if ($contacts->isEmpty()) {
            return back()->withErrors(['contacts' => 'Aucun contact sélectionné.']);
        }

        $sent = 0;

        foreach ($contacts as $contact) {
            // Créer une demande de feedback
            FeedbackRequest::create([
                'company_id' => $company->id,
                'customer_name' => $contact->name,
                'customer_email' => $contact->email,
                'customer_phone' => $contact->phone,
                'sent_at' => now(),
                'channel' => 'email', // Par défaut email, tu peux adapter selon tes besoins
            ]);

            $sent++;
        }

        return back()->with('success', "{$sent} demande(s) de feedback envoyée(s) avec succès.");
    }
}

