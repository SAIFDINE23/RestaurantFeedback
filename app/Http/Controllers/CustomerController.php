<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\FeedbackRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Liste des clients/contacts de la company.
     */
    public function index(Request $request)
    {
        $company = $request->user()->company;

        $query = Customer::where('company_id', $company->id)
            ->with(['feedbackRequests' => fn ($q) => $q->latest()])
            ->orderBy('created_at', 'desc');

        // Filtrer par source
        if ($request->has('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        // Recherche
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
            'total' => Customer::where('company_id', $company->id)->count(),
            'qr_code' => Customer::where('company_id', $company->id)->where('source', 'qr_code')->count(),
            'manual' => Customer::where('company_id', $company->id)->where('source', 'manual')->count(),
            'import' => Customer::where('company_id', $company->id)->where('source', 'import')->count(),
            'recent' => Customer::where('company_id', $company->id)->recent(7)->count(),
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
     * Ajouter un client manuellement.
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

        // Vérifier si le client existe déjà
        if (Customer::where('email', $request->email)
            ->where('company_id', $company->id)
            ->exists()) {
            return back()->withErrors(['email' => 'Ce client existe déjà dans votre liste.']);
        }

        Customer::create([
            'company_id' => $company->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'source' => 'manual',
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Client ajouté avec succès.');
    }

    /**
     * Afficher un client.
     */
    public function show(Request $request, Customer $customer)
    {
        if ($customer->company_id !== $request->user()->company->id) {
            abort(403);
        }

        $customer->load(['feedbackRequests' => fn ($q) => $q->latest()]);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Formulaire d'édition.
     */
    public function edit(Request $request, Customer $customer)
    {
        if ($customer->company_id !== $request->user()->company->id) {
            abort(403);
        }

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Mettre à jour un client.
     */
    public function update(Request $request, Customer $customer)
    {
        if ($customer->company_id !== $request->user()->company->id) {
            abort(403);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('customers')
                    ->where('company_id', $request->user()->company->id)
                    ->ignore($customer->id),
            ],
            'phone' => 'nullable|string|max:20',
        ]);

        $customer->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        return redirect()->route('customers.index')->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * Générer/afficher un QR Code de feedback pour un client.
     */
    public function qr(Request $request, Customer $customer)
    {
        if ($customer->company_id !== $request->user()->company->id) {
            abort(403);
        }

        $company = $request->user()->company;

        $feedbackRequest = FeedbackRequest::where('customer_id', $customer->id)
            ->where('company_id', $company->id)
            ->where('channel', 'qr')
            ->whereIn('status', ['pending', 'sent'])
            ->latest()
            ->first();

        if (!$feedbackRequest) {
            $feedbackRequest = FeedbackRequest::create([
                'company_id' => $company->id,
                'customer_id' => $customer->id,
                'channel' => 'qr',
                'token' => Str::uuid(),
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        }

        $qrUrl = rtrim(config('app.url'), '/') . '/feedback/' . $feedbackRequest->token;

        return Inertia::render('Customers/Qr', [
            'customer' => $customer,
            'qr_url' => $qrUrl,
            'token' => $feedbackRequest->token,
        ]);
    }

    /**
     * Supprimer un client.
     */
    public function destroy(Request $request, Customer $customer)
    {
        if ($customer->company_id !== $request->user()->company->id) {
            abort(403);
        }

        $customer->feedbackRequests()->delete();
        $customer->delete();

        return back()->with('success', 'Client supprimé avec succès.');
    }

    /**
     * Import CSV de clients.
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

        foreach ($csv as $index => $row) {
            if (count($row) < 2) {
                $skipped++;
                continue;
            }

            $name = trim($row[0] ?? '');
            $email = trim($row[1] ?? '');
            $phone = trim($row[2] ?? '');

            if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            if (Customer::where('company_id', $company->id)->where('email', $email)->exists()) {
                $skipped++;
                continue;
            }

            Customer::create([
                'company_id' => $company->id,
                'name' => $name,
                'email' => $email,
                'phone' => $phone ?: null,
                'source' => 'import',
            ]);

            $imported++;
        }

        $message = "{$imported} client(s) importé(s) avec succès.";
        if ($skipped > 0) {
            $message .= " {$skipped} ignoré(s) (doublons ou invalides).";
        }

        return back()->with('success', $message);
    }

    /**
     * Envoie une demande de feedback à un ou plusieurs clients.
     */
    public function sendFeedbackRequest(Request $request)
    {
        $company = $request->user()->company;

        $validator = Validator::make($request->all(), [
            'contact_ids' => 'required|array|min:1',
            'contact_ids.*' => 'exists:customers,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $customers = Customer::whereIn('id', $request->contact_ids)
            ->where('company_id', $company->id)
            ->get();

        if ($customers->isEmpty()) {
            return back()->withErrors(['contacts' => 'Aucun client sélectionné.']);
        }

        $sent = 0;

        foreach ($customers as $customer) {
            FeedbackRequest::create([
                'company_id' => $company->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'sent_at' => now(),
                'channel' => 'email',
            ]);

            $sent++;
        }

        return back()->with('success', "{$sent} demande(s) de feedback envoyée(s) avec succès.");
    }
}
