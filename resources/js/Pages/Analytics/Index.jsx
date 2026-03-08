import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    TrendingUp, TrendingDown, Star, Clock, Zap, Send,
    Activity, BarChart3, Target, CheckCircle2, XCircle, AlertTriangle,
    Mail, Smartphone, QrCode, Calendar, Timer, ArrowUpRight, ArrowDownRight,
    Layers, Filter, Sparkles, Shield,
} from 'lucide-react';
import { useMemo } from 'react';

/* ================================================================
   FEEDORA ANALYTICS PRO — Data Intelligence Suite
   ================================================================ */

export default function Analytics({
    auth, stats, trend, channels, responseBuckets,
    ratingDistribution, channelPerformance, responseTimeByChannel,
    weekdayDistribution, hourDistribution,
}) {
    // -------- Derived metrics --------
    const responseDelta = (stats.response_rate_last_30 ?? 0) - (stats.response_rate_prev_30 ?? 0);
    const requestsDelta = (stats.requests_last_30 ?? 0) - (stats.requests_prev_30 ?? 0);
    const totalRatings = Object.values(ratingDistribution || {}).reduce((s, v) => s + v, 0) || 1;
    const channelTotal = (channels?.email || 0) + (channels?.sms || 0) + (channels?.qr || 0) || 1;
    const bucketTotal = Object.values(responseBuckets || {}).reduce((s, v) => s + v, 0) || 1;

    // Best performing day/hour
    const bestDay = useMemo(() => {
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        if (!weekdayDistribution || weekdayDistribution.length === 0) return null;
        const maxIdx = weekdayDistribution.indexOf(Math.max(...weekdayDistribution));
        return { name: days[maxIdx], count: weekdayDistribution[maxIdx] };
    }, [weekdayDistribution]);

    const timeSlots = useMemo(() => {
        if (!hourDistribution || hourDistribution.length === 0) return [];
        const slots = [
            { label: 'Matin',      emoji: '🌅', range: [6, 12],  count: 0 },
            { label: 'Midi',       emoji: '☀️', range: [12, 14], count: 0 },
            { label: 'Après-midi', emoji: '🌤️', range: [14, 18], count: 0 },
            { label: 'Soir',       emoji: '🌙', range: [18, 22], count: 0 },
            { label: 'Nuit',       emoji: '🌑', range: [22, 6],  count: 0 },
        ];
        hourDistribution.forEach((val, hour) => {
            if (hour >= 6 && hour < 12) slots[0].count += val;
            else if (hour >= 12 && hour < 14) slots[1].count += val;
            else if (hour >= 14 && hour < 18) slots[2].count += val;
            else if (hour >= 18 && hour < 22) slots[3].count += val;
            else slots[4].count += val;
        });
        const maxCount = Math.max(...slots.map(s => s.count), 1);
        return slots.map(s => ({ ...s, pct: Math.round((s.count / maxCount) * 100) }));
    }, [hourDistribution]);

    const bestSlot = useMemo(() => {
        if (timeSlots.length === 0) return null;
        return timeSlots.reduce((best, s) => s.count > best.count ? s : best, timeSlots[0]);
    }, [timeSlots]);

    // Conversion funnel data
    const funnel = useMemo(() => {
        const total = stats.requests_total || 0;
        const completed = stats.completed_total || 0;
        const failed = stats.failed_total || 0;
        const pending = total - completed - failed;
        return { total, completed, failed, pending };
    }, [stats]);

    return (
        <AuthenticatedLayout user={auth.user} header="Analytics">
            <Head title="Analytics Pro" />

            <div className="space-y-6">

                {/* ============================================================
                    HERO — Pro Badge + Key Insight
                    ============================================================ */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#FF6F61]/15 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                    </div>
                    <div className="relative px-6 py-7 sm:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F61]/20 border border-[#FF6F61]/30 text-[#FF6F61] text-xs font-bold mb-3">
                                    <Sparkles size={12} />
                                    Plan Pro — Analytics Avancés
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    Intelligence Business
                                </h1>
                                <p className="text-slate-400 text-sm mt-1.5 max-w-xl">
                                    Comprenez vos clients, améliorez votre service et suivez vos progrès en un coup d'œil.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link href={route('feedbacks.index')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-xs font-medium transition-all">
                                    <BarChart3 size={14} /> Feedbacks
                                </Link>
                                <Link href={route('radar')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6F61] hover:bg-[#e5635a] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF6F61]/20">
                                    <Zap size={14} /> Radar IA
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    EXECUTIVE KPIs — 6 cards
                    ============================================================ */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <MetricCard label="Volume total" value={stats.requests_total} icon={<Send size={16} />} color="slate" />
                    <MetricCard label="Taux réponse" value={`${stats.response_rate}%`} delta={responseDelta} icon={<Activity size={16} />} color="indigo" />
                    <MetricCard label="Satisfaction" value={stats.avg_rating ? `${stats.avg_rating}/5` : '—'} icon={<Star size={16} />} color="amber" stars={stats.avg_rating} />
                    <MetricCard label="NPS" value={stats.nps} icon={<Target size={16} />} color="feedora" />
                    <MetricCard label="Temps moyen" value={stats.avg_response_hours ? formatDuration(stats.avg_response_hours) : '—'} icon={<Clock size={16} />} color="violet" />
                    <MetricCard label="Taux positif" value={`${stats.positive_rate}%`} icon={<CheckCircle2 size={16} />} color="emerald" />
                </div>

                {/* ============================================================
                    PERIOD COMPARISON — 30 vs 30
                    ============================================================ */}
                <ProCard title="Ce mois vs le mois dernier" subtitle="Comparez vos résultats" icon={<Layers size={16} className="text-indigo-500" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ComparisonCell
                            label="Demandes"
                            current={stats.requests_last_30}
                            previous={stats.requests_prev_30}
                        />
                        <ComparisonCell
                            label="Taux de réponse"
                            current={stats.response_rate_last_30}
                            previous={stats.response_rate_prev_30}
                            unit="%"
                        />
                        <ComparisonCell
                            label="Complétés"
                            current={stats.completed_total}
                            previous={null}
                            hideArrow
                        />
                    </div>
                </ProCard>

                {/* ============================================================
                    CONVERSION FUNNEL + RESPONSE TIME
                    ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Funnel — 3 cols */}
                    <div className="lg:col-span-3">
                        <ProCard title="Résultat de vos envois" subtitle="Que deviennent vos demandes ?" icon={<Filter size={16} className="text-indigo-500" />}>
                            <ConversionFunnel funnel={funnel} />
                        </ProCard>
                    </div>

                    {/* Response Time — 2 cols */}
                    <div className="lg:col-span-2">
                        <ProCard title="Temps de réponse" subtitle="Distribution par tranche" icon={<Timer size={16} className="text-violet-500" />}>
                            <ResponseBuckets buckets={responseBuckets} total={bucketTotal} />
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Par canal</p>
                                <div className="space-y-2">
                                    {['email', 'sms', 'qr'].map(ch => (
                                        <div key={ch} className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-600 uppercase text-xs">{ch}</span>
                                            <span className="font-bold text-gray-900">{responseTimeByChannel?.[ch] ? formatDuration(responseTimeByChannel[ch]) : '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ProCard>
                    </div>
                </div>

                {/* ============================================================
                    30-DAY ACTIVITY — Simple bars
                    ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ProCard
                            title="Feedbacks reçus"
                            subtitle="Nombre de réponses par jour — 30 derniers jours"
                            icon={<BarChart3 size={16} className="text-indigo-500" />}
                        >
                            <SimpleBarChart data={trend || []} />
                        </ProCard>
                    </div>
                    <div>
                        <ProCard
                            title="Évolution de la note"
                            subtitle="Note moyenne par jour"
                            icon={<Star size={16} className="text-amber-500" />}
                        >
                            <RatingDots data={trend || []} />
                        </ProCard>
                    </div>
                </div>

                {/* ============================================================
                    RATING & SENTIMENT DEEP DIVE
                    ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rating Distribution */}
                    <ProCard title="Distribution des notes" subtitle={`${totalRatings} avis collectés`} icon={<Star size={16} className="text-amber-500" />}>
                        <RatingBars ratings={ratingDistribution} total={totalRatings} />
                        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                            <SentimentPill label="Positif" count={stats.positive_count} pct={stats.feedbacks_total > 0 ? Math.round((stats.positive_count / stats.feedbacks_total) * 100) : 0} color="emerald" />
                            <SentimentPill label="Neutre" count={stats.neutral_count} pct={stats.feedbacks_total > 0 ? Math.round((stats.neutral_count / stats.feedbacks_total) * 100) : 0} color="slate" />
                            <SentimentPill label="Négatif" count={stats.negative_count} pct={stats.feedbacks_total > 0 ? Math.round((stats.negative_count / stats.feedbacks_total) * 100) : 0} color="rose" />
                        </div>
                    </ProCard>

                    {/* Channel Performance */}
                    <ProCard title="Performance par canal" subtitle="Volume, conversion, efficacité" icon={<Send size={16} className="text-indigo-500" />}>
                        <div className="space-y-4">
                            {['email', 'sms', 'qr'].map(ch => (
                                <ChannelCard
                                    key={ch}
                                    channel={ch}
                                    data={channelPerformance?.[ch]}
                                    responseTime={responseTimeByChannel?.[ch]}
                                    total={channelTotal}
                                    count={channels?.[ch] || 0}
                                />
                            ))}
                        </div>
                    </ProCard>
                </div>

                {/* ============================================================
                    BEHAVIORAL PATTERNS — Heatmaps (PRO DIFFERENTIATOR)
                    ============================================================ */}
                <ProCard
                    title="Meilleurs moments pour envoyer"
                    subtitle="Découvrez quand vos clients répondent le plus"
                    icon={<Calendar size={16} className="text-[#FF6F61]" />}
                    proBadge
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Weekday Heatmap */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Par jour de la semaine</p>
                            <WeekdayHeatmap data={weekdayDistribution} />
                            {bestDay && (
                                <div className="mt-3 flex items-center gap-2 text-xs">
                                    <Zap size={12} className="text-[#FF6F61]" />
                                    <span className="text-gray-600">Meilleur jour: <strong className="text-gray-900">{bestDay.name}</strong> ({bestDay.count} demandes)</span>
                                </div>
                            )}
                        </div>

                        {/* Time Slots */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Par moment de la journée</p>
                            <TimeSlotsChart slots={timeSlots} />
                            {bestSlot && (
                                <div className="mt-3 flex items-center gap-2 text-xs">
                                    <Zap size={12} className="text-[#FF6F61]" />
                                    <span className="text-gray-600">Meilleur créneau: <strong className="text-gray-900">{bestSlot.emoji} {bestSlot.label}</strong> ({bestSlot.count} réponses)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </ProCard>

                {/* ============================================================
                    KEY INSIGHTS — Smart Summary
                    ============================================================ */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={16} className="text-[#FF6F61]" />
                        <h3 className="text-sm font-bold text-gray-900">Insights clés</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <InsightCard
                            title="Volume"
                            text={requestsDelta >= 0 ? `+${requestsDelta} demandes vs période précédente` : `${requestsDelta} demandes vs période précédente`}
                            variant={requestsDelta >= 0 ? 'positive' : 'negative'}
                        />
                        <InsightCard
                            title="Conversion"
                            text={`${stats.response_rate}% de taux de réponse global`}
                            variant={stats.response_rate >= 50 ? 'positive' : 'warning'}
                        />
                        <InsightCard
                            title="Qualité"
                            text={stats.avg_rating ? `Note moyenne de ${stats.avg_rating}/5` : 'Pas encore de notes'}
                            variant={stats.avg_rating >= 4 ? 'positive' : stats.avg_rating >= 3 ? 'warning' : 'negative'}
                        />
                        <InsightCard
                            title="Rapidité"
                            text={stats.avg_response_hours ? `Réponse en ${formatDuration(stats.avg_response_hours)} en moyenne` : 'Aucune donnée'}
                            variant={stats.avg_response_hours && stats.avg_response_hours <= 24 ? 'positive' : 'warning'}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


/* ================================================================
   HELPERS
   ================================================================ */

function formatDuration(hours) {
    if (hours === null || hours === undefined) return '—';
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${Math.round(hours)}h`;
    const d = (hours / 24).toFixed(1);
    return `${d}j`;
}


/* ================================================================
   SHARED COMPONENTS
   ================================================================ */

/* ---------- Pro Card Wrapper ---------- */
function ProCard({ title, subtitle, icon, children, proBadge }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
                        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {proBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] text-[10px] font-bold uppercase tracking-wider">
                        <Shield size={10} /> Pro
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

/* ---------- Metric Card (KPI) ---------- */
function MetricCard({ label, value, delta, icon, color, stars }) {
    const colors = {
        slate:   { bg: 'bg-slate-50',   text: 'text-slate-600',   accent: 'bg-slate-500' },
        indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  accent: 'bg-indigo-500' },
        amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   accent: 'bg-amber-500' },
        feedora: { bg: 'bg-red-50',     text: 'text-[#FF6F61]',   accent: 'bg-[#FF6F61]' },
        violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  accent: 'bg-violet-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'bg-emerald-500' },
    };
    const c = colors[color] || colors.slate;
    const hasDelta = delta !== undefined && delta !== null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.accent} opacity-50`} />
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.text} mb-3`}>
                {icon}
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            {stars && (
                <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= Math.round(stars) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}
                </div>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                {hasDelta && (
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {delta >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ---------- Comparison Cell ---------- */
function ComparisonCell({ label, current, previous, unit = '', hideArrow }) {
    const delta = current !== null && previous !== null ? current - previous : null;
    const pctChange = previous && previous > 0 && delta !== null ? Math.round((delta / previous) * 100) : null;

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-extrabold text-gray-900">{current ?? '—'}{unit}</span>
                {previous !== null && (
                    <span className="text-xs text-gray-400 mb-1">vs {previous}{unit}</span>
                )}
            </div>
            {!hideArrow && delta !== null && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {delta > 0 ? '+' : ''}{delta}{unit}
                    {pctChange !== null && <span className="text-gray-400 font-normal ml-1">({pctChange > 0 ? '+' : ''}{pctChange}%)</span>}
                </div>
            )}
        </div>
    );
}

/* ---------- Conversion Funnel ---------- */
function ConversionFunnel({ funnel }) {
    const { total, completed, failed, pending } = funnel;

    const steps = [
        { label: 'Envoyées', count: total, color: 'bg-indigo-500', pct: 100 },
        { label: 'En attente', count: pending, color: 'bg-amber-400', pct: total > 0 ? Math.round((pending / total) * 100) : 0 },
        { label: 'Complétées', count: completed, color: 'bg-emerald-500', pct: total > 0 ? Math.round((completed / total) * 100) : 0 },
        { label: 'Échouées', count: failed, color: 'bg-rose-400', pct: total > 0 ? Math.round((failed / total) * 100) : 0 },
    ];

    const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const dropOff = total > 0 ? Math.round(((total - completed) / total) * 100) : 0;

    return (
        <div>
            {/* Visual funnel */}
            <div className="relative space-y-2">
                {steps.map((step, i) => {
                    const width = i === 0 ? 100 : Math.max(8, step.pct);
                    return (
                        <div key={step.label} className="flex items-center gap-3">
                            <div className="w-24 text-right">
                                <p className="text-xs font-medium text-gray-600">{step.label}</p>
                            </div>
                            <div className="flex-1 relative">
                                <div
                                    className={`h-9 ${step.color} rounded-lg transition-all duration-500 flex items-center px-3`}
                                    style={{ width: `${width}%`, opacity: i === 0 ? 1 : 0.85 }}
                                >
                                    <span className="text-white text-xs font-bold">{step.count}</span>
                                </div>
                            </div>
                            <div className="w-12 text-right">
                                <span className="text-xs font-semibold text-gray-400">{step.pct}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Funnel metrics */}
            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold text-emerald-700">{conversionRate}%</p>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Ont répondu</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-extrabold text-rose-700">{dropOff}%</p>
                    <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Sans réponse</p>
                </div>
            </div>
        </div>
    );
}

/* ---------- Response Buckets ---------- */
function ResponseBuckets({ buckets, total }) {
    const entries = Object.entries(buckets || {});
    const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-400'];

    return (
        <div className="space-y-3">
            {entries.map(([label, value], i) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                    <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <span className="text-xs text-gray-500">{value} <span className="text-gray-300">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${colors[i]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ---------- Simple Bar Chart (30 days) ---------- */
function SimpleBarChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Aucune donnée disponible</div>;
    }

    const max = Math.max(...data.map(d => d.completed || 0), 1);
    const total = data.reduce((s, d) => s + (d.completed || 0), 0);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-extrabold text-gray-900">{total}</span>
                <span className="text-sm text-gray-400">réponses au total</span>
            </div>
            <div className="flex items-end gap-[3px] h-36">
                {data.map((d, i) => {
                    const h = Math.max(3, ((d.completed || 0) / max) * 100);
                    const isToday = i === data.length - 1;
                    return (
                        <div key={i} className="flex-1 group relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}: {d.completed || 0} réponse{(d.completed || 0) !== 1 ? 's' : ''}
                            </div>
                            <div
                                className={`w-full rounded-t transition-all duration-300 group-hover:opacity-75 ${isToday ? 'bg-[#FF6F61]' : 'bg-indigo-400'}`}
                                style={{ height: `${h}%`, minHeight: '3px' }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400">{data[0]?.date ? new Date(data[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</span>
                <span className="text-[10px] text-gray-400">Aujourd'hui</span>
            </div>
        </div>
    );
}

/* ---------- Rating Dots (simple daily rating) ---------- */
function RatingDots({ data }) {
    const rated = data.filter(d => d.avg_rating);
    if (rated.length === 0) {
        return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Pas encore de notes</div>;
    }

    const avgOverall = rated.reduce((s, d) => s + d.avg_rating, 0) / rated.length;

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-extrabold text-gray-900">{avgOverall.toFixed(1)}</span>
                <span className="text-sm text-gray-400">/5 en moyenne</span>
            </div>
            <div className="flex items-end gap-[3px] h-36">
                {data.map((d, i) => {
                    if (!d.avg_rating) {
                        return <div key={i} className="flex-1 flex items-end justify-center"><div className="w-full h-[3px] bg-gray-100 rounded" /></div>;
                    }
                    const h = (d.avg_rating / 5) * 100;
                    const color = d.avg_rating >= 4 ? 'bg-emerald-400' : d.avg_rating >= 3 ? 'bg-amber-400' : 'bg-rose-400';
                    return (
                        <div key={i} className="flex-1 group relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}: {d.avg_rating}/5
                            </div>
                            <div className={`w-full rounded-t transition-all duration-300 group-hover:opacity-75 ${color}`} style={{ height: `${h}%`, minHeight: '3px' }} />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400">{data[0]?.date ? new Date(data[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</span>
                <span className="text-[10px] text-gray-400">Aujourd'hui</span>
            </div>
            <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400" /> 4-5★</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> 3★</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-400" /> 1-2★</span>
            </div>
        </div>
    );
}

/* ---------- Rating Bars ---------- */
function RatingBars({ ratings, total }) {
    const bars = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: ratings?.[star] || 0,
        pct: Math.round(((ratings?.[star] || 0) / total) * 100),
    }));

    const barColors = { 5: 'bg-emerald-500', 4: 'bg-emerald-400', 3: 'bg-amber-400', 2: 'bg-orange-400', 1: 'bg-rose-500' };

    return (
        <div className="space-y-2.5">
            {bars.map(b => (
                <div key={b.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 justify-end">
                        <span className="text-sm font-semibold text-gray-700">{b.star}</span>
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColors[b.star]} transition-all duration-500`} style={{ width: `${b.pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-20 text-right">{b.count} ({b.pct}%)</span>
                </div>
            ))}
        </div>
    );
}

/* ---------- Sentiment Pill ---------- */
function SentimentPill({ label, count, pct, color }) {
    const styles = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        slate:   'bg-slate-50 text-slate-700 border-slate-200',
        rose:    'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
        <div className={`rounded-xl border p-3 text-center ${styles[color]}`}>
            <p className="text-lg font-extrabold">{count}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">{label} ({pct}%)</p>
        </div>
    );
}

/* ---------- Channel Card ---------- */
function ChannelCard({ channel, data, responseTime, total, count }) {
    const rate = data?.rate ?? 0;
    const icons = { email: Mail, sms: Smartphone, qr: QrCode };
    const channelColors = { email: '#6366f1', sms: '#f59e0b', qr: '#FF6F61' };
    const Icon = icons[channel] || Mail;
    const color = channelColors[channel] || '#6366f1';
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900 uppercase">{channel}</span>
                    <span className="text-xs text-gray-400">{pct}% du volume</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <span className="text-gray-400">Volume</span>
                        <p className="font-bold text-gray-900">{data?.total ?? 0}</p>
                    </div>
                    <div>
                        <span className="text-gray-400">Conversion</span>
                        <p className="font-bold text-gray-900">{rate}%</p>
                    </div>
                    <div>
                        <span className="text-gray-400">Temps moy.</span>
                        <p className="font-bold text-gray-900">{responseTime ? formatDuration(responseTime) : '—'}</p>
                    </div>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden mt-2">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, backgroundColor: color }} />
                </div>
            </div>
        </div>
    );
}

/* ---------- Weekday Heatmap ---------- */
function WeekdayHeatmap({ data }) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const max = Math.max(...(data || [0]), 1);

    return (
        <div className="grid grid-cols-7 gap-2">
            {(data || []).map((value, idx) => {
                const intensity = value / max;
                return (
                    <div key={idx} className="text-center group relative">
                        <div
                            className="h-12 rounded-lg transition-all duration-300 flex items-center justify-center cursor-default"
                            style={{ backgroundColor: `rgba(99, 102, 241, ${0.08 + intensity * 0.82})` }}
                        >
                            <span className={`text-xs font-bold ${intensity > 0.5 ? 'text-white' : 'text-indigo-600'}`}>
                                {value}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 mt-1 block">{days[idx]}</span>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {days[idx]}: {value} demandes
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ---------- Time Slots Chart ---------- */
function TimeSlotsChart({ slots }) {
    if (!slots || slots.length === 0) {
        return <div className="text-sm text-gray-400">Aucune donnée</div>;
    }

    return (
        <div className="space-y-3">
            {slots.map(slot => (
                <div key={slot.label} className="flex items-center gap-3">
                    <div className="w-28 flex items-center gap-2">
                        <span className="text-base">{slot.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{slot.label}</span>
                    </div>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${slot.pct}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{slot.count}</span>
                </div>
            ))}
        </div>
    );
}

/* ---------- Insight Card ---------- */
function InsightCard({ title, text, variant = 'positive' }) {
    const styles = {
        positive: 'border-emerald-200 bg-emerald-50/50',
        warning:  'border-amber-200 bg-amber-50/50',
        negative: 'border-rose-200 bg-rose-50/50',
    };
    const iconStyles = {
        positive: <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />,
        warning:  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />,
        negative: <XCircle size={14} className="text-rose-500 flex-shrink-0" />,
    };

    return (
        <div className={`rounded-xl border p-3 ${styles[variant]}`}>
            <div className="flex items-start gap-2">
                {iconStyles[variant]}
                <div>
                    <p className="text-xs font-bold text-gray-700">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{text}</p>
                </div>
            </div>
        </div>
    );
}
