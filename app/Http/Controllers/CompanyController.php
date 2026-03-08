<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit(Request $request)
    {
        $company = $request->user()->company;

        return Inertia::render('Company/Edit', [
            'company' => $company,
        ]);
    }

    

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sector' => ['nullable', 'string', 'max:255'],
            'google_place_id' => ['nullable', 'string', 'max:255'],

        ]);

        $company = $request->user()->company;
        $company->update($validated);

        return redirect()
            ->route('company.edit')
            ->with('success', 'Informations de l’entreprise mises à jour');
    }
    public function editReviewPlatforms(Request $request)
    {
        $company = $request->user()->company;

        return Inertia::render('Company/ReviewPlatforms', [
            'company' => $company,
        ]);
    }

    public function updateReviewPlatforms(Request $request)
    {
        $platforms = [
            'google', 'facebook', 'tripadvisor', 'lafourchette', 'trustpilot', 
            'zomato', 'opentable', 'yelp', 'deliveroo', 'ubereats', 'justeat', 
            'michelin', 'booking', 'petitfute', 'discount', 'restopolis', 
            'gaultmillau', 'other'
        ];

        $rules = [];
        foreach ($platforms as $platform) {
            $rules["{$platform}.enabled"] = 'required|boolean';
            $rules["{$platform}.url"] = 'nullable|url';
        }

        $validated = $request->validate($rules);

        $company = $request->user()->company;
        $company->update([
            'review_platforms' => $validated
        ]);

        return redirect()
            ->route('company.review-platforms.edit')
            ->with('success', 'Configuration des plateformes mise à jour');
    }

    /**
     * Delete user account and associated company data
     */
    public function destroyAccount(Request $request)
    {
        $request->validate([
            'confirmation' => ['required', 'string'],
        ]);

        // Verify the user typed "SUPPRIMER"
        if ($request->input('confirmation') !== 'SUPPRIMER') {
            return back()->withErrors([
                'confirmation' => 'Veuillez taper "SUPPRIMER" pour confirmer la suppression.'
            ]);
        }

        $user = $request->user();
        $company = $user->company;

        // Delete company and all associated data (via cascading deletes)
        if ($company) {
            $company->delete();
        }

        // Logout user
        Auth::logout();

        // Delete user account
        $user->delete();

        // Invalidate session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')
            ->with('success', 'Votre compte a été supprimé avec succès.');
    }
}
