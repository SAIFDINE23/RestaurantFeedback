<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Feedback;
use App\Models\FeedbackRequest;
use App\Services\RadarAnalysisService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company;
        $customers = Customer::where('company_id', $company->id)
        ->withCount([
        'feedbackRequests as total_feedbacks',
        'feedbackRequests as completed_feedbacks' => function ($q) {
            $q->where('status', 'completed');
        }
    ])
    ->latest()
    ->get()
    ->map(fn($c) => [
        'id' => $c->id,
        'name' => $c->name,
        'email' => $c->email,
        'phone' => $c->phone,
        'total_feedbacks' => $c->total_feedbacks,
        'completed_feedbacks' => $c->completed_feedbacks,
    ]);

        $feedbacks = FeedbackRequest::where('company_id', $company->id)
        ->whereHas('customer')
        ->with(['customer', 'feedback'])
        ->latest()
        ->get()
        ->map(fn ($f) => [
        'id' => $f->id,
        'feedback_id' => $f->feedback?->id,
        'token' => $f->token,
        'customer' => [
            'id' => $f->customer->id,
            'name' => $f->customer->name,
        ],
        'status' => $f->status,
        'rating' => $f->feedback?->rating,
        'created_at' => $f->created_at->format('Y-m-d H:i'),
    ]);

        $now = now();
        $last7 = now()->subDays(7);

        $requestsTotal = FeedbackRequest::where('company_id', $company->id)->count();
        $requestsLast7 = FeedbackRequest::where('company_id', $company->id)
            ->whereBetween('created_at', [$last7, $now])
            ->count();
        $completedTotal = FeedbackRequest::where('company_id', $company->id)
            ->where('status', 'completed')
            ->count();
        $completedLast7 = FeedbackRequest::where('company_id', $company->id)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$last7, $now])
            ->count();
        $failedTotal = FeedbackRequest::where('company_id', $company->id)
            ->where('status', 'failed')
            ->count();
        $pendingTotal = FeedbackRequest::where('company_id', $company->id)
            ->whereIn('status', ['sent', 'pending'])
            ->count();

        $responseRate = $requestsTotal > 0
            ? round(($completedTotal / $requestsTotal) * 100, 1)
            : 0;
        $responseRate7d = $requestsLast7 > 0
            ? round(($completedLast7 / $requestsLast7) * 100, 1)
            : 0;

        $ratings = collect([1, 2, 3, 4, 5])->mapWithKeys(function ($star) use ($feedbacks) {
            return [
                $star => $feedbacks->where('rating', $star)->count()
            ];
        });

        $positiveCount = $feedbacks->whereIn('rating', [4, 5])->count();
        $negativeCount = $feedbacks->whereIn('rating', [1, 2])->count();
        $neutralCount = $feedbacks->where('rating', 3)->count();

        $avgRating = $feedbacks->whereNotNull('rating')->avg('rating');
        $avgRating = $avgRating ? round((float) $avgRating, 2) : null;

        $promoters = $feedbacks->where('rating', 5)->count();
        $detractors = $feedbacks->whereIn('rating', [1, 2])->count();
        $nps = $completedTotal > 0
            ? round((($promoters - $detractors) / $completedTotal) * 100, 1)
            : 0;

        $stats = [
            'customers' => $customers->count(),
            'feedbacks_total' => $feedbacks->count(),
            'feedbacks_completed' => $completedTotal,
            'feedbacks_sent' => $pendingTotal,
            'feedbacks_failed' => $failedTotal,
            'requests_total' => $requestsTotal,
            'requests_last_7d' => $requestsLast7,
            'completed_last_7d' => $completedLast7,
            'response_rate' => $responseRate,
            'response_rate_7d' => $responseRate7d,
            'avg_rating' => $avgRating,
            'nps' => $nps,
            'positive_count' => $positiveCount,
            'negative_count' => $negativeCount,
            'neutral_count' => $neutralCount,
            'ratings' => $ratings,
            'channel_email' => FeedbackRequest::where('company_id', $company->id)->where('channel', 'email')->count(),
            'channel_sms' => FeedbackRequest::where('company_id', $company->id)->where('channel', 'sms')->count(),
            'channel_whatsapp' => FeedbackRequest::where('company_id', $company->id)->where('channel', 'whatsapp')->count(),
            'channel_qr' => FeedbackRequest::where('company_id', $company->id)->where('channel', 'qr')->count(),
        ];

        $feedbackTrendRaw = Feedback::query()
            ->whereHas('feedbackRequest', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->whereBetween('created_at', [now()->subDays(13)->startOfDay(), now()->endOfDay()])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => (int) $row->count]);

        $feedbackTrend = collect();
        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $feedbackTrend->push([
                'date' => $date,
                'count' => $feedbackTrendRaw->get($date, 0),
            ]);
        }

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'customers' => $customers,
            'recentFeedbacks' => $feedbacks,
            'feedbackTrend' => $feedbackTrend,
        ]);
    }

    public function radar(RadarAnalysisService $radarService)
    {
        $company = Auth::user()->company;
        $data = $this->buildRadarData($company, 30);

        $analysis = $radarService->analyzeWithCache(
            companyId: $company->id,
            feedbacks: $data['analysisPayload'],
            sentimentStats: $data['sentiment'],
            feedbacksWithComments: $data['feedbacksWithComments']
        );

        $lastUpdated = $analysis['cached_at'] ?? now()->format('Y-m-d H:i');

        if ($analysis['cached']) {
            $analysis['cacheInfo'] = "Analyse mise en cache depuis " . $analysis['cached_at'];
        }

        return Inertia::render('Dashboard/RadarIA', [
            'period' => $data['period'],
            'stats' => $data['stats'],
            'channels' => $data['channels'],
            'trends' => $data['trends'],
            'signals' => $data['signals'],
            'recommendedActions' => $data['recommendedActions'],
            'benchmarks' => $data['benchmarks'],
            'healthScore' => $data['healthScore'],
            'analysis' => $analysis,
            'lastUpdated' => $lastUpdated,
        ]);
    }

    public function analytics()
    {
        $company = Auth::user()->company;

        if (! $company) {
            return redirect()->route('dashboard');
        }

        $now = now();
        $from = now()->subDays(29)->startOfDay();
        $prevFrom = now()->subDays(59)->startOfDay();
        $prevTo = now()->subDays(30)->endOfDay();

        $requestsQuery = FeedbackRequest::where('company_id', $company->id);
        $requestsTotal = (clone $requestsQuery)->count();
        $completedTotal = (clone $requestsQuery)->where('status', 'completed')->count();
        $failedTotal = (clone $requestsQuery)->where('status', 'failed')->count();
        $requestsLast30 = (clone $requestsQuery)->whereBetween('created_at', [$from, $now])->count();
        $requestsPrev30 = (clone $requestsQuery)->whereBetween('created_at', [$prevFrom, $prevTo])->count();
        $completedLast30 = (clone $requestsQuery)->where('status', 'completed')->whereBetween('created_at', [$from, $now])->count();
        $completedPrev30 = (clone $requestsQuery)->where('status', 'completed')->whereBetween('created_at', [$prevFrom, $prevTo])->count();

        $responseRate = $requestsTotal > 0
            ? round(($completedTotal / $requestsTotal) * 100, 1)
            : 0;
        $responseRateLast30 = $requestsLast30 > 0
            ? round(($completedLast30 / $requestsLast30) * 100, 1)
            : 0;
        $responseRatePrev30 = $requestsPrev30 > 0
            ? round(($completedPrev30 / $requestsPrev30) * 100, 1)
            : 0;

        $feedbacksQuery = Feedback::whereHas('feedbackRequest', function ($q) use ($company) {
            $q->where('company_id', $company->id);
        });

        $feedbacksTotal = (clone $feedbacksQuery)->count();
        $avgRating = (clone $feedbacksQuery)->avg('rating');
        $avgRating = $avgRating ? round((float) $avgRating, 2) : null;

        $ratingDistribution = collect([1, 2, 3, 4, 5])->mapWithKeys(function ($star) use ($feedbacksQuery) {
            return [$star => (clone $feedbacksQuery)->where('rating', $star)->count()];
        });

        $positiveCount = (clone $feedbacksQuery)->whereIn('rating', [4, 5])->count();
        $negativeCount = (clone $feedbacksQuery)->whereIn('rating', [1, 2])->count();
        $neutralCount = (clone $feedbacksQuery)->where('rating', 3)->count();

        $promoters = (clone $feedbacksQuery)->where('rating', 5)->count();
        $detractors = (clone $feedbacksQuery)->whereIn('rating', [1, 2])->count();
        $nps = $feedbacksTotal > 0
            ? round((($promoters - $detractors) / $feedbacksTotal) * 100, 1)
            : 0;

        $positiveRate = $feedbacksTotal > 0
            ? round(($positiveCount / $feedbacksTotal) * 100, 1)
            : 0;

        $responseTimes = (clone $requestsQuery)
            ->whereNotNull('sent_at')
            ->whereNotNull('responded_at')
            ->get(['sent_at', 'responded_at']);

        $avgResponseHours = $responseTimes->count() > 0
            ? round($responseTimes->avg(fn ($r) => $r->sent_at->diffInMinutes($r->responded_at)) / 60, 2)
            : null;

        $responseTimeByChannel = (clone $requestsQuery)
            ->whereNotNull('sent_at')
            ->whereNotNull('responded_at')
            ->select('channel', 'sent_at', 'responded_at')
            ->get()
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

        foreach ($responseTimes as $r) {
            $hours = $r->sent_at->diffInHours($r->responded_at);
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

        $requestsByDayRaw = (clone $requestsQuery)
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => (int) $row->count]);

        $completedByDayRaw = (clone $requestsQuery)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => (int) $row->count]);

        $ratingByDayRaw = (clone $feedbacksQuery)
            ->whereBetween('created_at', [$from, $now])
            ->selectRaw('DATE(created_at) as date, avg(rating) as avg_rating')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->date => round((float) $row->avg_rating, 2)]);

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

        $trend = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $trend->push([
                'date' => $date,
                'requests' => $requestsByDayRaw->get($date, 0),
                'completed' => $completedByDayRaw->get($date, 0),
                'avg_rating' => $ratingByDayRaw->get($date, null),
            ]);
        }

        $channels = [
            'email' => (clone $requestsQuery)->where('channel', 'email')->count(),
            'sms' => (clone $requestsQuery)->where('channel', 'sms')->count(),
            'qr' => (clone $requestsQuery)->where('channel', 'qr')->count(),
        ];

        $channelPerformance = collect(['email', 'sms', 'qr'])->mapWithKeys(function ($channel) use ($requestsQuery) {
            $total = (clone $requestsQuery)->where('channel', $channel)->count();
            $completed = (clone $requestsQuery)->where('channel', $channel)->where('status', 'completed')->count();
            $rate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;
            return [$channel => ['total' => $total, 'completed' => $completed, 'rate' => $rate]];
        });

        $stats = [
            'requests_total' => $requestsTotal,
            'completed_total' => $completedTotal,
            'failed_total' => $failedTotal,
            'response_rate' => $responseRate,
            'response_rate_last_30' => $responseRateLast30,
            'response_rate_prev_30' => $responseRatePrev30,
            'requests_last_30' => $requestsLast30,
            'requests_prev_30' => $requestsPrev30,
            'avg_rating' => $avgRating,
            'nps' => $nps,
            'positive_rate' => $positiveRate,
            'avg_response_hours' => $avgResponseHours,
            'feedbacks_total' => $feedbacksTotal,
            'positive_count' => $positiveCount,
            'neutral_count' => $neutralCount,
            'negative_count' => $negativeCount,
        ];

        return Inertia::render('Analytics/Index', [
            'stats' => $stats,
            'trend' => $trend,
            'channels' => $channels,
            'responseBuckets' => $responseBuckets,
            'ratingDistribution' => $ratingDistribution,
            'channelPerformance' => $channelPerformance,
            'responseTimeByChannel' => $responseTimeByChannel,
            'weekdayDistribution' => collect(range(0, 6))->map(fn ($d) => $weekdayRaw->get($d, 0)),
            'hourDistribution' => collect(range(0, 23))->map(fn ($h) => $hourRaw->get($h, 0)),
        ]);
    }

    public function exportRadar(Request $request)
    {
        $company = Auth::user()->company;

        if (! $company) {
            abort(403);
        }

        $days = (int) $request->query('days', 30);
        $days = max(7, min($days, 90));

        $data = $this->buildRadarData($company, $days);

        $filename = 'radar-ia-' . $company->id . '-' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($data) {
            $output = fopen('php://output', 'w');

            fputcsv($output, ['Radar IA Export']);
            fputcsv($output, ['Période', $data['period']['from'] . ' → ' . $data['period']['to']]);
            fputcsv($output, ['Généré le', now()->format('Y-m-d H:i')]);
            fputcsv($output, []);

            fputcsv($output, ['KPI', 'Valeur']);
            fputcsv($output, ['Feedbacks', $data['stats']['total']]);
            fputcsv($output, ['Taux positif', $data['stats']['positiveRate'] . '%']);
            fputcsv($output, ['Taux négatif', $data['stats']['negativeRate'] . '%']);
            fputcsv($output, ['Note moyenne', $data['stats']['avgRating'] ?? '—']);
            fputcsv($output, ['Taux de réponse', $data['stats']['responseRate'] . '%']);
            fputcsv($output, ['Health score', $data['healthScore']['score']]);
            fputcsv($output, []);

            fputcsv($output, ['Tendances (vs période précédente)', 'Actuel', 'Précédent', 'Delta']);
            fputcsv($output, ['Taux positif', $data['trends']['positiveRate']['current'] . '%', $data['trends']['positiveRate']['previous'] . '%', $data['trends']['positiveRate']['delta'] . '%']);
            fputcsv($output, ['Taux négatif', $data['trends']['negativeRate']['current'] . '%', $data['trends']['negativeRate']['previous'] . '%', $data['trends']['negativeRate']['delta'] . '%']);
            fputcsv($output, ['Taux de réponse', $data['trends']['responseRate']['current'] . '%', $data['trends']['responseRate']['previous'] . '%', $data['trends']['responseRate']['delta'] . '%']);
            fputcsv($output, ['Note moyenne', $data['trends']['avgRating']['current'] ?? '—', $data['trends']['avgRating']['previous'] ?? '—', $data['trends']['avgRating']['delta'] ?? '—']);
            fputcsv($output, ['Échecs d’envoi', $data['trends']['failedRequests']['current'], $data['trends']['failedRequests']['previous'], $data['trends']['failedRequests']['delta']]);
            fputcsv($output, []);

            fputcsv($output, ['Canaux (30j)', 'Demandes']);
            foreach ($data['channels'] as $channel) {
                fputcsv($output, [$channel['channel'], $channel['count']]);
            }
            fputcsv($output, []);

            fputcsv($output, ['Health Score - Drivers', 'Valeur']);
            fputcsv($output, ['Score note', $data['healthScore']['drivers']['rating_score'] ?? '—']);
            fputcsv($output, ['Pénalité négatif', $data['healthScore']['drivers']['negative_penalty'] ?? '—']);
            fputcsv($output, ['Pénalité réponse', $data['healthScore']['drivers']['response_penalty'] ?? '—']);
            fputcsv($output, ['Pénalité échecs', $data['healthScore']['drivers']['failed_penalty'] ?? '—']);
            fputcsv($output, []);

            fputcsv($output, ['Benchmarks', 'Entreprise', 'Médiane', 'Percentile']);
            foreach ($data['benchmarks'] as $key => $benchmark) {
                fputcsv($output, [
                    $benchmark['label'],
                    $benchmark['company'] ?? '—',
                    $benchmark['median'] ?? '—',
                    $benchmark['percentile'] !== null ? $benchmark['percentile'] . '%' : '—',
                ]);
            }
            fputcsv($output, []);

            fputcsv($output, ['Signals', 'Catégorie', 'Sévérité', 'Détail', 'Évidence']);
            foreach ($data['signals'] as $signal) {
                $evidence = '';
                if (! empty($signal['evidence']) && is_array($signal['evidence'])) {
                    $evidence = implode(' | ', $signal['evidence']);
                }
                fputcsv($output, [
                    $signal['title'] ?? '',
                    strtoupper($signal['category'] ?? ''),
                    strtoupper($signal['severity'] ?? ''),
                    $signal['detail'] ?? '',
                    $evidence,
                ]);
            }
            fputcsv($output, []);

            fputcsv($output, ['Actions recommandées', 'Priorité', 'Détail', 'Contexte']);
            foreach ($data['recommendedActions'] as $action) {
                $context = '';
                if (! empty($action['context'])) {
                    $contextParts = [];
                    if (! empty($action['context']['signal_title'])) {
                        $contextParts[] = 'Signal: ' . $action['context']['signal_title'];
                    }
                    if (! empty($action['context']['signal_detail'])) {
                        $contextParts[] = 'Détail: ' . $action['context']['signal_detail'];
                    }
                    if (! empty($action['context']['evidence']) && is_array($action['context']['evidence'])) {
                        $contextParts[] = 'Exemples: ' . implode(' | ', $action['context']['evidence']);
                    }
                    $context = implode(' / ', $contextParts);
                }
                fputcsv($output, [
                    $action['title'] ?? '',
                    $action['priority'] ?? '',
                    $action['detail'] ?? '',
                    $context,
                ]);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function buildRadarData($company, int $days): array
    {
        $periodStart = now()->subDays($days)->startOfDay();
        $periodEnd = now();
        $prevPeriodStart = now()->subDays($days * 2)->startOfDay();
        $prevPeriodEnd = now()->subDays($days)->endOfDay();

        $allFeedbacks = Feedback::query()
            ->whereHas('feedbackRequest', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->get();

        $previousFeedbacks = Feedback::query()
            ->whereHas('feedbackRequest', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->whereBetween('created_at', [$prevPeriodStart, $prevPeriodEnd])
            ->get();

        $analysisFeedbacks = Feedback::query()
            ->whereHas('feedbackRequest', function ($q) use ($company) {
                $q->where('company_id', $company->id);
            })
            ->whereNotNull('comment')
            ->with(['feedbackRequest.customer'])
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->latest()
            ->take(200)
            ->get();

        $channelStats = FeedbackRequest::query()
            ->where('company_id', $company->id)
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->whereNotNull('channel')
            ->selectRaw('channel, count(*) as count')
            ->groupBy('channel')
            ->orderBy('count', 'desc')
            ->get()
            ->map(fn ($row) => ['channel' => $row->channel, 'count' => (int) $row->count])
            ->values();

        $total = $allFeedbacks->count();
        $positive = $allFeedbacks->filter(fn ($f) => $f->rating !== null && $f->rating >= 4)->count();
        $negative = $allFeedbacks->filter(fn ($f) => $f->rating !== null && $f->rating <= 2)->count();
        $neutral = $total - $positive - $negative;

        $prevTotal = $previousFeedbacks->count();
        $prevPositive = $previousFeedbacks->filter(fn ($f) => $f->rating !== null && $f->rating >= 4)->count();
        $prevNegative = $previousFeedbacks->filter(fn ($f) => $f->rating !== null && $f->rating <= 2)->count();
        $prevNeutral = $prevTotal - $prevPositive - $prevNegative;

        $avgRating = $total > 0
            ? round((float) $allFeedbacks->whereNotNull('rating')->avg('rating'), 2)
            : null;

        $prevAvgRating = $prevTotal > 0
            ? round((float) $previousFeedbacks->whereNotNull('rating')->avg('rating'), 2)
            : null;

        $requestsCurrent = FeedbackRequest::query()
            ->where('company_id', $company->id)
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->count();

        $requestsPrevious = FeedbackRequest::query()
            ->where('company_id', $company->id)
            ->whereBetween('created_at', [$prevPeriodStart, $prevPeriodEnd])
            ->count();

        $responseRate = $requestsCurrent > 0
            ? round(($total / $requestsCurrent) * 100, 1)
            : 0;

        $prevResponseRate = $requestsPrevious > 0
            ? round(($prevTotal / $requestsPrevious) * 100, 1)
            : 0;

        $failedCurrent = FeedbackRequest::query()
            ->where('company_id', $company->id)
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->where('status', 'failed')
            ->count();

        $failedPrevious = FeedbackRequest::query()
            ->where('company_id', $company->id)
            ->whereBetween('created_at', [$prevPeriodStart, $prevPeriodEnd])
            ->where('status', 'failed')
            ->count();

        $positiveRate = $total > 0 ? round(($positive / $total) * 100, 1) : 0;
        $negativeRate = $total > 0 ? round(($negative / $total) * 100, 1) : 0;
        $prevPositiveRate = $prevTotal > 0 ? round(($prevPositive / $prevTotal) * 100, 1) : 0;
        $prevNegativeRate = $prevTotal > 0 ? round(($prevNegative / $prevTotal) * 100, 1) : 0;

        $signals = [];
        $recommendedActions = [];

        $negativeEvidence = $analysisFeedbacks
            ->filter(fn ($f) => $f->rating !== null && $f->rating <= 2)
            ->take(3)
            ->map(fn ($f) => str($f->comment)->limit(160)->toString())
            ->values()
            ->all();

        $positiveEvidence = $analysisFeedbacks
            ->filter(fn ($f) => $f->rating !== null && $f->rating >= 4)
            ->take(3)
            ->map(fn ($f) => str($f->comment)->limit(160)->toString())
            ->values()
            ->all();

        $negativeDelta = round($negativeRate - $prevNegativeRate, 1);
        if ($negativeDelta >= 10) {
            $signals[] = [
                'category' => 'risk',
                'severity' => $negativeDelta >= 20 ? 'high' : 'medium',
                'title' => 'Hausse du taux négatif',
                'detail' => "Taux négatif en hausse de {$negativeDelta} points vs période précédente.",
                'evidence_count' => $negative,
                'evidence' => $negativeEvidence,
            ];
            $recommendedActions[] = [
                'priority' => 'P0',
                'title' => 'Traiter les causes principales des avis négatifs',
                'detail' => 'Identifier les 3 problèmes récurrents et définir un plan d’action correctif sur 7 jours.',
                'context' => [
                    'signal_title' => 'Hausse du taux négatif',
                    'signal_detail' => "Taux négatif en hausse de {$negativeDelta} points vs période précédente.",
                    'evidence' => $negativeEvidence,
                ],
            ];
        }

        $responseDelta = round($responseRate - $prevResponseRate, 1);
        if ($responseDelta <= -15) {
            $signals[] = [
                'category' => 'ops',
                'severity' => $responseDelta <= -25 ? 'high' : 'medium',
                'title' => 'Baisse du taux de réponse',
                'detail' => "Taux de réponse en baisse de {$responseDelta} points vs période précédente.",
                'evidence_count' => $requestsCurrent,
            ];
            $recommendedActions[] = [
                'priority' => 'P1',
                'title' => 'Relancer les clients non répondus',
                'detail' => 'Créer une campagne de relance ciblée (email/SMS) pour les demandes non complétées.',
                'context' => [
                    'signal_title' => 'Baisse du taux de réponse',
                    'signal_detail' => "Taux de réponse en baisse de {$responseDelta} points vs période précédente.",
                ],
            ];
        }

        if ($failedCurrent >= 5 && $failedCurrent > $failedPrevious) {
            $signals[] = [
                'category' => 'ops',
                'severity' => $failedCurrent >= 15 ? 'high' : 'medium',
                'title' => 'Échecs d’envoi en hausse',
                'detail' => "{$failedCurrent} échecs sur la période (vs {$failedPrevious}).",
                'evidence_count' => $failedCurrent,
            ];
            $recommendedActions[] = [
                'priority' => 'P1',
                'title' => 'Vérifier deliverability et canaux',
                'detail' => 'Contrôler SPF/DKIM/DMARC et l’état des numéros SMS; tester un envoi manuel.',
                'context' => [
                    'signal_title' => 'Échecs d’envoi en hausse',
                    'signal_detail' => "{$failedCurrent} échecs sur la période (vs {$failedPrevious}).",
                ],
            ];
        }

        $positiveDelta = round($positiveRate - $prevPositiveRate, 1);
        if ($positiveDelta >= 10 && $negativeRate <= 20) {
            $signals[] = [
                'category' => 'opportunity',
                'severity' => $positiveDelta >= 20 ? 'high' : 'medium',
                'title' => 'Progression de la satisfaction',
                'detail' => "Taux positif en hausse de {$positiveDelta} points.",
                'evidence_count' => $positive,
                'evidence' => $positiveEvidence,
            ];
            $recommendedActions[] = [
                'priority' => 'P2',
                'title' => 'Capitaliser sur les points forts',
                'detail' => 'Mettre en avant les aspects les plus appréciés (site, réseaux, campagnes).',
                'context' => [
                    'signal_title' => 'Progression de la satisfaction',
                    'signal_detail' => "Taux positif en hausse de {$positiveDelta} points.",
                    'evidence' => $positiveEvidence,
                ],
            ];
        }

        $channelSignals = $this->buildChannelSignals($company->id, $periodStart, $periodEnd, $prevPeriodStart, $prevPeriodEnd);
        $signals = array_merge($signals, $channelSignals['signals']);
        $recommendedActions = array_merge($recommendedActions, $channelSignals['actions']);

        $sentiment = [
            'positive' => $positive,
            'neutral' => $neutral,
            'negative' => $negative,
        ];

        $payload = $analysisFeedbacks->map(function ($f) {
            return [
                'id' => $f->id,
                'rating' => $f->rating,
                'comment' => $f->comment,
                'customer' => $f->feedbackRequest?->customer?->name,
                'created_at' => optional($f->created_at)->format('Y-m-d'),
            ];
        })->values()->all();

        $benchmarks = $this->buildBenchmarks($company->id, $periodStart, $periodEnd);
        $healthScore = $this->buildHealthScore($responseRate, $negativeRate, $avgRating, $failedCurrent);

        return [
            'period' => [
                'from' => $periodStart->format('Y-m-d'),
                'to' => $periodEnd->format('Y-m-d'),
                'days' => $days,
            ],
            'stats' => [
                'total' => $total,
                'positive' => $positive,
                'negative' => $negative,
                'neutral' => $neutral,
                'positiveRate' => $positiveRate,
                'negativeRate' => $negativeRate,
                'avgRating' => $avgRating,
                'responseRate' => $responseRate,
            ],
            'channels' => $channelStats,
            'trends' => [
                'positiveRate' => [
                    'current' => $positiveRate,
                    'previous' => $prevPositiveRate,
                    'delta' => round($positiveRate - $prevPositiveRate, 1),
                ],
                'negativeRate' => [
                    'current' => $negativeRate,
                    'previous' => $prevNegativeRate,
                    'delta' => round($negativeRate - $prevNegativeRate, 1),
                ],
                'responseRate' => [
                    'current' => $responseRate,
                    'previous' => $prevResponseRate,
                    'delta' => round($responseRate - $prevResponseRate, 1),
                ],
                'avgRating' => [
                    'current' => $avgRating,
                    'previous' => $prevAvgRating,
                    'delta' => $avgRating !== null && $prevAvgRating !== null
                        ? round($avgRating - $prevAvgRating, 2)
                        : null,
                ],
                'failedRequests' => [
                    'current' => $failedCurrent,
                    'previous' => $failedPrevious,
                    'delta' => $failedCurrent - $failedPrevious,
                ],
            ],
            'signals' => $signals,
            'recommendedActions' => $recommendedActions,
            'benchmarks' => $benchmarks,
            'healthScore' => $healthScore,
            'analysisPayload' => $payload,
            'sentiment' => $sentiment,
            'feedbacksWithComments' => $analysisFeedbacks->count(),
        ];
    }

    private function buildBenchmarks(int $companyId, $periodStart, $periodEnd): array
    {
        $metrics = DB::table('companies')
            ->select('companies.id', 'companies.name')
            ->leftJoin('feedback_requests', function ($join) use ($periodStart, $periodEnd) {
                $join->on('feedback_requests.company_id', '=', 'companies.id')
                    ->whereBetween('feedback_requests.created_at', [$periodStart, $periodEnd]);
            })
            ->leftJoin('feedback', 'feedback.feedback_request_id', '=', 'feedback_requests.id')
            ->groupBy('companies.id', 'companies.name')
            ->selectRaw('count(feedback_requests.id) as requests_count')
            ->selectRaw('count(feedback.id) as feedbacks_count')
            ->selectRaw('avg(feedback.rating) as avg_rating')
            ->selectRaw('sum(case when feedback.rating <= 2 then 1 else 0 end) as negative_count')
            ->get()
            ->map(function ($row) {
                $requests = (int) $row->requests_count;
                $feedbacks = (int) $row->feedbacks_count;
                $negative = (int) $row->negative_count;

                $responseRate = $requests > 0 ? round(($feedbacks / $requests) * 100, 1) : 0;
                $negativeRate = $feedbacks > 0 ? round(($negative / $feedbacks) * 100, 1) : 0;
                $avgRating = $row->avg_rating !== null ? round((float) $row->avg_rating, 2) : null;

                return [
                    'id' => (int) $row->id,
                    'responseRate' => $responseRate,
                    'negativeRate' => $negativeRate,
                    'avgRating' => $avgRating,
                ];
            })
            ->values();

        $current = $metrics->firstWhere('id', $companyId);

        $responseRates = $metrics->pluck('responseRate')->filter()->values()->all();
        $negativeRates = $metrics->pluck('negativeRate')->filter()->values()->all();
        $avgRatings = $metrics->pluck('avgRating')->filter()->values()->all();

        return [
            'responseRate' => [
                'label' => 'Taux de réponse',
                'company' => $current['responseRate'] ?? null,
                'median' => $this->median($responseRates),
                'percentile' => $this->percentileRank($responseRates, $current['responseRate'] ?? null),
            ],
            'negativeRate' => [
                'label' => 'Taux négatif',
                'company' => $current['negativeRate'] ?? null,
                'median' => $this->median($negativeRates),
                'percentile' => $this->percentileRank($negativeRates, $current['negativeRate'] ?? null),
            ],
            'avgRating' => [
                'label' => 'Note moyenne',
                'company' => $current['avgRating'] ?? null,
                'median' => $this->median($avgRatings),
                'percentile' => $this->percentileRank($avgRatings, $current['avgRating'] ?? null),
            ],
        ];
    }

    private function buildHealthScore(float $responseRate, float $negativeRate, ?float $avgRating, int $failedCurrent): array
    {
        $ratingScore = $avgRating !== null ? ($avgRating / 5) * 100 : 50;
        $negPenalty = $negativeRate * 0.6;
        $respPenalty = (100 - $responseRate) * 0.3;
        $failPenalty = min($failedCurrent * 2, 15);

        $score = round(max(0, min(100, $ratingScore - $negPenalty - $respPenalty - $failPenalty)), 1);

        return [
            'score' => $score,
            'drivers' => [
                'rating_score' => round($ratingScore, 1),
                'negative_penalty' => round($negPenalty, 1),
                'response_penalty' => round($respPenalty, 1),
                'failed_penalty' => round($failPenalty, 1),
            ],
        ];
    }

    private function buildChannelSignals(int $companyId, $periodStart, $periodEnd, $prevStart, $prevEnd): array
    {
        $current = DB::table('feedback_requests')
            ->leftJoin('feedback', 'feedback.feedback_request_id', '=', 'feedback_requests.id')
            ->where('feedback_requests.company_id', $companyId)
            ->whereBetween('feedback_requests.created_at', [$periodStart, $periodEnd])
            ->whereNotNull('feedback_requests.channel')
            ->groupBy('feedback_requests.channel')
            ->selectRaw('feedback_requests.channel as channel')
            ->selectRaw('count(feedback_requests.id) as requests_count')
            ->selectRaw('count(feedback.id) as feedbacks_count')
            ->selectRaw('sum(case when feedback.rating <= 2 then 1 else 0 end) as negative_count')
            ->get()
            ->keyBy('channel');

        $previous = DB::table('feedback_requests')
            ->leftJoin('feedback', 'feedback.feedback_request_id', '=', 'feedback_requests.id')
            ->where('feedback_requests.company_id', $companyId)
            ->whereBetween('feedback_requests.created_at', [$prevStart, $prevEnd])
            ->whereNotNull('feedback_requests.channel')
            ->groupBy('feedback_requests.channel')
            ->selectRaw('feedback_requests.channel as channel')
            ->selectRaw('count(feedback_requests.id) as requests_count')
            ->selectRaw('count(feedback.id) as feedbacks_count')
            ->selectRaw('sum(case when feedback.rating <= 2 then 1 else 0 end) as negative_count')
            ->get()
            ->keyBy('channel');

        $signals = [];
        $actions = [];

        foreach ($current as $channel => $row) {
            $prev = $previous->get($channel);

            $requests = (int) $row->requests_count;
            $feedbacks = (int) $row->feedbacks_count;
            $negative = (int) $row->negative_count;

            $prevRequests = (int) ($prev->requests_count ?? 0);
            $prevFeedbacks = (int) ($prev->feedbacks_count ?? 0);
            $prevNegative = (int) ($prev->negative_count ?? 0);

            $responseRate = $requests > 0 ? ($feedbacks / $requests) * 100 : 0;
            $prevResponseRate = $prevRequests > 0 ? ($prevFeedbacks / $prevRequests) * 100 : 0;
            $responseDelta = round($responseRate - $prevResponseRate, 1);

            $negativeRate = $feedbacks > 0 ? ($negative / $feedbacks) * 100 : 0;
            $prevNegativeRate = $prevFeedbacks > 0 ? ($prevNegative / $prevFeedbacks) * 100 : 0;
            $negativeDelta = round($negativeRate - $prevNegativeRate, 1);

            if ($responseDelta <= -20 && $requests >= 5) {
                $signals[] = [
                    'category' => 'ops',
                    'severity' => $responseDelta <= -35 ? 'high' : 'medium',
                    'title' => "Baisse de réponse — {$channel}",
                    'detail' => "Taux de réponse {$channel} en baisse de {$responseDelta} points.",
                    'evidence_count' => $requests,
                ];
                $actions[] = [
                    'priority' => 'P1',
                    'title' => "Relance ciblée ({$channel})",
                    'detail' => "Créer une relance dédiée pour les demandes envoyées via {$channel}.",
                    'context' => [
                        'signal_title' => "Baisse de réponse — {$channel}",
                        'signal_detail' => "Taux de réponse {$channel} en baisse de {$responseDelta} points.",
                    ],
                ];
            }

            if ($negativeDelta >= 15 && $feedbacks >= 5) {
                $signals[] = [
                    'category' => 'risk',
                    'severity' => $negativeDelta >= 25 ? 'high' : 'medium',
                    'title' => "Hausse négative — {$channel}",
                    'detail' => "Taux négatif {$channel} en hausse de {$negativeDelta} points.",
                    'evidence_count' => $negative,
                ];
                $actions[] = [
                    'priority' => 'P0',
                    'title' => "Analyser les retours négatifs ({$channel})",
                    'detail' => "Extraire les causes principales liées aux retours {$channel}.",
                    'context' => [
                        'signal_title' => "Hausse négative — {$channel}",
                        'signal_detail' => "Taux négatif {$channel} en hausse de {$negativeDelta} points.",
                    ],
                ];
            }
        }

        return ['signals' => $signals, 'actions' => $actions];
    }

    private function percentileRank(array $values, ?float $current): ?float
    {
        if ($current === null || empty($values)) {
            return null;
        }

        $sorted = $values;
        sort($sorted);
        $count = count($sorted);
        $below = collect($sorted)->filter(fn ($v) => $v <= $current)->count();

        return round(($below / $count) * 100, 1);
    }

    private function median(array $values): ?float
    {
        if (empty($values)) {
            return null;
        }

        $sorted = $values;
        sort($sorted);
        $count = count($sorted);
        $mid = (int) floor($count / 2);

        if ($count % 2 === 0) {
            return round((($sorted[$mid - 1] + $sorted[$mid]) / 2), 1);
        }

        return round($sorted[$mid], 1);
    }
}
