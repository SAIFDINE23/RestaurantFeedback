import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    TrendingUp,
    TrendingDown,
    MessageCircle,
    Target,
    Send,
    Eye,
    Bell,
    ArrowRight,
    Zap,
    Star,
    Clock,
    Users,
    BarChart3,
    Activity,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Mail,
    Smartphone,
    MessageSquare,
    QrCode,
} from 'lucide-react';
import { useMemo } from 'react';

/* ================================================================
   FEEDORA DASHBOARD — Professional SaaS Executive View
   ================================================================ */

export default function Dashboard({ auth, stats, alerts, trends, goals, feedbackTrend }) {

    // -------- Computed values --------
    const totalFeedbacks = stats.positive_count + stats.neutral_count + stats.negative_count;
    const sentimentData = useMemo(() => {
        const total = totalFeedbacks || 1;
        return {
            positive: { count: stats.positive_count, pct: Math.round((stats.positive_count / total) * 100) },
            neutral:  { count: stats.neutral_count,  pct: Math.round((stats.neutral_count / total) * 100)  },
            negative: { count: stats.negative_count, pct: Math.round((stats.negative_count / total) * 100) },
        };
    }, [stats]);

    const channelTotal = (stats.channel_email || 0) + (stats.channel_sms || 0) + (stats.channel_whatsapp || 0) + (stats.channel_qr || 0) || 1;
    const channels = [
        { key: 'email',    label: 'Email',    icon: Mail,          count: stats.channel_email || 0,    color: '#6366f1' },
        { key: 'sms',      label: 'SMS',      icon: Smartphone,    count: stats.channel_sms || 0,      color: '#f59e0b' },
        { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, count: stats.channel_whatsapp || 0, color: '#22c55e' },
        { key: 'qr',       label: 'QR Code',  icon: QrCode,        count: stats.channel_qr || 0,       color: '#FF6F61' },
    ];

    const sparkData = useMemo(() => {
        if (!feedbackTrend || feedbackTrend.length === 0) return [];
        return feedbackTrend.map(d => d.count);
    }, [feedbackTrend]);

    const criticalCount = alerts.critical_feedbacks?.length || 0;
    const overdueCount = alerts.overdue_feedbacks?.length || 0;
    const hasAlerts = criticalCount > 0 || overdueCount > 0 || (alerts.sms_credits && alerts.sms_credits.is_low);

    const greetingName = auth.user?.name?.split(' ')[0] || 'Manager';

    return (
        <AuthenticatedLayout user={auth.user} header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">

                {/* ============================================================
                    HERO SECTION — Score + Greeting + Quick Actions
                    ============================================================ */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                    {/* Decorative blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FF6F61]/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/[0.03] to-transparent rounded-full" />
                    </div>

                    <div className="relative px-6 py-8 sm:px-8 lg:px-10">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            {/* Left — Greeting */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-400 mb-1">Bienvenue, {greetingName} 👋</p>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    Vue d'ensemble
                                </h1>
                                <p className="text-slate-400 text-sm mt-2 max-w-lg">
                                    Suivez vos performances en temps réel et prenez les bonnes décisions pour améliorer l'expérience client.
                                </p>
                            </div>

                            {/* Right — Score badge + Quick Actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Health Score */}
                                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/10">
                                    <ScoreRing value={stats.response_rate} size={44} />
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Taux réponse</p>
                                        <p className="text-lg font-bold text-white">{stats.response_rate}%</p>
                                    </div>
                                </div>

                                {/* Quick actions */}
                                <div className="flex gap-2">
                                    <HeroPill href={route('customers.index')} icon={<Send size={14} />} label="Collecter" />
                                    <HeroPill href={route('feedbacks.index')} icon={<MessageCircle size={14} />} label="Feedbacks" />
                                    <HeroPill href={route('analytics')} icon={<BarChart3 size={14} />} label="Analytics" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================================
                    ALERTS BANNER (conditionally rendered)
                    ============================================================ */}
                {hasAlerts && <AlertsBanner alerts={alerts} criticalCount={criticalCount} overdueCount={overdueCount} />}

                {/* ============================================================
                    KPI CARDS ROW
                    ============================================================ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Taux de réponse"
                        value={`${stats.response_rate}%`}
                        subtitle={`${stats.completed_last_7d || 0} cette semaine`}
                        icon={<Activity size={18} />}
                        trend={trends.response_rate}
                        color="indigo"
                        sparkData={sparkData}
                    />
                    <KPICard
                        title="Satisfaction"
                        value={stats.avg_rating ? `${stats.avg_rating}` : '—'}
                        subtitle="note moyenne /5"
                        icon={<Star size={18} />}
                        trend={trends.satisfaction}
                        color="amber"
                        showStars={stats.avg_rating}
                    />
                    <KPICard
                        title="Temps moyen"
                        value={stats.avg_response_hours ? formatDuration(stats.avg_response_hours) : '—'}
                        subtitle="délai de réponse"
                        icon={<Clock size={18} />}
                        trend={null}
                        color="violet"
                    />
                    <KPICard
                        title="NPS"
                        value={stats.nps}
                        subtitle="Net Promoter Score"
                        icon={<Zap size={18} />}
                        trend={null}
                        color="feedora"
                        nps={stats.nps}
                    />
                </div>

                {/* ============================================================
                    MAIN GRID — Charts + Sentiment
                    ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ---- Feedback Trend (14 days) — spans 2 cols ---- */}
                    <div className="lg:col-span-2">
                        <DashCard title="Activité des feedbacks" subtitle="14 derniers jours" icon={<BarChart3 size={18} className="text-indigo-500" />}>
                            <FeedbackChart data={feedbackTrend || []} />
                        </DashCard>
                    </div>

                    {/* ---- Sentiment Donut ---- */}
                    <div>
                        <DashCard title="Sentiment" subtitle={`${totalFeedbacks} avis analysés`} icon={<MessageCircle size={18} className="text-[#FF6F61]" />}>
                            <SentimentDonut data={sentimentData} total={totalFeedbacks} />
                        </DashCard>
                    </div>
                </div>

                {/* ============================================================
                    SECOND ROW — Goals + Channels
                    ============================================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ---- Goals ---- */}
                    <div className="lg:col-span-2">
                        <DashCard title="Objectifs du mois" subtitle="Progression vers vos cibles" icon={<Target size={18} className="text-indigo-500" />}>
                            <div className="space-y-5 mt-2">
                                <GoalBar
                                    label="Taux de réponse"
                                    current={goals.response_rate.current}
                                    target={goals.response_rate.target}
                                    unit="%"
                                    progress={goals.response_rate.progress}
                                    color="indigo"
                                />
                                <GoalBar
                                    label="Temps de réponse"
                                    current={goals.avg_response_time.current}
                                    target={goals.avg_response_time.target}
                                    unit=" jours"
                                    progress={goals.avg_response_time.progress}
                                    color="violet"
                                    invert
                                />
                                <GoalBar
                                    label="Satisfaction client"
                                    current={goals.satisfaction.current}
                                    target={goals.satisfaction.target}
                                    unit="/5"
                                    progress={goals.satisfaction.progress}
                                    color="amber"
                                />
                            </div>
                        </DashCard>
                    </div>

                    {/* ---- Channels ---- */}
                    <div>
                        <DashCard title="Canaux" subtitle="Répartition des envois" icon={<Send size={18} className="text-indigo-500" />}>
                            <div className="space-y-4 mt-1">
                                {channels.map(ch => (
                                    <ChannelRow key={ch.key} channel={ch} total={channelTotal} />
                                ))}
                            </div>
                        </DashCard>
                    </div>
                </div>

                {/* ============================================================
                    TRENDS COMPARISON — Compact
                    ============================================================ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <TrendCard
                        label="Demandes envoyées"
                        value={stats.requests_last_7d}
                        delta={trends.requests}
                        icon={<Send size={16} />}
                    />
                    <TrendCard
                        label="Taux de réponse"
                        value={`${stats.response_rate_7d}%`}
                        delta={trends.response_rate}
                        icon={<Activity size={16} />}
                    />
                    <TrendCard
                        label="Satisfaction"
                        value={stats.avg_rating ? `${stats.avg_rating}/5` : '—'}
                        delta={trends.satisfaction}
                        icon={<Star size={16} />}
                    />
                </div>

                {/* ============================================================
                    RATING DISTRIBUTION
                    ============================================================ */}
                <DashCard title="Distribution des notes" subtitle="Répartition par étoile" icon={<Star size={18} className="text-amber-500" />}>
                    <RatingDistribution ratings={stats.ratings} total={stats.feedbacks_completed || 1} />
                </DashCard>

                {/* ============================================================
                    BOTTOM CTA — Radar IA
                    ============================================================ */}
                <Link href={route('radar')} className="block group">
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#FF6F61] to-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-60" />
                        <div className="relative px-6 py-5 sm:px-8 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Zap size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Radar IA Pro</h3>
                                    <p className="text-white/80 text-sm">Analyse intelligente de vos feedbacks par l'IA</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}


/* ================================================================
   HELPER FUNCTIONS
   ================================================================ */

function formatDuration(hours) {
    if (hours === null || hours === undefined) return '—';
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = (hours / 24).toFixed(1);
    return `${days}j`;
}


/* ================================================================
   COMPONENTS
   ================================================================ */

/* ---------- Score Ring (Hero) ---------- */
function ScoreRing({ value, size = 44 }) {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(100, Math.max(0, value || 0));
    const offset = circ - (circ * pct) / 100;
    const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <svg width={size} height={size} className="flex-shrink-0">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
            <circle
                cx={size/2} cy={size/2} r={r}
                fill="none" stroke={color} strokeWidth={3}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`}
                className="transition-all duration-700"
            />
        </svg>
    );
}

/* ---------- Hero Pill Button ---------- */
function HeroPill({ href, icon, label }) {
    return (
        <Link href={href} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-sm border border-white/10 text-white text-xs font-medium transition-all duration-200">
            {icon}
            <span>{label}</span>
        </Link>
    );
}

/* ---------- Dash Card Wrapper ---------- */
function DashCard({ title, subtitle, icon, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

/* ---------- KPI Card ---------- */
function KPICard({ title, value, subtitle, icon, trend, color, sparkData, showStars, nps }) {
    const colorMap = {
        indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-100'  },
        amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100'   },
        violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100'  },
        feedora: { bg: 'bg-red-50',     text: 'text-[#FF6F61]',   ring: 'ring-red-100'     },
    };
    const c = colorMap[color] || colorMap.indigo;

    const trendUp = trend !== null && trend !== undefined && trend >= 0;
    const hasTrend = trend !== null && trend !== undefined;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 relative overflow-hidden group">
            {/* Subtle accent line */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${color === 'feedora' ? 'bg-[#FF6F61]' : color === 'indigo' ? 'bg-indigo-500' : color === 'amber' ? 'bg-amber-500' : 'bg-violet-500'} opacity-60`} />

            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.ring} ring-1 flex items-center justify-center ${c.text}`}>
                    {icon}
                </div>
                {hasTrend && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>

            {/* Star display for satisfaction */}
            {showStars && (
                <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= Math.round(showStars) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                    ))}
                </div>
            )}

            {/* NPS gauge */}
            {nps !== undefined && nps !== null && color === 'feedora' && (
                <div className="mt-2">
                    <NPSMiniGauge value={nps} />
                </div>
            )}

            {/* Mini sparkline */}
            {sparkData && sparkData.length > 0 && (
                <div className="mt-2 -mx-1">
                    <MiniSparkline data={sparkData} color={color === 'feedora' ? '#FF6F61' : color === 'indigo' ? '#6366f1' : color === 'amber' ? '#f59e0b' : '#8b5cf6'} />
                </div>
            )}

            <p className="text-[11px] text-gray-400 mt-2 font-medium uppercase tracking-wider">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
    );
}

/* ---------- Mini Sparkline ---------- */
function MiniSparkline({ data, color = '#6366f1', height = 28 }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const w = 100;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = height - (v / max) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${w},${height}`;
    const gradId = `spark-${color.replace('#','')}`;

    return (
        <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#${gradId})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ---------- NPS Mini Gauge ---------- */
function NPSMiniGauge({ value }) {
    const clamped = Math.max(-100, Math.min(100, value));
    const pct = ((clamped + 100) / 200) * 100;
    const gaugeColor = clamped >= 50 ? '#22c55e' : clamped >= 0 ? '#f59e0b' : '#ef4444';

    return (
        <div className="w-full">
            <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: gaugeColor }} />
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-300">-100</span>
                <span className="text-[9px] text-gray-300">+100</span>
            </div>
        </div>
    );
}

/* ---------- Feedback Chart (14 days) ---------- */
function FeedbackChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Aucune donnée disponible</div>;
    }

    const max = Math.max(...data.map(d => d.count), 1);

    return (
        <div>
            <div className="flex items-end gap-1 h-44">
                {data.map((d, i) => {
                    const h = Math.max(4, (d.count / max) * 100);
                    const isToday = i === data.length - 1;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {d.count} feedback{d.count !== 1 ? 's' : ''}
                            </div>
                            <div
                                className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 ${isToday ? 'bg-[#FF6F61]' : 'bg-indigo-400'}`}
                                style={{ height: `${h}%`, minHeight: '4px' }}
                            />
                        </div>
                    );
                })}
            </div>
            {/* X labels */}
            <div className="flex gap-1 mt-2">
                {data.map((d, i) => {
                    const date = new Date(d.date);
                    const label = date.toLocaleDateString('fr-FR', { day: 'numeric' });
                    const showLabel = i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2);
                    return (
                        <div key={i} className="flex-1 text-center">
                            <span className={`text-[10px] ${showLabel ? 'text-gray-400' : 'text-transparent'}`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- Sentiment Donut ---------- */
function SentimentDonut({ data, total }) {
    const r = 60;
    const circ = 2 * Math.PI * r;
    const size = 160;

    const segments = [
        { key: 'positive', color: '#22c55e', pct: data.positive.pct, label: 'Positif', count: data.positive.count },
        { key: 'neutral',  color: '#94a3b8', pct: data.neutral.pct,  label: 'Neutre',  count: data.neutral.count },
        { key: 'negative', color: '#ef4444', pct: data.negative.pct, label: 'Négatif', count: data.negative.count },
    ];

    let offset = 0;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
                    {segments.map(seg => {
                        const dash = (seg.pct / 100) * circ;
                        const gap = circ - dash;
                        const currentOffset = offset;
                        offset += dash;
                        return (
                            <circle
                                key={seg.key}
                                cx={size/2} cy={size/2} r={r}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth={14}
                                strokeDasharray={`${dash} ${gap}`}
                                strokeDashoffset={-currentOffset}
                                strokeLinecap="butt"
                                transform={`rotate(-90 ${size/2} ${size/2})`}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-extrabold text-gray-900">{total}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">avis</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 w-full justify-center">
                {segments.map(seg => (
                    <div key={seg.key} className="text-center">
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                            <span className="text-xs font-medium text-gray-600">{seg.label}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{seg.count}</p>
                        <p className="text-[10px] text-gray-400">{seg.pct}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Goal Bar ---------- */
function GoalBar({ label, current, target, unit, progress, color }) {
    const barColor = {
        indigo: 'bg-indigo-500',
        violet: 'bg-violet-500',
        amber: 'bg-amber-500',
    }[color] || 'bg-indigo-500';

    const bgColor = {
        indigo: 'bg-indigo-50',
        violet: 'bg-violet-50',
        amber: 'bg-amber-50',
    }[color] || 'bg-indigo-50';

    const achieved = progress >= 100;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                        {current !== null && current !== undefined ? `${current}${unit}` : '—'}
                    </span>
                    <span className="text-xs text-gray-400">/ {target}{unit}</span>
                    {achieved && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
            </div>
            <div className={`h-2.5 rounded-full ${bgColor} overflow-hidden`}>
                <div
                    className={`h-full rounded-full ${barColor} transition-all duration-700`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                />
            </div>
        </div>
    );
}

/* ---------- Channel Row ---------- */
function ChannelRow({ channel, total }) {
    const pct = Math.round((channel.count / total) * 100);
    const Icon = channel.icon;

    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${channel.color}15` }}>
                <Icon size={15} style={{ color: channel.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{channel.label}</span>
                    <span className="text-sm font-bold text-gray-900">{channel.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: channel.color }} />
                </div>
            </div>
            <span className="text-xs font-medium text-gray-400 w-10 text-right">{pct}%</span>
        </div>
    );
}

/* ---------- Trend Comparison Card ---------- */
function TrendCard({ label, value, delta, icon }) {
    const isPositive = delta !== null && delta !== undefined && delta >= 0;
    const hasDelta = delta !== null && delta !== undefined;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
            {hasDelta && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {delta > 0 ? '+' : ''}{delta}%
                </div>
            )}
        </div>
    );
}

