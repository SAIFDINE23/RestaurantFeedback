<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $subscription = $user?->company?->subscription;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'subscription' => [
                'plan' => $subscription?->plan->only(['id', 'name', 'slug']),
                'features' => $subscription?->plan->features ?? [],
                'credits' => $subscription?->credits?->only([
                    'credits_total_available',
                    'credits_available_monthly',
                    'credits_addon_balance',
                ]),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
