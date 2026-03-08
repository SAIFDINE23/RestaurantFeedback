import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, stats, recentFeedbacks, feedbackTrend }) {
    const responseDelta = (stats.response_rate_7d ?? 0) - (stats.response_rate ?? 0);
    const avgRating = stats.avg_rating ?? '—';
    const nps = stats.nps ?? 0;
    const pending = stats.feedbacks_sent ?? 0;
    const failed = stats.feedbacks_failed ?? 0;
    const completed = stats.feedbacks_completed ?? 0;
    const totalRequests = stats.requests_total ?? 0;
    const completionRate = totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0;

    const getInsight = () => {
        if (stats.response_rate >= 80) {
            return {
                tone: 'emerald',
                title: 'Excellente performance',
                message: `Votre taux de réponse est à ${stats.response_rate}%. Gardez ce niveau !`,
            };
        }
        if (stats.response_rate < 40) {
            return {
                tone: 'rose',
                title: 'Taux de réponse faible',
                message: `Seulement ${stats.response_rate}% de réponses. Lancez une relance ciblée.`,
            };
        }
        if (stats.avg_rating && stats.avg_rating >= 4.2) {
            return {
                tone: 'indigo',
                title: 'Clients satisfaits',
                message: `Note moyenne ${stats.avg_rating}/5. Capitalisez sur vos forces.`,
            };
        }
        return {
            tone: 'amber',
            title: 'Opportunité de croissance',
            message: 'Améliorez la collecte des feedbacks et la rapidité des réponses.',
        };
    };

    const insight = getInsight();

    return (
        <AuthenticatedLayout user={auth.user} header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-10">
                {/* Hero Premium */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    <div className="relative p-8 lg:p-10">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex-1 min-w-[300px]">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-4">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Dashboard Opérationnel
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                                    Performance & Expérience Client
                                </h1>
                                <p className="text-lg text-indigo-100/90 max-w-2xl">
                                    Suivi en temps réel des KPI business, qualité de service et actions prioritaires.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={route('customers.create')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        <PlusIcon />
                                        Ajouter un client
                                    </Link>
                                    <Link
                                        href={route('feedbacks.index')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white text-sm font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
                                    >
                                        <ChatIcon />
                                        Feedbacks
                                    </Link>
                                    <Link
                                        href={route('radar')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        <RadarIcon />
                                        Radar IA
                                        <span className="text-[10px] bg-white/30 px-2 py-0.5 rounded-full">PRO</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`px-5 py-3 rounded-2xl text-sm font-bold backdrop-blur-sm border-2 ${
                                    insight.tone === 'emerald'
                                        ? 'bg-emerald-500/30 text-white border-emerald-400/50'
                                        : insight.tone === 'rose'
                                            ? 'bg-rose-500/30 text-white border-rose-400/50'
                                            : insight.tone === 'indigo'
                                                ? 'bg-indigo-500/40 text-white border-indigo-400/50'
                                                : 'bg-amber-500/30 text-white border-amber-400/50'
                                }`}>
                                    <div className="text-xs opacity-80 mb-1">Insight</div>
                                    {insight.title}
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-base text-indigo-100/90 font-medium">{insight.message}</p>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Demandes (7j)" value={stats.requests_last_7d} helper="volume" tone="indigo" icon={<SendIcon />} />
                    <KpiCard title="Réponses (7j)" value={stats.completed_last_7d} helper="complétées" tone="emerald" icon={<CheckIcon />} />
                    <KpiCard title="Taux réponse" value={`${stats.response_rate_7d}%`} helper="7 derniers jours" tone="purple" icon={<ChartIcon />} delta={responseDelta} />
                    <KpiCard title="Clients" value={stats.customers} helper="actifs" tone="blue" icon={<UsersIconSolid />} />
                </div>

                {/* Operational KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:col-span-2 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Pipeline opérationnel</h3>
                                <p className="text-sm text-gray-500 mt-1">Conversion demandes → réponses</p>
                            </div>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                Taux global {completionRate}%
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ProgressStat label="En attente" value={pending} total={totalRequests} tone="amber" />
                            <ProgressStat label="Complétés" value={completed} total={totalRequests} tone="emerald" />
                            <ProgressStat label="Échecs" value={failed} total={totalRequests} tone="rose" />
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <MiniStat label="Note moyenne" value={avgRating} sub="global" />
                            <MiniStat label="NPS" value={nps} sub="global" />
                            <MiniStat label="Taux réponse" value={`${stats.response_rate}%`} sub="global" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Sentiment client</h3>
                            <p className="text-sm text-gray-500 mt-1">Positif / Neutre / Négatif</p>
                        </div>
                        <div className="mt-4">
                            <SentimentDonut
                                positive={stats.positive_count}
                                neutral={stats.neutral_count}
                                negative={stats.negative_count}
                            />
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Répartition des notes</h3>
                            <p className="text-sm text-gray-500 mt-1">Distribution complète des évaluations</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            Total: {stats.feedbacks_completed}
                        </span>
                    </div>

                    <div className="mt-6 space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.ratings?.[star] ?? 0;
                            const total = stats.feedbacks_completed || 1;
                            const percentage = Math.round((count / total) * 100);

                            return (
                                <div key={star} className="flex items-center gap-4 group">
                                    <div className="w-20 font-bold text-base text-gray-700 flex items-center gap-1">
                                        {star} <span className="text-yellow-500">★</span>
                                    </div>

                                    <div className="flex-1 relative bg-gray-100 rounded-full h-4 overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-700 group-hover:from-yellow-500 group-hover:to-amber-600"
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                                        </div>
                                    </div>

                                    <div className="w-16 text-right">
                                        <div className="text-base font-bold text-gray-900">{count}</div>
                                        <div className="text-xs text-gray-500">{percentage}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {(stats.ratings?.[4] + stats.ratings?.[5] > 0) && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-r-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⭐</span>
                                <span className="text-sm font-bold text-emerald-700">
                                    Clients satisfaits détectés — prêts pour Google Reviews
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Feedback Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:col-span-2 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Tendance des feedbacks</h2>
                                <p className="text-sm text-gray-500 mt-1">Évolution sur 14 jours</p>
                            </div>
                            <span className="text-xs font-semibold text-gray-400 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1 rounded-full">14 derniers jours</span>
                        </div>
                        <div className="mt-4">
                            <TrendBars data={feedbackTrend} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Derniers feedbacks</h3>
                            <p className="text-sm text-gray-500 mt-1">Actions rapides</p>
                        </div>
                        <div className="mt-4 space-y-3">
                            {recentFeedbacks.slice(0, 5).map((fb) => (
                                <div key={fb.id} className="flex items-start justify-between gap-3 p-4 rounded-xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white hover:from-indigo-50 hover:to-white hover:border-indigo-200 hover:shadow-md transition-all duration-300 group">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{fb.customer?.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">{fb.created_at}</div>
                                        <div className="mt-2">
                                            <StatusBadge status={fb.status} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Rating value={fb.rating} />
                                        <div className="mt-2">
                                            <FeedbackAction feedback={fb} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href={route('feedbacks.index')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 group">
                            Voir tous les feedbacks
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>

                {/* Channel Distribution */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Canaux de distribution</h3>
                            <p className="text-sm text-gray-500 mt-1">Performance par canal d'envoi</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            Total: {stats.requests_total}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ChannelCard 
                            channel="Email" 
                            icon="📧" 
                            count={stats.channel_email || 0}
                            total={stats.requests_total}
                            gradient="from-blue-500 to-indigo-500"
                        />
                        <ChannelCard 
                            channel="SMS" 
                            icon="📱" 
                            count={stats.channel_sms || 0}
                            total={stats.requests_total}
                            gradient="from-emerald-500 to-teal-500"
                        />
                        <ChannelCard 
                            channel="WhatsApp" 
                            icon="💬" 
                            count={stats.channel_whatsapp || 0}
                            total={stats.requests_total}
                            gradient="from-green-500 to-emerald-600"
                        />
                        <ChannelCard 
                            channel="QR Code" 
                            icon="📲" 
                            count={stats.channel_qr || 0}
                            total={stats.requests_total}
                            gradient="from-purple-500 to-fuchsia-500"
                        />
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💡</span>
                            <span className="text-sm font-bold text-blue-700">
                                Optimisez votre stratégie en fonction des canaux les plus performants
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ title, value, helper, icon, tone }) {
    const tones = {
        indigo: {
            gradient: 'from-indigo-500 via-indigo-600 to-violet-600',
            border: 'border-indigo-200'
        },
        blue: {
            gradient: 'from-blue-500 via-blue-600 to-cyan-600',
            border: 'border-blue-200'
        },
        emerald: {
            gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
            border: 'border-emerald-200'
        },
        purple: {
            gradient: 'from-purple-500 via-purple-600 to-fuchsia-600',
            border: 'border-purple-200'
        },
    };

    return (
        <div className={`relative group bg-white rounded-2xl shadow-sm border-2 ${tones[tone].border} p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden`}>
            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
                    <p className="text-4xl font-black text-gray-900 mt-2">{value}</p>
                    {helper && <p className="text-xs font-medium text-gray-500 mt-2">{helper}</p>}
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tones[tone].gradient} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, helper, icon, tone, delta }) {
    const deltaLabel = typeof delta === 'number'
        ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
        : null;
    const deltaTone = delta > 0 ? 'text-emerald-600 bg-emerald-50' : delta < 0 ? 'text-rose-600 bg-rose-50' : 'text-gray-600 bg-gray-50';

    return (
        <div className={`relative group bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
            tone === 'indigo' ? 'border-indigo-200' :
            tone === 'emerald' ? 'border-emerald-200' :
            tone === 'purple' ? 'border-purple-200' :
            'border-blue-200'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
                    <p className="text-4xl font-black text-gray-900 mt-2">{value}</p>
                    <div className="mt-2 flex items-center gap-2">
                        {helper && <span className="text-xs font-medium text-gray-500">{helper}</span>}
                        {deltaLabel && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${deltaTone}`}>
                                {deltaLabel}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                    tone === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-violet-600' :
                    tone === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                    tone === 'purple' ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600' :
                    'bg-gradient-to-br from-blue-500 to-indigo-500'
                }`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, sub }) {
    return (
        <div className="group p-5 rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white hover:from-indigo-50 hover:to-white hover:border-indigo-200 transition-all duration-300">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-black text-gray-900 mt-2 group-hover:text-indigo-600 transition-colors">{value}</p>
            <p className="text-xs font-medium text-gray-400 mt-1">{sub}</p>
        </div>
    );
}

function ProgressStat({ label, value, total, tone }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const tones = {
        amber: 'from-amber-500 to-orange-500',
        emerald: 'from-emerald-500 to-teal-500',
        rose: 'from-rose-500 to-pink-500',
    };

    return (
        <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <span className="text-xs font-semibold text-gray-400">{percentage}%</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${tones[tone]} transition-all duration-700`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        sent: 'bg-blue-100 text-blue-700',
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
}

function Rating({ value }) {
    if (!value) return <span className="text-gray-400">—</span>;
    return (
        <span className="text-yellow-500 font-medium">{value} ★</span>
    );
}

function FeedbackAction({ feedback }) {
    if (feedback.status === 'completed') {
        return (
            <div className="flex items-center gap-2">
                <Link href={route('feedback.adminShow', feedback.id)} className="text-green-600 hover:text-green-700 text-xs font-semibold">
                    Voir
                </Link>
                <Link href={route('feedback.replies.index', feedback.feedback_id)} className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                    Répondre
                </Link>
            </div>
        );
    }
    return <span className="text-gray-400">—</span>;
}

function SentimentDonut({ positive = 0, neutral = 0, negative = 0 }) {
    const total = Math.max(positive + neutral + negative, 0);

    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const seg = (value) => (total > 0 ? (value / total) * circumference : 0);

    const positiveLen = seg(positive);
    const neutralLen = seg(neutral);
    const negativeLen = seg(negative);

    const positiveOffset = 0;
    const neutralOffset = -positiveLen;
    const negativeOffset = -(positiveLen + neutralLen);

    return (
        <div className="flex items-center gap-5">
            <div className="relative">
                <svg width="120" height="120" viewBox="0 0 40 40" className="block">
                    <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="6" />
                    <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="6" strokeDasharray={`${positiveLen} ${Math.max(circumference - positiveLen, 0)}`} strokeDashoffset={positiveOffset} transform="rotate(-90 20 20)" />
                    <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="6" strokeDasharray={`${neutralLen} ${Math.max(circumference - neutralLen, 0)}`} strokeDashoffset={neutralOffset} transform="rotate(-90 20 20)" />
                    <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" className="text-rose-500" strokeWidth="6" strokeDasharray={`${negativeLen} ${Math.max(circumference - negativeLen, 0)}`} strokeDashoffset={negativeOffset} transform="rotate(-90 20 20)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-gray-900">{total}</div>
                    <div className="text-[11px] font-semibold text-gray-500">feedbacks</div>
                </div>
            </div>
            <div className="flex-1">
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-sm text-gray-700">Positif</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{positive}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-sm text-gray-700">Neutre</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{neutral}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-sm text-gray-700">Négatif</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{negative}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrendBars({ data }) {
    if (!data?.length) {
        return <p className="text-sm text-gray-500">Aucune donnée disponible.</p>;
    }

    const max = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="flex items-end gap-2 h-40">
            {data.map((point) => {
                const height = Math.round((point.count / max) * 100);
                return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-gradient-to-t from-gray-100 to-gray-50 rounded-t-xl overflow-hidden h-32 flex items-end relative">
                            <div
                                className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 transition-all duration-300 rounded-t-lg relative group-hover:shadow-lg"
                                style={{ height: `${height}%` }}
                                title={`${point.count} feedback(s) - ${point.date}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20"></div>
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {point.count} feedbacks
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 group-hover:text-indigo-600 transition-colors">
                            {point.date.slice(5)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function ChannelCard({ channel, icon, count, total, gradient }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 p-6 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{icon}</span>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-xl font-black text-white">{percentage}%</span>
                    </div>
                </div>
                
                <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{channel}</p>
                    <p className="text-3xl font-black text-gray-900 mt-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${gradient} transition-all">
                        {count}
                    </p>
                    <p className="text-xs font-medium text-gray-500 mt-1">demandes envoyées</p>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}


/* ---------------- ICONS ---------------- */
const PlusIcon = () => <span className="text-xl">＋</span>;
const UsersIcon = () => <span className="text-xl">👥</span>;
const UsersIconSolid = () => <span className="text-2xl">👤</span>;
const SendIcon = () => <span className="text-2xl">📤</span>;
const CheckIcon = () => <span className="text-2xl">✅</span>;
const ChartIcon = () => <span className="text-2xl">📊</span>;
const ChatIcon = () => <span className="text-xl">💬</span>;
const RadarIcon = () => <span className="text-xl">🧭</span>;