/* ---------- Alerts Banner ---------- */
function AlertsBanner({ alerts, criticalCount, overdueCount }) {
    return (
        <div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 rounded-2xl border border-rose-200/60 p-5">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-rose-500" />
                <h3 className="text-sm font-bold text-gray-900">Actions requises</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {criticalCount > 0 && (
                    <AlertPill
                        icon={<XCircle size={16} />}
                        text={`${criticalCount} feedback${criticalCount > 1 ? 's' : ''} critique${criticalCount > 1 ? 's' : ''}`}
                        href={route('feedbacks.index')}
                        variant="danger"
                    />
                )}
                {overdueCount > 0 && (
                    <AlertPill
                        icon={<Clock size={16} />}
                        text={`${overdueCount} client${overdueCount > 1 ? 's' : ''} en attente`}
                        href={route('feedbacks.index')}
                        variant="warning"
                    />
                )}
                {alerts.sms_credits && alerts.sms_credits.is_low && (
                    <AlertPill
                        icon={<Smartphone size={16} />}
                        text={`${alerts.sms_credits.remaining} crédits SMS restants`}
                        href={route('subscription.index')}
                        variant={alerts.sms_credits.is_critical ? 'danger' : 'warning'}
                    />
                )}
            </div>
        </div>
    );
}

