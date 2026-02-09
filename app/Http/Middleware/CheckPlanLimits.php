<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimits
{
    /**
     * Vérifie si l'utilisateur a atteint les limites de son plan
     * (max restaurants, max users, max feedbacks)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $limitType  Le type de limite (restaurants, users, feedbacks)
     */
    public function handle(Request $request, Closure $next, string $limitType): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $company = $user->company;

        if (!$company || !$company->subscription) {
            return $next($request);
        }

        $plan = $company->subscription->plan;

        switch ($limitType) {
            case 'restaurants':
                if ($plan->max_restaurants !== null) {
                    $currentCount = 1; // V1: 1 restaurant par company
                    if ($currentCount >= $plan->max_restaurants) {
                        return redirect()->route('subscription.index')
                            ->with('error', "Limite de restaurants atteinte ({$plan->max_restaurants}). Veuillez upgrader votre plan.");
                    }
                }
                break;

            case 'users':
                if ($plan->max_users !== null) {
                    $currentCount = $company->users()->count();
                    if ($currentCount >= $plan->max_users) {
                        return redirect()->route('subscription.index')
                            ->with('error', "Limite d'utilisateurs atteinte ({$plan->max_users}). Veuillez upgrader votre plan.");
                    }
                }
                break;

            case 'feedbacks':
                if ($plan->max_feedbacks !== null) {
                    $currentCount = $company->feedbackRequests()->whereMonth('created_at', now()->month)->count();
                    if ($currentCount >= $plan->max_feedbacks) {
                        return redirect()->route('subscription.index')
                            ->with('error', "Limite de feedbacks mensuelle atteinte ({$plan->max_feedbacks}). Veuillez upgrader votre plan.");
                    }
                }
                break;
        }

        return $next($request);
    }
}
