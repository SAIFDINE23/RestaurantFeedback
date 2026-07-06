<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckCredits
{
    /**
     * Vérifie si l'utilisateur a suffisamment de crédits
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  float  $minCredits  Le nombre minimum de crédits requis (optionnel)
     */
    public function handle(Request $request, Closure $next, float $minCredits = 1): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login')
                ->with('error', 'Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        $company = $user->company;

        if (!$company) {
            return redirect()->route('dashboard')
                ->with('error', 'Aucune entreprise associée à votre compte.');
        }

        $subscription = $company->subscription;

        if (!$subscription || !$subscription->isActive()) {
            return redirect()->route('subscription.index')
                ->with('error', 'Vous devez avoir un abonnement actif.');
        }

        $credits = $subscription->credits;

        if (!$credits) {
            Log::warning('No credits found for subscription', [
                'subscription_id' => $subscription->id,
                'company_id' => $company->id,
            ]);

            return redirect()->route('subscription.index')
                ->with('error', 'Aucun crédit trouvé. Veuillez contacter le support.');
        }

        // Auto-reset si nécessaire
        if ($credits->needsMonthlyReset()) {
            $credits->resetMonthlyCredits();
        }

        // Les emails sont gratuits — seul l'envoi SMS consomme des crédits.
        // La limite d'emails est gérée par le middleware plan.limits:feedbacks.
        $channel = $request->input('channel');
        if ($channel === 'email') {
            return $next($request);
        }

        if ($credits->credits_total_available < $minCredits) {
            return redirect()->route('subscription.index')
                ->with('error', "Crédits SMS insuffisants. Vous avez {$credits->credits_total_available} unités disponibles. Achetez des add-ons ou upgradez votre plan.");
        }

        return $next($request);
    }
}