/* ---------- Alert Pill ---------- */
function AlertPill({ icon, text, href, variant = 'warning' }) {
    const styles = {
        danger:  'bg-white border-rose-200 text-rose-700 hover:bg-rose-50',
        warning: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50',
    };

    return (
        <Link href={href} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${styles[variant]}`}>
            {icon}
            <span className="flex-1">{text}</span>
            <ChevronRight size={14} className="opacity-40" />
        </Link>
    );
}

/* ---------- Rating Distribution ---------- */
function RatingDistribution({ ratings, total }) {
    const bars = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: ratings?.[star] || 0,
        pct: total > 0 ? Math.round(((ratings?.[star] || 0) / total) * 100) : 0,
    }));

    const barColors = {
        5: 'bg-emerald-500',
        4: 'bg-emerald-400',
        3: 'bg-amber-400',
        2: 'bg-orange-400',
        1: 'bg-rose-500',
    };

    return (
        <div className="space-y-2.5">
            {bars.map(b => (
                <div key={b.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 justify-end">
                        <span className="text-sm font-semibold text-gray-700">{b.star}</span>
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${barColors[b.star]} transition-all duration-500`}
                            style={{ width: `${b.pct}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-16 text-right">
                        {b.count} ({b.pct}%)
                    </span>
                </div>
            ))}
        </div>
    );
}
