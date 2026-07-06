<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Feedback;
use App\Models\FeedbackReply;
use App\Models\FeedbackRequest;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $now = now();
        $from = $now->copy()->subDays(29)->startOfDay();
        $prevFrom = $from->copy()->subDays(30);
        $prevTo = $from->copy()->subSecond();
        $activeLikeStatuses = ['active', 'trialing', 'past_due'];

        $latestSubscriptionIds = Subscription::selectRaw('MAX(id) as id')
            ->groupBy('company_id');

        $latestSubscriptions = Subscription::query()
            ->whereIn('id', $latestSubscriptionIds)
            ->with(['plan', 'company'])
            ->get();

        $totalCompanies = Company::count();
        $totalCustomers = Customer::count();
        $totalRequests = FeedbackRequest::count();
        $totalReplies = FeedbackReply::count();

        $companiesLast30 = Company::whereBetween('created_at', [$from, $now])->count();
        $companiesPrev30 = Company::whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $companyGrowthRate = $companiesPrev30 > 0
            ? round((($companiesLast30 - $companiesPrev30) / $companiesPrev30) * 100, 1)
            : ($companiesLast30 > 0 ? 100 : 0);

        $activeCompanies = $latestSubscriptions->filter(fn ($s) => in_array($s->status, $activeLikeStatuses, true))->count();
        $paidCompanies = $latestSubscriptions->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free')->count();
        $paidActiveCompanies = $latestSubscriptions->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free' && in_array($s->status, $activeLikeStatuses, true))->count();
        $trialCompanies = $latestSubscriptions->where('status', 'trialing')->count();
        $pastDueCompanies = $latestSubscriptions->where('status', 'past_due')->count();

        $estimatedMrr = round($latestSubscriptions
            ->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free' && in_array($s->status, $activeLikeStatuses, true))
            ->sum(function ($subscription) {
                $price = (float) ($subscription->plan->price ?? 0);
                return $subscription->plan->billing_period === 'year' ? ($price / 12) : $price;
            }), 2);

        $activeRate = $totalCompanies > 0 ? round(($activeCompanies / $totalCompanies) * 100, 1) : 0;
        $paidRate = $totalCompanies > 0 ? round(($paidCompanies / $totalCompanies) * 100, 1) : 0;

        $requestsLast30 = FeedbackRequest::whereBetween('created_at', [$from, $now])->count();
        $requestsPrev30 = FeedbackRequest::whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $completedLast30 = FeedbackRequest::whereBetween('created_at', [$from, $now])->whereIn('status', ['completed', 'responded'])->count();
        $completedPrev30 = FeedbackRequest::whereBetween('created_at', [$prevFrom, $prevTo])->whereIn('status', ['completed', 'responded'])->count();
        $responseRate = $requestsLast30 > 0 ? round(($completedLast30 / $requestsLast30) * 100, 1) : 0;
        $responseRatePrev = $requestsPrev30 > 0 ? round(($completedPrev30 / $requestsPrev30) * 100, 1) : 0;

        $feedbacksLast30 = Feedback::whereBetween('created_at', [$from, $now])->count();
        $avgRating = Feedback::whereBetween('created_at', [$from, $now])->avg('rating');
        $avgRating = $avgRating ? round((float) $avgRating, 2) : null;

        $aiRepliesLast30 = FeedbackReply::whereBetween('created_at', [$from, $now])->where('responder_type', 'ai')->count();
        $adminRepliesLast30 = FeedbackReply::whereBetween('created_at', [$from, $now])->where('responder_type', 'admin')->count();
        $repliesLast30 = $aiRepliesLast30 + $adminRepliesLast30;
        $aiReplyRate = $repliesLast30 > 0 ? round(($aiRepliesLast30 / $repliesLast30) * 100, 1) : 0;

        $activeCreditsRows = Subscription::query()
            ->whereIn('id', $latestSubscriptionIds)
            ->with('credits')
            ->get()
            ->map(fn ($s) => $s->credits)
            ->filter();

        $creditsMonthly = round((float) $activeCreditsRows->sum('credits_monthly'), 2);
        $creditsUsed = round((float) $activeCreditsRows->sum('credits_used_monthly'), 2);
        $creditsUsageRate = $creditsMonthly > 0 ? round(($creditsUsed / $creditsMonthly) * 100, 1) : 0;

        $growthSeries = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();

            $newCompanies = Company::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $requests = FeedbackRequest::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $feedbacks = Feedback::whereBetween('created_at', [$monthStart, $monthEnd])->count();

            $growthSeries->push([
                'label' => $month->locale('fr')->translatedFormat('M'),
                'companies' => $newCompanies,
                'requests' => $requests,
                'feedbacks' => $feedbacks,
            ]);
        }

        $planMix = $latestSubscriptions
            ->groupBy(fn ($s) => $s->plan?->slug ?? 'unknown')
            ->map(function ($items, $slug) use ($totalCompanies) {
                $plan = $items->first()?->plan;
                $count = $items->count();
                return [
                    'slug' => $slug,
                    'name' => $plan?->name ?? strtoupper($slug),
                    'count' => $count,
                    'percentage' => $totalCompanies > 0 ? round(($count / $totalCompanies) * 100, 1) : 0,
                ];
            })
            ->values()
            ->sortByDesc('count')
            ->values();

        $operationalHealth = [
            [
                'label' => 'Adoption active',
                'value' => $activeRate,
                'target' => 75,
                'unit' => '%',
            ],
            [
                'label' => 'Conversion payante',
                'value' => $paidRate,
                'target' => 35,
                'unit' => '%',
            ],
            [
                'label' => 'Taux de réponse plateforme',
                'value' => $responseRate,
                'target' => 45,
                'unit' => '%',
            ],
            [
                'label' => 'Automatisation IA',
                'value' => $aiReplyRate,
                'target' => 60,
                'unit' => '%',
            ],
        ];

        $focusAreas = collect([
            $pastDueCompanies > 0 ? [
                'title' => 'Abonnements à risque',
                'message' => $pastDueCompanies . ' comptes sont en `past_due` et demandent une action rapide sur la rétention.',
                'tone' => 'danger',
            ] : null,
            $trialCompanies > 0 ? [
                'title' => 'Pipeline d’upsell actif',
                'message' => $trialCompanies . ' comptes sont en essai. Le moment est bon pour pousser l’activation produit.',
                'tone' => 'info',
            ] : null,
            $responseRate < 35 ? [
                'title' => 'Valeur produit à renforcer',
                'message' => 'Le taux de réponse plateforme reste bas. Il faut améliorer adoption, reminders et templates.',
                'tone' => 'warning',
            ] : null,
            $estimatedMrr > 0 ? [
                'title' => 'Base récurrente monétisée',
                'message' => 'MRR estimé à ' . number_format($estimatedMrr, 0, ',', ' ') . ' EUR avec ' . $paidActiveCompanies . ' comptes payants actifs.',
                'tone' => 'success',
            ] : null,
        ])->filter()->values();

        return Inertia::render('Admin/DashboardExecutive', [
            'stats' => [
                'totalCompanies' => $totalCompanies,
                'totalCustomers' => $totalCustomers,
                'totalRequests' => $totalRequests,
                'totalReplies' => $totalReplies,
                'companiesLast30' => $companiesLast30,
                'companiesPrev30' => $companiesPrev30,
                'companyGrowthRate' => $companyGrowthRate,
                'activeCompanies' => $activeCompanies,
                'paidCompanies' => $paidCompanies,
                'paidActiveCompanies' => $paidActiveCompanies,
                'trialCompanies' => $trialCompanies,
                'pastDueCompanies' => $pastDueCompanies,
                'activeRate' => $activeRate,
                'paidRate' => $paidRate,
                'estimatedMrr' => $estimatedMrr,
                'requestsLast30' => $requestsLast30,
                'requestsPrev30' => $requestsPrev30,
                'completedLast30' => $completedLast30,
                'feedbacksLast30' => $feedbacksLast30,
                'responseRate' => $responseRate,
                'responseRatePrev' => $responseRatePrev,
                'avgRating' => $avgRating,
                'aiRepliesLast30' => $aiRepliesLast30,
                'adminRepliesLast30' => $adminRepliesLast30,
                'aiReplyRate' => $aiReplyRate,
                'creditsMonthly' => $creditsMonthly,
                'creditsUsed' => $creditsUsed,
                'creditsUsageRate' => $creditsUsageRate,
            ],
            'growthSeries' => $growthSeries,
            'planMix' => $planMix,
            'operationalHealth' => $operationalHealth,
            'focusAreas' => $focusAreas,
        ]);
    }

    public function companies(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:40'],
            'plan' => ['nullable', 'string', 'max:40'],
            'sector' => ['nullable', 'string', 'max:80'],
            'sort' => ['nullable', 'string', 'max:40'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $statusFilter = (string) ($filters['status'] ?? 'all');
        $planFilter = (string) ($filters['plan'] ?? 'all');
        $sectorFilter = (string) ($filters['sector'] ?? 'all');
        $sort = (string) ($filters['sort'] ?? 'newest');

        $activeLikeStatuses = ['active', 'trialing', 'past_due'];

        // --- Stats globales ---
        $totalCompanies = Company::count();
        $activeCompanies = Company::whereHas('subscription', fn($q) => $q->whereIn('status', $activeLikeStatuses))->count();
        $freeCompanies = Company::whereHas('subscription', fn($q) => $q->whereHas('plan', fn($pq) => $pq->where('slug', 'free')))->count();
        $paidCompanies = Company::whereHas('subscription', fn($q) => $q->whereHas('plan', fn($pq) => $pq->where('slug', '!=', 'free'))->whereIn('status', $activeLikeStatuses))->count();
        $trialCompanies = Company::whereHas('subscription', fn($q) => $q->where('status', 'trialing'))->count();

        $companiesThisMonth = Company::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $lastMonthCompanies = Company::whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->count();
        $monthlyGrowth = $lastMonthCompanies > 0
            ? round((($companiesThisMonth - $lastMonthCompanies) / $lastMonthCompanies) * 100, 1)
            : ($companiesThisMonth > 0 ? 100 : 0);

        $activeEngagement = Company::has('feedbackRequests')->count();
        $engagementRate = $totalCompanies > 0 ? round(($activeEngagement / $totalCompanies) * 100, 1) : 0;

        // --- Répartition par secteur ---
        $sectorDistribution = Company::select('sector', DB::raw('count(*) as count'))
            ->whereNotNull('sector')->where('sector', '!=', '')
            ->groupBy('sector')->orderBy('count', 'desc')->get();

        // --- Évolution sur 12 mois ---
        $monthlyEvolution = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyEvolution[] = [
                'month' => $date->locale('fr')->translatedFormat('M Y'),
                'count' => Company::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
            ];
        }

        // --- Top 5 entreprises ---
        $topCompanies = Company::with(['subscription.plan'])
            ->withCount(['feedbackRequests', 'customers'])
            ->orderBy('feedback_requests_count', 'desc')
            ->take(5)->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'sector' => $c->sector,
                'customers' => $c->customers_count,
                'feedbacks' => $c->feedback_requests_count,
                'plan' => $c->subscription?->plan?->name ?? 'Aucun',
            ]);

        // --- Liste paginée avec filtres ---
        $companiesQuery = Company::with(['user', 'subscription.plan'])
            ->withCount(['customers', 'feedbackRequests']);

        // Recherche
        if ($search !== '') {
            $companiesQuery->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('sector', 'ILIKE', "%{$search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'ILIKE', "%{$search}%")->orWhere('email', 'ILIKE', "%{$search}%"));
            });
        }

        // Filtre par statut de subscription
        if ($statusFilter === 'active') {
            $companiesQuery->whereHas('subscription', fn($q) => $q->whereIn('status', $activeLikeStatuses));
        } elseif ($statusFilter === 'trial') {
            $companiesQuery->whereHas('subscription', fn($q) => $q->where('status', 'trialing'));
        } elseif ($statusFilter === 'inactive') {
            $companiesQuery->where(function ($q) use ($activeLikeStatuses) {
                $q->whereDoesntHave('subscription')
                  ->orWhereHas('subscription', fn($sq) => $sq->whereNotIn('status', $activeLikeStatuses));
            });
        }

        // Filtre par plan
        if ($planFilter !== 'all') {
            $companiesQuery->whereHas('subscription', fn($q) => $q->whereHas('plan', fn($pq) => $pq->where('slug', $planFilter)));
        }

        // Filtre par secteur
        if ($sectorFilter !== 'all') {
            $companiesQuery->where('sector', $sectorFilter);
        }

        // Tri
        match ($sort) {
            'oldest' => $companiesQuery->orderBy('created_at', 'asc'),
            'name' => $companiesQuery->orderBy('name', 'asc'),
            'most_active' => $companiesQuery->orderBy('feedback_requests_count', 'desc'),
            'most_customers' => $companiesQuery->orderBy('customers_count', 'desc'),
            default => $companiesQuery->orderBy('created_at', 'desc'),
        };

        $companies = $companiesQuery->paginate(20)->withQueryString()->through(function ($company) use ($activeLikeStatuses) {
            $sub = $company->subscription;
            $plan = $sub?->plan;
            return [
                'id' => $company->id,
                'name' => $company->name,
                'sector' => $company->sector,
                'logo_url' => $company->logo_url,
                'user_name' => $company->user->name ?? 'N/A',
                'user_email' => $company->user->email ?? 'N/A',
                'customers_count' => $company->customers_count,
                'feedback_requests_count' => $company->feedback_requests_count,
                'subscription_status' => $sub?->status ?? 'none',
                'plan_name' => $plan?->name ?? 'Aucun',
                'plan_slug' => $plan?->slug ?? 'none',
                'is_active' => $sub && in_array($sub->status, $activeLikeStatuses, true),
                'is_trial' => $sub?->status === 'trialing',
                'trial_ends_at' => $sub?->trial_ends_at?->format('d/m/Y'),
                'created_at' => $company->created_at->format('d/m/Y'),
                'created_at_raw' => $company->created_at->toISOString(),
            ];
        });

        // Options de filtres
        $availableSectors = Company::select('sector')
            ->whereNotNull('sector')->where('sector', '!=', '')
            ->distinct()->orderBy('sector')->pluck('sector');

        $availablePlans = Plan::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Companies', [
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'plan' => $planFilter,
                'sector' => $sectorFilter,
                'sort' => $sort,
            ],
            'filterOptions' => [
                'sectors' => $availableSectors,
                'plans' => $availablePlans,
            ],
            'stats' => [
                'totalCompanies' => $totalCompanies,
                'activeCompanies' => $activeCompanies,
                'freeCompanies' => $freeCompanies,
                'paidCompanies' => $paidCompanies,
                'trialCompanies' => $trialCompanies,
                'companiesThisMonth' => $companiesThisMonth,
                'monthlyGrowth' => $monthlyGrowth,
                'engagementRate' => $engagementRate,
            ],
            'sectorDistribution' => $sectorDistribution,
            'monthlyEvolution' => $monthlyEvolution,
            'topCompanies' => $topCompanies,
            'companies' => $companies,
        ]);
    }

    public function users(Request $request)
    {
        $filters = $request->validate([
            'search'   => ['nullable', 'string', 'max:120'],
            'verified' => ['nullable', 'string', 'max:20'],
            'twofa'    => ['nullable', 'string', 'max:20'],
            'provider' => ['nullable', 'string', 'max:40'],
            'company'  => ['nullable', 'string', 'max:20'],
            'sort'     => ['nullable', 'string', 'max:40'],
        ]);

        $search        = trim((string) ($filters['search'] ?? ''));
        $verifiedFilter = (string) ($filters['verified'] ?? 'all');
        $twofaFilter   = (string) ($filters['twofa'] ?? 'all');
        $providerFilter = (string) ($filters['provider'] ?? 'all');
        $companyFilter = (string) ($filters['company'] ?? 'all');
        $sort          = (string) ($filters['sort'] ?? 'newest');

        $adminEmails = array_map('strtolower', \App\Helpers\AdminHelper::ADMIN_EMAILS);
        $activeLikeStatuses = ['active', 'trialing', 'past_due'];

        // ── Stats globales ──
        $totalUsers       = User::count();
        $verifiedUsers    = User::whereNotNull('email_verified_at')->count();
        $unverifiedUsers  = $totalUsers - $verifiedUsers;
        $twoFaUsers       = User::whereNotNull('two_factor_confirmed_at')->count();
        $oauthUsers       = User::whereNotNull('provider')->count();
        $withCompany      = User::has('company')->count();
        $usersThisMonth   = User::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $lastMonthUsers   = User::whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->count();
        $monthlyGrowth    = $lastMonthUsers > 0
            ? round((($usersThisMonth - $lastMonthUsers) / $lastMonthUsers) * 100, 1)
            : ($usersThisMonth > 0 ? 100 : 0);

        // ── Évolution 12 mois ──
        $monthlyEvolution = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyEvolution[] = [
                'month' => $date->locale('fr')->translatedFormat('M Y'),
                'count' => User::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
            ];
        }

        // ── Providers breakdown ──
        $providerBreakdown = User::selectRaw("COALESCE(provider, 'email') as prov, count(*) as count")
            ->groupBy('prov')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['provider' => $r->prov, 'count' => (int) $r->count]);

        // ── Query paginée ──
        $usersQuery = User::with(['company.subscription.plan'])
            ->withCount(['companies as extra_companies_count']);

        // Recherche
        if ($search !== '') {
            $usersQuery->where(fn($q) =>
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhereHas('company', fn($cq) => $cq->where('name', 'ILIKE', "%{$search}%"))
            );
        }

        // Filtre vérification
        if ($verifiedFilter === 'yes') {
            $usersQuery->whereNotNull('email_verified_at');
        } elseif ($verifiedFilter === 'no') {
            $usersQuery->whereNull('email_verified_at');
        }

        // Filtre 2FA
        if ($twofaFilter === 'yes') {
            $usersQuery->whereNotNull('two_factor_confirmed_at');
        } elseif ($twofaFilter === 'no') {
            $usersQuery->whereNull('two_factor_confirmed_at');
        }

        // Filtre provider
        if ($providerFilter !== 'all') {
            if ($providerFilter === 'email') {
                $usersQuery->whereNull('provider');
            } else {
                $usersQuery->where('provider', $providerFilter);
            }
        }

        // Filtre company
        if ($companyFilter === 'yes') {
            $usersQuery->has('company');
        } elseif ($companyFilter === 'no') {
            $usersQuery->doesntHave('company');
        }

        // Tri
        match ($sort) {
            'oldest'    => $usersQuery->orderBy('created_at', 'asc'),
            'name'      => $usersQuery->orderBy('name', 'asc'),
            'email'     => $usersQuery->orderBy('email', 'asc'),
            default     => $usersQuery->orderBy('created_at', 'desc'),
        };

        $users = $usersQuery->paginate(20)->withQueryString()->through(function ($user) use ($adminEmails, $activeLikeStatuses) {
            $company = $user->company;
            $sub     = $company?->subscription;
            $plan    = $sub?->plan;
            return [
                'id'                  => $user->id,
                'name'                => $user->name,
                'email'               => $user->email,
                'avatar'              => $user->avatar,
                'email_verified'      => !is_null($user->email_verified_at),
                'email_verified_at'   => $user->email_verified_at?->format('d/m/Y'),
                'two_factor_enabled'  => !is_null($user->two_factor_confirmed_at),
                'provider'            => $user->provider ?? 'email',
                'is_admin'            => in_array(strtolower($user->email), $adminEmails, true),
                'company_id'          => $company?->id,
                'company_name'        => $company?->name,
                'company_sector'      => $company?->sector,
                'plan_name'           => $plan?->name ?? ($company ? 'Aucun' : null),
                'plan_slug'           => $plan?->slug ?? 'none',
                'subscription_status' => $sub?->status ?? ($company ? 'none' : null),
                'is_active'           => $sub && in_array($sub->status, $activeLikeStatuses, true),
                'created_at'          => $user->created_at->format('d/m/Y'),
                'created_at_raw'      => $user->created_at->toISOString(),
            ];
        });

        // Options providers disponibles
        $availableProviders = User::whereNotNull('provider')
            ->distinct()->pluck('provider')->filter()->values();

        return Inertia::render('Admin/Users', [
            'filters' => [
                'search'   => $search,
                'verified' => $verifiedFilter,
                'twofa'    => $twofaFilter,
                'provider' => $providerFilter,
                'company'  => $companyFilter,
                'sort'     => $sort,
            ],
            'filterOptions' => [
                'providers' => $availableProviders,
            ],
            'stats' => [
                'totalUsers'      => $totalUsers,
                'verifiedUsers'   => $verifiedUsers,
                'unverifiedUsers' => $unverifiedUsers,
                'twoFaUsers'      => $twoFaUsers,
                'oauthUsers'      => $oauthUsers,
                'withCompany'     => $withCompany,
                'usersThisMonth'  => $usersThisMonth,
                'monthlyGrowth'   => $monthlyGrowth,
                'verifiedRate'    => $totalUsers > 0 ? round(($verifiedUsers / $totalUsers) * 100, 1) : 0,
                'twoFaRate'       => $totalUsers > 0 ? round(($twoFaUsers / $totalUsers) * 100, 1) : 0,
                'companyRate'     => $totalUsers > 0 ? round(($withCompany / $totalUsers) * 100, 1) : 0,
            ],
            'monthlyEvolution' => $monthlyEvolution,
            'providerBreakdown' => $providerBreakdown,
            'users' => $users,
        ]);
    }

    public function feedbacks()
    {
        return Inertia::render('Admin/Feedbacks');
    }

    public function requests()
    {
        return Inertia::render('Admin/Requests');
    }

    public function replies()
    {
        return Inertia::render('Admin/Replies');
    }

    public function analytics(Request $request)
    {
        $validated = $request->validate([
            'days' => ['nullable', 'integer', 'in:7,30,90,365'],
        ]);

        $days = (int) ($validated['days'] ?? 30);
        $now = now();
        $from = $now->copy()->subDays($days - 1)->startOfDay();
        $prevFrom = $from->copy()->subDays($days);
        $prevTo = $from->copy()->subSecond();
        $completedStatuses = ['completed', 'responded'];
        $feedbackTable = (new Feedback())->getTable();

        $requestsQuery = FeedbackRequest::query();
        $feedbacksQuery = Feedback::query();
        $repliesQuery = FeedbackReply::query();

        $totalCompanies = Company::count();

        $requestsTotal = (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->count();
        $requestsPrev = (clone $requestsQuery)->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $completedTotal = (clone $requestsQuery)->whereIn('status', $completedStatuses)->whereBetween('created_at', [$from, $now])->count();
        $completedPrev = (clone $requestsQuery)->whereIn('status', $completedStatuses)->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $failedTotal = (clone $requestsQuery)->where('status', 'failed')->whereBetween('created_at', [$from, $now])->count();
        $pendingTotal = (clone $requestsQuery)->whereIn('status', ['pending', 'sent'])->whereBetween('created_at', [$from, $now])->count();

        $feedbacksTotal = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->count();
        $feedbacksPrev = (clone $feedbacksQuery)->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $avgRating = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->avg('rating');
        $avgRating = $avgRating ? round((float) $avgRating, 2) : null;

        $positiveCount = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->whereIn('rating', [4, 5])->count();
        $neutralCount = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->where('rating', 3)->count();
        $negativeCount = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->whereIn('rating', [1, 2])->count();
        $promoters = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->where('rating', 5)->count();
        $detractors = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->whereIn('rating', [1, 2])->count();

        $responseRate = $requestsTotal > 0 ? round(($completedTotal / $requestsTotal) * 100, 1) : 0;
        $responseRatePrev = $requestsPrev > 0 ? round(($completedPrev / $requestsPrev) * 100, 1) : 0;
        $positiveRate = $feedbacksTotal > 0 ? round(($positiveCount / $feedbacksTotal) * 100, 1) : 0;
        $nps = $feedbacksTotal > 0 ? round((($promoters - $detractors) / $feedbacksTotal) * 100, 1) : 0;

        $ratingDistribution = collect([1, 2, 3, 4, 5])->mapWithKeys(function ($star) use ($feedbacksQuery, $from, $now) {
            return [$star => (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->where('rating', $star)->count()];
        });

        $responseTimes = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->whereNotNull('sent_at')
            ->whereNotNull('responded_at')
            ->get(['channel', 'sent_at', 'responded_at']);

        $avgResponseHours = $responseTimes->count() > 0
            ? round($responseTimes->avg(fn ($r) => $r->sent_at->diffInMinutes($r->responded_at)) / 60, 2)
            : null;

        $responseTimeByChannel = $responseTimes
            ->groupBy('channel')
            ->map(function ($rows) {
                $avgMinutes = $rows->avg(fn ($r) => $r->sent_at->diffInMinutes($r->responded_at));
                return $avgMinutes ? round($avgMinutes / 60, 2) : null;
            });

        $responseBuckets = [
            '0-2h' => 0,
            '2-6h' => 0,
            '6-24h' => 0,
            '24h+' => 0,
        ];

        foreach ($responseTimes as $row) {
            $hours = $row->sent_at->diffInHours($row->responded_at);
            if ($hours <= 2) {
                $responseBuckets['0-2h']++;
            } elseif ($hours <= 6) {
                $responseBuckets['2-6h']++;
            } elseif ($hours <= 24) {
                $responseBuckets['6-24h']++;
            } else {
                $responseBuckets['24h+']++;
            }
        }

        $channels = [
            'email' => (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->where('channel', 'email')->count(),
            'sms' => (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->where('channel', 'sms')->count(),
            'qr' => (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->where('channel', 'qr')->count(),
        ];

        $channelPerformance = collect(['email', 'sms', 'qr'])->mapWithKeys(function ($channel) use ($requestsQuery, $from, $now, $completedStatuses) {
            $total = (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->where('channel', $channel)->count();
            $completed = (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->where('channel', $channel)->whereIn('status', $completedStatuses)->count();

            return [$channel => [
                'total' => $total,
                'completed' => $completed,
                'rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            ]];
        });

        $activeCompanies = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->distinct('company_id')
            ->count('company_id');

        $feedbackCompanies = (clone $feedbacksQuery)
            ->join('feedback_requests', 'feedback_requests.id', '=', $feedbackTable . '.feedback_request_id')
            ->whereBetween($feedbackTable . '.created_at', [$from, $now])
            ->distinct('feedback_requests.company_id')
            ->count('feedback_requests.company_id');

        $companyPenetrationRate = $totalCompanies > 0 ? round(($activeCompanies / $totalCompanies) * 100, 1) : 0;
        $companyFeedbackCoverageRate = $totalCompanies > 0 ? round(($feedbackCompanies / $totalCompanies) * 100, 1) : 0;

        $repliesTotal = (clone $repliesQuery)->whereBetween('created_at', [$from, $now])->count();
        $aiReplies = (clone $repliesQuery)->whereBetween('created_at', [$from, $now])->where('responder_type', 'ai')->count();
        $adminReplies = (clone $repliesQuery)->whereBetween('created_at', [$from, $now])->where('responder_type', 'admin')->count();
        $aiReplyRate = $repliesTotal > 0 ? round(($aiReplies / $repliesTotal) * 100, 1) : 0;

        $resolvedFeedbacks = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->whereNotNull('resolved_at')->count();
        $resolutionRate = $feedbacksTotal > 0 ? round(($resolvedFeedbacks / $feedbacksTotal) * 100, 1) : 0;
        $publicFeedbacks = (clone $feedbacksQuery)->whereBetween('created_at', [$from, $now])->where('is_public', true)->count();
        $publicShareRate = $feedbacksTotal > 0 ? round(($publicFeedbacks / $feedbacksTotal) * 100, 1) : 0;
        $remindersSent = (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->sum('reminder_count');

        $requestsByDayRaw = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => (int) $row->count]);

        $completedByDayRaw = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->whereIn('status', $completedStatuses)
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => (int) $row->count]);

        $feedbackByDayRaw = (clone $feedbacksQuery)
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('DATE(created_at) as date, count(*) as count, avg(rating) as avg_rating')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $trend = collect();
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $feedbackDay = $feedbackByDayRaw->get($date);
            $trend->push([
                'date' => $date,
                'requests' => $requestsByDayRaw->get($date, 0),
                'completed' => $completedByDayRaw->get($date, 0),
                'feedbacks' => $feedbackDay?->count ? (int) $feedbackDay->count : 0,
                'avg_rating' => $feedbackDay?->avg_rating ? round((float) $feedbackDay->avg_rating, 2) : null,
            ]);
        }

        $weekdayRaw = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('EXTRACT(DOW FROM created_at) as dow, count(*) as count')
            ->groupBy('dow')
            ->get()
            ->mapWithKeys(fn ($row) => [(int) $row->dow => (int) $row->count]);

        $hourRaw = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('EXTRACT(HOUR FROM created_at) as hour, count(*) as count')
            ->groupBy('hour')
            ->get()
            ->mapWithKeys(fn ($row) => [(int) $row->hour => (int) $row->count]);

        $sectorPerformance = DB::table('companies')
            ->leftJoin('feedback_requests', function ($join) use ($from, $now) {
                $join->on('feedback_requests.company_id', '=', 'companies.id')
                    ->whereBetween('feedback_requests.created_at', [$from, $now]);
            })
            ->leftJoin($feedbackTable, $feedbackTable . '.feedback_request_id', '=', 'feedback_requests.id')
            ->selectRaw("COALESCE(companies.sector, 'Non spécifié') as sector")
            ->selectRaw('COUNT(DISTINCT companies.id) as companies_count')
            ->selectRaw('COUNT(DISTINCT feedback_requests.id) as requests_count')
            ->selectRaw('COUNT(DISTINCT ' . $feedbackTable . '.id) as feedbacks_count')
            ->selectRaw('AVG(' . $feedbackTable . '.rating) as avg_rating')
            ->groupBy('sector')
            ->orderByDesc('feedbacks_count')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                $requests = (int) $row->requests_count;
                $feedbacks = (int) $row->feedbacks_count;
                return [
                    'sector' => $row->sector,
                    'companies_count' => (int) $row->companies_count,
                    'requests_count' => $requests,
                    'feedbacks_count' => $feedbacks,
                    'response_rate' => $requests > 0 ? round(($feedbacks / $requests) * 100, 1) : 0,
                    'avg_rating' => $row->avg_rating ? round((float) $row->avg_rating, 2) : null,
                ];
            });

        $topCompanies = DB::table('companies')
            ->leftJoin('feedback_requests', function ($join) use ($from, $now) {
                $join->on('feedback_requests.company_id', '=', 'companies.id')
                    ->whereBetween('feedback_requests.created_at', [$from, $now]);
            })
            ->leftJoin($feedbackTable, $feedbackTable . '.feedback_request_id', '=', 'feedback_requests.id')
            ->select('companies.id', 'companies.name', 'companies.sector')
            ->selectRaw('COUNT(DISTINCT feedback_requests.id) as requests_count')
            ->selectRaw('COUNT(DISTINCT ' . $feedbackTable . '.id) as feedbacks_count')
            ->selectRaw('AVG(' . $feedbackTable . '.rating) as avg_rating')
            ->groupBy('companies.id', 'companies.name', 'companies.sector')
            ->havingRaw('COUNT(DISTINCT feedback_requests.id) > 0')
            ->orderByDesc('feedbacks_count')
            ->orderByDesc('avg_rating')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                $requests = (int) $row->requests_count;
                $feedbacks = (int) $row->feedbacks_count;
                return [
                    'id' => $row->id,
                    'name' => $row->name,
                    'sector' => $row->sector,
                    'requests_count' => $requests,
                    'feedbacks_count' => $feedbacks,
                    'response_rate' => $requests > 0 ? round(($feedbacks / $requests) * 100, 1) : 0,
                    'avg_rating' => $row->avg_rating ? round((float) $row->avg_rating, 2) : null,
                ];
            });

        $riskCompanies = DB::table('companies')
            ->leftJoin('feedback_requests', function ($join) use ($from, $now) {
                $join->on('feedback_requests.company_id', '=', 'companies.id')
                    ->whereBetween('feedback_requests.created_at', [$from, $now]);
            })
            ->leftJoin($feedbackTable, $feedbackTable . '.feedback_request_id', '=', 'feedback_requests.id')
            ->select('companies.id', 'companies.name', 'companies.sector')
            ->selectRaw('COUNT(DISTINCT feedback_requests.id) as requests_count')
            ->selectRaw('COUNT(DISTINCT ' . $feedbackTable . '.id) as feedbacks_count')
            ->selectRaw('AVG(' . $feedbackTable . '.rating) as avg_rating')
            ->groupBy('companies.id', 'companies.name', 'companies.sector')
            ->havingRaw('COUNT(DISTINCT feedback_requests.id) >= 3')
            ->orderByRaw('AVG(' . $feedbackTable . '.rating) ASC NULLS LAST')
            ->orderByRaw('(COUNT(DISTINCT ' . $feedbackTable . '.id)::float / NULLIF(COUNT(DISTINCT feedback_requests.id),0)) ASC')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                $requests = (int) $row->requests_count;
                $feedbacks = (int) $row->feedbacks_count;
                $responseRateRow = $requests > 0 ? round(($feedbacks / $requests) * 100, 1) : 0;

                return [
                    'id' => $row->id,
                    'name' => $row->name,
                    'sector' => $row->sector,
                    'requests_count' => $requests,
                    'feedbacks_count' => $feedbacks,
                    'response_rate' => $responseRateRow,
                    'avg_rating' => $row->avg_rating ? round((float) $row->avg_rating, 2) : null,
                    'risk_score' => round(((100 - $responseRateRow) * 0.45) + ((5 - (float) ($row->avg_rating ?? 0)) * 11), 1),
                ];
            });

        $languageDistribution = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->whereNotNull('detected_language')
            ->select('detected_language', DB::raw('count(*) as count'))
            ->groupBy('detected_language')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'language' => $row->detected_language,
                'count' => (int) $row->count,
            ]);

        $stats = [
            'days' => $days,
            'requests_total' => $requestsTotal,
            'requests_prev' => $requestsPrev,
            'completed_total' => $completedTotal,
            'completed_prev' => $completedPrev,
            'failed_total' => $failedTotal,
            'pending_total' => $pendingTotal,
            'feedbacks_total' => $feedbacksTotal,
            'feedbacks_prev' => $feedbacksPrev,
            'response_rate' => $responseRate,
            'response_rate_prev' => $responseRatePrev,
            'avg_rating' => $avgRating,
            'nps' => $nps,
            'positive_rate' => $positiveRate,
            'avg_response_hours' => $avgResponseHours,
            'positive_count' => $positiveCount,
            'neutral_count' => $neutralCount,
            'negative_count' => $negativeCount,
            'active_companies' => $activeCompanies,
            'feedback_companies' => $feedbackCompanies,
            'company_penetration_rate' => $companyPenetrationRate,
            'company_feedback_coverage_rate' => $companyFeedbackCoverageRate,
            'replies_total' => $repliesTotal,
            'ai_replies' => $aiReplies,
            'admin_replies' => $adminReplies,
            'ai_reply_rate' => $aiReplyRate,
            'resolution_rate' => $resolutionRate,
            'public_share_rate' => $publicShareRate,
            'reminders_sent' => (int) $remindersSent,
            'at_risk_companies' => $riskCompanies->count(),
        ];

        return Inertia::render('Admin/Analytics', [
            'stats' => $stats,
            'trend' => $trend,
            'channels' => $channels,
            'channelPerformance' => $channelPerformance,
            'responseBuckets' => $responseBuckets,
            'ratingDistribution' => $ratingDistribution,
            'responseTimeByChannel' => $responseTimeByChannel,
            'weekdayDistribution' => collect(range(0, 6))->map(fn ($d) => $weekdayRaw->get($d, 0)),
            'hourDistribution' => collect(range(0, 23))->map(fn ($h) => $hourRaw->get($h, 0)),
            'sectorPerformance' => $sectorPerformance,
            'topCompanies' => $topCompanies,
            'riskCompanies' => $riskCompanies,
            'replyMix' => [
                'ai' => $aiReplies,
                'admin' => $adminReplies,
                'ai_rate' => $aiReplyRate,
            ],
            'languageDistribution' => $languageDistribution,
        ]);
    }

    public function subscriptions(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:40'],
            'plan' => ['nullable', 'string', 'max:40'],
            'sort' => ['nullable', 'string', 'max:40'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $statusFilter = (string) ($filters['status'] ?? 'all');
        $planFilter = (string) ($filters['plan'] ?? 'all');
        $sort = (string) ($filters['sort'] ?? 'newest');

        // Dernière subscription par entreprise (source de vérité pour l'état courant)
        $latestSubscriptionIds = Subscription::selectRaw('MAX(id) as id')
            ->groupBy('company_id');

        $allLatestSubscriptions = Subscription::query()
            ->whereIn('id', $latestSubscriptionIds)
            ->with(['plan', 'credits', 'company'])
            ->get();

        $latestSubscriptionsByCompany = $allLatestSubscriptions->keyBy('company_id');

        $allSubscriptionHistory = Subscription::query()
            ->with(['plan', 'company'])
            ->orderBy('company_id')
            ->orderBy('created_at')
            ->get()
            ->groupBy('company_id');

        $activeLikeStatuses = ['active', 'trialing', 'past_due'];

        $totalAccounts = $allLatestSubscriptions->count();
        $activeAccounts = $allLatestSubscriptions
            ->whereIn('status', $activeLikeStatuses)
            ->count();
        $paidAccounts = $allLatestSubscriptions
            ->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free')
            ->count();
        $paidActiveAccounts = $allLatestSubscriptions
            ->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free' && in_array($s->status, $activeLikeStatuses, true))
            ->count();

        $estimatedMrr = round($allLatestSubscriptions
            ->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free' && in_array($s->status, $activeLikeStatuses, true))
            ->sum(function ($subscription) {
                $price = (float) ($subscription->plan->price ?? 0);
                return $subscription->plan->billing_period === 'year' ? ($price / 12) : $price;
            }), 2);

        $estimatedArr = round($estimatedMrr * 12, 2);
        $arpa = $paidActiveAccounts > 0
            ? round($estimatedMrr / $paidActiveAccounts, 2)
            : 0;

        $pastDueAccounts = $allLatestSubscriptions->where('status', 'past_due')->count();
        $trialEndingSoon = $allLatestSubscriptions
            ->filter(fn ($s) => $s->status === 'trialing' && $s->trial_ends_at && $s->trial_ends_at->between(now(), now()->copy()->addDays(7)))
            ->count();
        $endingSoon = $allLatestSubscriptions
            ->filter(fn ($s) => $s->ends_at && $s->ends_at->between(now(), now()->copy()->addDays(7)))
            ->count();

        $creditsRows = $allLatestSubscriptions
            ->map(fn ($s) => $s->credits)
            ->filter();

        $creditsMonthlyTotal = round((float) $creditsRows->sum('credits_monthly'), 2);
        $creditsUsedMonthly = round((float) $creditsRows->sum('credits_used_monthly'), 2);
        $creditsAvailableMonthly = round((float) $creditsRows->sum('credits_available_monthly'), 2);
        $creditsAddonBalance = round((float) $creditsRows->sum('credits_addon_balance'), 2);
        $creditsUsageRate = $creditsMonthlyTotal > 0
            ? round(($creditsUsedMonthly / $creditsMonthlyTotal) * 100, 1)
            : 0;

        $newPaidAccounts30d = 0;
        $churnedAccounts30d = 0;
        $reactivatedAccounts30d = 0;
        $mrrAtRisk = 0;

        foreach ($allSubscriptionHistory as $companyId => $history) {
            $history = $history->values();
            $latest = $latestSubscriptionsByCompany->get($companyId);

            if (!$latest) {
                continue;
            }

            $paidHistory = $history->filter(fn ($sub) => $sub->plan && $sub->plan->slug !== 'free')->values();
            $firstPaid = $paidHistory->first();
            $hadPaidBefore = $paidHistory->isNotEmpty();
            $isCurrentPaidActive = $latest->plan && $latest->plan->slug !== 'free' && in_array($latest->status, $activeLikeStatuses, true);

            if ($firstPaid && $firstPaid->created_at && $firstPaid->created_at->gte(now()->copy()->subDays(30)) && $isCurrentPaidActive) {
                $newPaidAccounts30d++;
            }

            $hadPriorNonPaidState = $history
                ->slice(0, -1)
                ->contains(function ($sub) {
                    return !$sub->plan || $sub->plan->slug === 'free' || in_array($sub->status, ['canceled', 'unpaid'], true);
                });

            if ($isCurrentPaidActive && $hadPriorNonPaidState && $latest->updated_at && $latest->updated_at->gte(now()->copy()->subDays(30))) {
                $reactivatedAccounts30d++;
            }

            $recentChurn = $latest->updated_at
                && $latest->updated_at->gte(now()->copy()->subDays(30))
                && $hadPaidBefore
                && (
                    !$latest->plan
                    || $latest->plan->slug === 'free'
                    || in_array($latest->status, ['canceled', 'unpaid'], true)
                );

            if ($recentChurn) {
                $churnedAccounts30d++;
            }

            if ($latest->plan && $latest->plan->slug !== 'free' && ($latest->status === 'past_due' || ($latest->ends_at && $latest->ends_at->between(now(), now()->copy()->addDays(7))))) {
                $price = (float) ($latest->plan->price ?? 0);
                $mrrAtRisk += $latest->plan->billing_period === 'year' ? ($price / 12) : $price;
            }
        }

        $paidBaseForChurn = max(1, $paidActiveAccounts + $churnedAccounts30d);
        $churnRate30d = round(($churnedAccounts30d / $paidBaseForChurn) * 100, 2);
        $expansionRate30d = $paidBaseForChurn > 0
            ? round(($reactivatedAccounts30d / $paidBaseForChurn) * 100, 2)
            : 0;
        $ltvProxy = $churnRate30d > 0
            ? round($arpa / ($churnRate30d / 100), 2)
            : null;

        $newCompanies30d = Company::where('created_at', '>=', now()->copy()->subDays(30))->count();
        $signupToPaidConversion30d = $newCompanies30d > 0
            ? round(($newPaidAccounts30d / $newCompanies30d) * 100, 2)
            : 0;

        $statusDistribution = $allLatestSubscriptions
            ->groupBy(fn ($s) => $s->status ?: 'unknown')
            ->map(fn ($items, $status) => [
                'status' => $status,
                'count' => $items->count(),
                'percentage' => $totalAccounts > 0 ? round(($items->count() / $totalAccounts) * 100, 1) : 0,
            ])
            ->values()
            ->sortByDesc('count')
            ->values();

        $planDistribution = $allLatestSubscriptions
            ->groupBy(fn ($s) => $s->plan?->slug ?? 'unknown')
            ->map(function ($items, $slug) use ($totalAccounts, $activeLikeStatuses) {
                $plan = $items->first()?->plan;
                $activeCount = $items->filter(fn ($s) => in_array($s->status, $activeLikeStatuses, true))->count();
                $mrr = round($items
                    ->filter(fn ($s) => $s->plan && $s->plan->slug !== 'free' && in_array($s->status, $activeLikeStatuses, true))
                    ->sum(function ($subscription) {
                        $price = (float) ($subscription->plan->price ?? 0);
                        return $subscription->plan->billing_period === 'year' ? ($price / 12) : $price;
                    }), 2);

                return [
                    'slug' => $slug,
                    'name' => $plan?->name ?? strtoupper($slug),
                    'count' => $items->count(),
                    'active_count' => $activeCount,
                    'percentage' => $totalAccounts > 0 ? round(($items->count() / $totalAccounts) * 100, 1) : 0,
                    'mrr' => $mrr,
                ];
            })
            ->values()
            ->sortByDesc('count')
            ->values();

        $planPerformance = Plan::query()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($plan) use ($allLatestSubscriptions, $totalAccounts, $activeLikeStatuses) {
                $subs = $allLatestSubscriptions->where('plan_id', $plan->id);
                $activeSubs = $subs->filter(fn ($s) => in_array($s->status, $activeLikeStatuses, true))->count();
                $mrr = round($subs
                    ->filter(fn ($s) => $plan->slug !== 'free' && in_array($s->status, $activeLikeStatuses, true))
                    ->sum(function ($subscription) {
                        $price = (float) ($subscription->plan->price ?? 0);
                        return $subscription->plan->billing_period === 'year' ? ($price / 12) : $price;
                    }), 2);

                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => (float) $plan->price,
                    'billing_period' => $plan->billing_period,
                    'count' => $subs->count(),
                    'active_count' => $activeSubs,
                    'adoption_rate' => $totalAccounts > 0 ? round(($subs->count() / $totalAccounts) * 100, 1) : 0,
                    'estimated_mrr' => $mrr,
                ];
            })
            ->values();

        $cohorts = Company::query()
            ->with(['subscription.plan'])
            ->where('created_at', '>=', now()->copy()->subMonths(11)->startOfMonth())
            ->orderBy('created_at')
            ->get()
            ->groupBy(fn ($company) => $company->created_at->format('Y-m'))
            ->map(function ($companies, $cohortKey) use ($latestSubscriptionsByCompany, $activeLikeStatuses, $allSubscriptionHistory) {
                $companiesCount = $companies->count();
                $currentPaid = 0;
                $everPaid = 0;
                $mrr = 0;

                foreach ($companies as $company) {
                    $latest = $latestSubscriptionsByCompany->get($company->id);
                    $history = $allSubscriptionHistory->get($company->id, collect());
                    $hasPaidHistory = $history->contains(fn ($sub) => $sub->plan && $sub->plan->slug !== 'free');

                    if ($hasPaidHistory) {
                        $everPaid++;
                    }

                    if ($latest && $latest->plan && $latest->plan->slug !== 'free' && in_array($latest->status, $activeLikeStatuses, true)) {
                        $currentPaid++;
                        $price = (float) ($latest->plan->price ?? 0);
                        $mrr += $latest->plan->billing_period === 'year' ? ($price / 12) : $price;
                    }
                }

                return [
                    'cohort' => $cohortKey,
                    'label' => now()->createFromFormat('Y-m', $cohortKey)->locale('fr')->translatedFormat('M Y'),
                    'companies' => $companiesCount,
                    'ever_paid' => $everPaid,
                    'current_paid' => $currentPaid,
                    'conversion_rate' => $companiesCount > 0 ? round(($everPaid / $companiesCount) * 100, 1) : 0,
                    'retained_paid_rate' => $companiesCount > 0 ? round(($currentPaid / $companiesCount) * 100, 1) : 0,
                    'estimated_mrr' => round($mrr, 2),
                ];
            })
            ->values()
            ->sortByDesc('cohort')
            ->values();

        $subscriptionsQuery = Subscription::query()
            ->whereIn('id', $latestSubscriptionIds)
            ->with(['plan', 'credits', 'company.user'])
            ->when($statusFilter !== 'all', fn ($q) => $q->where('status', $statusFilter))
            ->when($planFilter !== 'all', fn ($q) => $q->whereHas('plan', fn ($pq) => $pq->where('slug', $planFilter)))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('stripe_subscription_id', 'ILIKE', "%{$search}%")
                        ->orWhereHas('company', function ($companyQuery) use ($search) {
                            $companyQuery->where('name', 'ILIKE', "%{$search}%")
                                ->orWhereHas('user', fn ($userQuery) => $userQuery->where('email', 'ILIKE', "%{$search}%"));
                        });
                });
            });

        match ($sort) {
            'oldest' => $subscriptionsQuery->orderBy('created_at', 'asc'),
            'ends_soon' => $subscriptionsQuery->orderByRaw('CASE WHEN ends_at IS NULL THEN 1 ELSE 0 END, ends_at ASC'),
            'plan_asc' => $subscriptionsQuery->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
                ->orderBy('plans.sort_order')
                ->select('subscriptions.*'),
            default => $subscriptionsQuery->orderByDesc('created_at'),
        };

        $subscriptions = $subscriptionsQuery
            ->paginate(15)
            ->withQueryString()
            ->through(function ($subscription) {
                $credits = $subscription->credits;
                $monthly = (float) ($credits->credits_monthly ?? 0);
                $used = (float) ($credits->credits_used_monthly ?? 0);
                $usagePercent = $monthly > 0 ? round(($used / $monthly) * 100, 1) : 0;

                return [
                    'id' => $subscription->id,
                    'status' => $subscription->status,
                    'stripe_subscription_id' => $subscription->stripe_subscription_id,
                    'trial_ends_at' => $subscription->trial_ends_at?->format('Y-m-d H:i:s'),
                    'ends_at' => $subscription->ends_at?->format('Y-m-d H:i:s'),
                    'created_at' => $subscription->created_at?->format('Y-m-d H:i:s'),
                    'updated_at' => $subscription->updated_at?->format('Y-m-d H:i:s'),
                    'company' => [
                        'id' => $subscription->company?->id,
                        'name' => $subscription->company?->name,
                        'user_email' => $subscription->company?->user?->email,
                    ],
                    'plan' => [
                        'id' => $subscription->plan?->id,
                        'name' => $subscription->plan?->name,
                        'slug' => $subscription->plan?->slug,
                        'price' => (float) ($subscription->plan?->price ?? 0),
                        'currency' => $subscription->plan?->currency,
                        'billing_period' => $subscription->plan?->billing_period,
                    ],
                    'credits' => $credits ? [
                        'credits_monthly' => (float) $credits->credits_monthly,
                        'credits_used_monthly' => (float) $credits->credits_used_monthly,
                        'credits_available_monthly' => (float) $credits->credits_available_monthly,
                        'credits_addon_balance' => (float) $credits->credits_addon_balance,
                        'credits_total_available' => (float) $credits->credits_total_available,
                        'usage_percent' => $usagePercent,
                    ] : null,
                ];
            });

        $availableStatuses = $allLatestSubscriptions
            ->pluck('status')
            ->filter()
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Admin/Subscriptions', [
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'plan' => $planFilter,
                'sort' => $sort,
            ],
            'filterOptions' => [
                'statuses' => $availableStatuses,
                'plans' => Plan::orderBy('sort_order')->get(['id', 'name', 'slug']),
            ],
            'stats' => [
                'total_accounts' => $totalAccounts,
                'active_accounts' => $activeAccounts,
                'paid_accounts' => $paidAccounts,
                'paid_active_accounts' => $paidActiveAccounts,
                'past_due_accounts' => $pastDueAccounts,
                'trial_ending_soon' => $trialEndingSoon,
                'ending_soon' => $endingSoon,
                'estimated_mrr' => $estimatedMrr,
                'estimated_arr' => $estimatedArr,
                'arpa' => $arpa,
                'credits_monthly_total' => $creditsMonthlyTotal,
                'credits_used_monthly' => $creditsUsedMonthly,
                'credits_available_monthly' => $creditsAvailableMonthly,
                'credits_addon_balance' => $creditsAddonBalance,
                'credits_usage_rate' => $creditsUsageRate,
            ],
            'financeMetrics' => [
                'new_paid_accounts_30d' => $newPaidAccounts30d,
                'churned_accounts_30d' => $churnedAccounts30d,
                'reactivated_accounts_30d' => $reactivatedAccounts30d,
                'churn_rate_30d' => $churnRate30d,
                'expansion_rate_30d' => $expansionRate30d,
                'signup_to_paid_conversion_30d' => $signupToPaidConversion30d,
                'mrr_at_risk' => round($mrrAtRisk, 2),
                'ltv_proxy' => $ltvProxy,
            ],
            'statusDistribution' => $statusDistribution,
            'planDistribution' => $planDistribution,
            'planPerformance' => $planPerformance,
            'cohorts' => $cohorts,
            'subscriptions' => $subscriptions,
        ]);
    }

    public function channels()
    {
        return Inertia::render('Admin/Channels');
    }

    public function settings()
    {
        $activeLikeStatuses = ['active', 'trialing', 'past_due'];

        // Infos plateforme
        $platformInfo = [
            'app_name' => config('app.name', 'Feedora'),
            'app_env' => config('app.env', 'production'),
            'app_url' => config('app.url'),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'timezone' => config('app.timezone', 'UTC'),
        ];

        // Configuration Email
        $emailConfig = [
            'driver' => config('mail.default', 'smtp'),
            'from_name' => config('mail.from.name'),
            'from_address' => config('mail.from.address'),
            'brevo_configured' => !empty(config('services.brevo.key')),
        ];

        // Configuration SMS
        $smsConfig = [
            'brevo_sms_configured' => !empty(config('services.brevo.key')),
            'sms_sender' => config('services.brevo.sms_sender', 'Feedora'),
        ];

        // Configuration Stripe
        $stripeConfig = [
            'configured' => !empty(config('services.stripe.secret')),
            'webhook_configured' => !empty(config('services.stripe.webhook_secret')),
            'mode' => str_contains(config('services.stripe.key', ''), 'live') ? 'live' : 'test',
        ];

        // Configuration Gemini / IA
        $aiConfig = [
            'provider' => 'Gemini',
            'configured' => !empty(config('services.gemini.api_key', config('services.google.gemini_key'))),
        ];

        // Plans actifs
        $plans = Plan::where('is_active', true)->orderBy('sort_order')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price' => (float) $p->price,
            'currency' => $p->currency,
            'billing_period' => $p->billing_period,
            'credits_monthly' => (float) $p->credits_monthly,
            'sms_quota_monthly' => $p->sms_quota_monthly,
            'max_feedbacks' => $p->max_feedbacks,
            'features' => $p->features ?? [],
            'subscribers_count' => Subscription::where('plan_id', $p->id)->whereIn('status', $activeLikeStatuses)->count(),
        ]);

        // Stats générales
        $stats = [
            'total_users' => User::count(),
            'total_companies' => Company::count(),
            'total_feedbacks' => Feedback::count(),
            'total_subscriptions' => Subscription::whereIn('status', $activeLikeStatuses)->count(),
            'admin_emails' => \App\Helpers\AdminHelper::ADMIN_EMAILS,
        ];

        // Google OAuth
        $googleConfig = [
            'configured' => !empty(config('services.google.client_id')),
        ];

        return Inertia::render('Admin/Settings', [
            'platformInfo' => $platformInfo,
            'emailConfig' => $emailConfig,
            'smsConfig' => $smsConfig,
            'stripeConfig' => $stripeConfig,
            'aiConfig' => $aiConfig,
            'googleConfig' => $googleConfig,
            'plans' => $plans,
            'stats' => $stats,
        ]);
    }
}
