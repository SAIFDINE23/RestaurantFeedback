<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    private function computeCurrentStep(User $user, $company): int
    {
        $derivedStep = 1;

        if (! empty($company->sector)) {
            $derivedStep = 2;
        }

        if (! empty($company->google_review_url)) {
            $derivedStep = 3;
        }

        if ($company->customers()->exists()) {
            $derivedStep = 4;
        }

        return max($user->onboarding_step ?? 1, $derivedStep);
    }

    /**
     * Show the onboarding wizard.
     * Current step is derived from the data already saved (idempotent).
     */
    public function index()
    {
        /** @var User $user */
        $user    = Auth::user();
        $company = $user->company;

        // No company → go to dashboard (edge case)
        if (! $company) {
            return redirect()->route('dashboard');
        }

        // Already completed → skip to dashboard
        if ($user->onboarding_completed_at) {
            return redirect()->route('dashboard');
        }

        $currentStep = $this->computeCurrentStep($user, $company);

        // Derive which steps are done from existing data or saved onboarding progress
        $step1Done = ! empty($company->sector) || $currentStep > 1;
        $step2Done = ! empty($company->google_review_url) || $currentStep > 2;
        $step3Done = $company->customers()->exists() || $currentStep > 3;

        // Pass last customer for the celebration screen
        $lastCustomer = $step3Done
            ? $company->customers()->latest()->first()
            : null;

        return Inertia::render('Onboarding/Index', [
            'company'     => [
                'name'              => $company->name,
                'sector'            => $company->sector,
                'google_review_url' => $company->google_review_url,
            ],
            'steps' => [
                ['id' => 1, 'title' => 'Votre secteur',   'done' => $step1Done],
                ['id' => 2, 'title' => 'Lien Google',      'done' => $step2Done],
                ['id' => 3, 'title' => 'Premier client',   'done' => $step3Done],
                ['id' => 4, 'title' => "C'est parti !",    'done' => false],
            ],
            'currentStep'  => $currentStep,
            'lastCustomer' => $lastCustomer ? [
                'id'    => $lastCustomer->id,
                'name'  => $lastCustomer->name,
                'email' => $lastCustomer->email,
                'phone' => $lastCustomer->phone,
            ] : null,
        ]);
    }

    /**
     * Save a step and redirect back to the wizard (which recalculates the step).
     */
    public function saveStep(Request $request, int $step)
    {
        /** @var User $user */
        $user    = Auth::user();
        $company = $user->company;

        if (! $company) {
            return redirect()->route('dashboard');
        }

        switch ($step) {
            case 1:
                $request->validate([
                    'sector' => 'required|string|max:100',
                ]);
                $company->update(['sector' => $request->sector]);
                $user->update(['onboarding_step' => max($user->onboarding_step ?? 1, 2)]);
                break;

            case 2:
                $request->validate([
                    'google_review_url' => 'nullable|url|max:500',
                ]);
                // Allow skipping with empty value
                $company->update(['google_review_url' => $request->google_review_url ?: null]);
                $user->update(['onboarding_step' => max($user->onboarding_step ?? 1, 3)]);
                break;

            case 3:
                if ($request->boolean('skip_customer')) {
                    $user->update(['onboarding_step' => 4]);
                    break;
                }

                $request->validate([
                    'name'  => 'required|string|max:255',
                    'email' => 'nullable|email|max:255',
                    'phone' => 'nullable|string|max:30',
                ]);

                if (! $request->email && ! $request->phone) {
                    return back()->withErrors(['contact' => 'Veuillez fournir un email ou un numéro de téléphone.']);
                }

                Customer::create([
                    'company_id' => $company->id,
                    'name'       => $request->name,
                    'email'      => $request->email ?: null,
                    'phone'      => $request->phone ?: null,
                    'source'     => 'manual',
                ]);

                $user->update(['onboarding_step' => 4]);
                break;

            case 4:
                // Celebration step — mark onboarding as complete
                $user->update([
                    'onboarding_step' => 4,
                    'onboarding_completed_at' => now(),
                ]);
                return redirect()->route('dashboard');
        }

        return redirect()->route('onboarding.index');
    }

    /**
     * Skip onboarding entirely.
     */
    public function skip()
    {
        /** @var User $user */
        $user = Auth::user();

        $user->update([
            'onboarding_step' => 4,
            'onboarding_completed_at' => now(),
        ]);

        return redirect()->route('dashboard');
    }
}
