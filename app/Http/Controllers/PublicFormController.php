<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PublicFormController extends Controller
{
    /**
     * Affiche le formulaire public
     */
    public function show(string $token)
    {
        $company = Company::where('qr_code_token', $token)->firstOrFail();

        return Inertia::render('PublicForm/Show', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'logo_url' => $company->logo_url,
                'design_settings' => $company->design_settings,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Enregistre un contact depuis le formulaire public
     */
    public function store(Request $request, string $token)
    {
        $company = Company::where('qr_code_token', $token)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
        ], [
            'name.required' => 'Le nom est obligatoire',
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Vérifier si le client existe déjà
        $existingCustomer = Customer::where('company_id', $company->id)
            ->where('email', $request->email)
            ->first();

        if ($existingCustomer) {
            return back()->with('info', 'Vous êtes déjà inscrit à notre liste VIP ! Merci.');
        }

        // Créer le client
        Customer::create([
            'company_id' => $company->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'source' => 'qr_code',
        ]);

        return back()->with('success', 'Merci ! Vous êtes maintenant membre de notre liste VIP.');
    }
}

