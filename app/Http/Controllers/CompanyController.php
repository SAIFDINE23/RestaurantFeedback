<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
        $validated = $request->validate([
            'google.enabled' => 'required|boolean',
            'google.url' => 'nullable|url',
            'tripadvisor.enabled' => 'required|boolean',
            'tripadvisor.url' => 'nullable|url',
            'yelp.enabled' => 'required|boolean',
            'yelp.url' => 'nullable|url',
            'facebook.enabled' => 'required|boolean',
            'facebook.url' => 'nullable|url',
            'trustpilot.enabled' => 'required|boolean',
            'trustpilot.url' => 'nullable|url',
            'other.enabled' => 'required|boolean',
            'other.url' => 'nullable|url',
        ]);

        $company = $request->user()->company;
        $company->update([
            'review_platforms' => $validated
        ]);

        return redirect()
            ->route('company.review-platforms.edit')
            ->with('success', 'Configuration des plateformes mise à jour');
    }}
