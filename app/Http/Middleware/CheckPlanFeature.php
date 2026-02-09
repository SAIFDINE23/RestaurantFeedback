<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanFeature
{
    /**
     * Vérifie si l'utilisateur a accès à une feature selon son plan
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $feature  La feature requise (ex: 'ai_reply_generation', 'radar_ai')
     */
    public function handle(Request $request, Closure $next, string $feature): Response
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
                ->with('error', 'Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.');
        }

        if (!$subscription->hasFeature($feature)) {
            $featureNames = [
                'ai_reply_generation' => 'Génération IA de réponses',
                'radar_ai' => 'Radar IA',
                'auto_reply' => 'Réponses automatiques',
                'advanced_analytics' => 'Analyses avancées',
                'multi_language' => 'Support multilingue',
            ];

            $featureName = $featureNames[$feature] ?? $feature;
            $currentPlan = $subscription->plan->name;

            return redirect()->route('subscription.index')
                ->with('error', "La fonctionnalité \"{$featureName}\" n'est pas disponible dans votre plan {$currentPlan}. Veuillez upgrader votre abonnement.");
        }

        return $next($request);
    }
}
