<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\FeedbackRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Liste des clients de la company.
     */
    public function index()
    {
        $company = Auth::user()->company;

        $customers = $company->customers()
            ->with(['feedbackRequests' => fn ($q) => $q->latest()])
            ->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Formulaire d'ajout manuel.
     */
    public function create()
    {
        return Inertia::render('Customers/Create');
    }

    /**
     * Ajouter un customer manuel.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $company = Auth::user()->company;

        // Vérifier si le client existe déjà
        if (Customer::where('email', $request->email)
            ->where('company_id', $company->id)
            ->exists()) {
            return back()->withErrors(['email' => 'Ce client existe déjà.']);
        }

        Customer::create([
            'company_id' => $company->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
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

        return redirect()->route('customers.show', $customer)->with('success', 'Client mis à jour avec succès.');
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

    public function destroy(Request $request, Customer $customer)
    {
        // 🔐 Sécurité : vérifier que le client appartient bien à l'utilisateur connecté
        if ($customer->company_id !== $request->user()->company->id) {
            abort(403);
        }

        // 🧹 Suppression propre (feedbacks liés)
        $customer->feedbackRequests()->delete();

        // ❌ Suppression du client
        $customer->delete();

        return back()->with('success', 'Client supprimé avec succès');
    }

    /**
     * Upload CSV pour créer plusieurs clients.
     */
    public function importCSV(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt',
        ]);

        $company = Auth::user()->company;
        $file = fopen($request->file('csv_file')->getRealPath(), 'r');

        $header = fgetcsv($file); // name,email,phone

        $added = 0;
        $skipped = 0;

        while (($row = fgetcsv($file)) !== false) {
            if (count($row) !== count($header)) {
                $skipped++;
                continue;
            }

            $data = array_combine($header, $row);

            if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            if (Customer::where('email', $data['email'])
                ->where('company_id', $company->id)
                ->exists()) {
                $skipped++;
                continue;
            }

            Customer::create([
                'company_id' => $company->id,
                'name' => $data['name'] ?? null,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
            ]);

            $added++;
        }

        fclose($file);

        return back()->with('success', "$added clients ajoutés, $skipped ignorés.");
    }
}
