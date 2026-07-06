<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Mail\WelcomeMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:'.User::class,
        'password' => ['required', 'confirmed', Rules\Password::defaults()],
        'company_name' => 'required|string|max:255', // <-- validation
    ]);

    // Créer l'utilisateur
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    // Créer la company avec le nom fourni
    Company::create([
        'user_id' => $user->id,
        'name' => $request->company_name,
    ]);

    event(new Registered($user));

    Auth::login($user);

    // Send welcome email (silently — don't block registration on mail failure)
    try {
        Mail::to($user->email)->send(new WelcomeMail($user, $request->company_name));
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::warning('Welcome email failed: ' . $e->getMessage());
    }

    return redirect(route('onboarding.index'));
}

}
