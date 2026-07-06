import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

function formatNumber(value = 0) {
    return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function formatPercent(value = 0) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function formatDuration(hours) {
    if (hours === null || hours === undefined) return '—';
    const h = Number(hours || 0);
    if (h < 1) return `${Math.round(h * 60)} min`;
    if (h < 24) return `${h.toFixed(1)} h`;
    return `${(h / 24).toFixed(1)} j`;
}

function periodLabel(days) {
    if (days === 7) return '7 jours';
    if (days === 30) return '30 jours';
    if (days === 90) return '90 jours';
    return '12 mois';
}

export default function AdminAnalytics({
    stats,
    trend,
    channels,
    channelPerformance,
    responseBuckets,
    ratingDistribution,
    responseTimeByChannel,
    weekdayDistribution,
    hourDistribution,
    sectorPerformance,
    topCompanies,
    riskCompanies,
    replyMix,
    languageDistribution,
}) {
    const requestDelta = (stats?.requests_total || 0) - (stats?.requests_prev || 0);
    const responseDelta = (stats?.response_rate || 0) - (stats?.response_rate_prev || 0);

    const maxTrendValue = useMemo(() => {
        return Math.max(1, ...(trend || []).flatMap((item) => [item.requests || 0, item.feedbacks || 0]));
    }, [trend]);

    const totalRatings = useMemo(() => {
        return Object.values(ratingDistribution || {}).reduce((sum, val) => sum + Number(val || 0), 0);
    }, [ratingDistribution]);

    const totalRequestsByChannel = (channels?.email || 0) + (channels?.sms || 0) + (channels?.qr || 0);

    const bestWeekday = useMemo(() => {
        const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const values = weekdayDistribution || [];
        if (!values.length) return null;
        let index = 0;
        values.forEach((value, i) => {
            if (value > values[index]) index = i;
        });
        return { label: labels[index], value: values[index] };
    }, [weekdayDistribution]);

    const bestHour = useMemo(() => {
        const values = hourDistribution || [];
        if (!values.length) return null;
        let index = 0;
        values.forEach((value, i) => {
            if (value > values[index]) index = i;
        });
        return { label: `${index}h`, value: values[index] };
    }, [hourDistribution]);

    const setDays = (days) => {
        router.get(route('admin.analytics'), { days }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AdminLayout header="Analytique">
            <Head title="Admin - Analytique" />

            <div className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="rounded-2xl bg-gradient-to-r from-feedora-600 to-feedora-500 shadow-lg overflow-hidden border border-feedora-500">
                        <div className="p-6 text-white">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                                        Feedora Data Intelligence
                                    </div>
                                    <h1 className="mt-3 text-2xl sm:text-3xl font-bold">Platform Analytics</h1>
                                    <p className="mt-2 text-sm text-feedora-50/90 max-w-2xl">
                                        Vision consolidée des volumes, performances d’envoi, satisfaction, automatisation IA et zones de risque sur l’ensemble de la plateforme.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {[7, 30, 90, 365].map((days) => (
                                        <button
                                            key={days}
                                            type="button"
                                            onClick={() => setDays(days)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                                stats?.days === days
                                                    ? 'bg-white text-feedora-600 border-white'
                                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                            }`}
                                        >
                                            {periodLabel(days)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                        <KpiCard label="Demandes" value={formatNumber(stats?.requests_total)} hint={`${requestDelta >= 0 ? '+' : ''}${formatNumber(requestDelta)} vs période précédente`} color="from-slate-600 to-slate-800" />
                        <KpiCard label="Taux de réponse" value={formatPercent(stats?.response_rate)} hint={`${responseDelta >= 0 ? '+' : ''}${responseDelta.toFixed(1)} pts`} color="from-blue-500 to-indigo-600" />
                        <KpiCard label="Feedbacks reçus" value={formatNumber(stats?.feedbacks_total)} hint={`${formatNumber(stats?.completed_total)} complétés`} color="from-feedora-500 to-feedora-600" />
                        <KpiCard label="Note moyenne" value={stats?.avg_rating ? `${stats.avg_rating}/5` : '—'} hint={`NPS ${stats?.nps ?? 0}`} color="from-amber-400 to-orange-500" />
                        <KpiCard label="Entreprises actives" value={formatNumber(stats?.active_companies)} hint={`${formatPercent(stats?.company_penetration_rate)} de pénétration`} color="from-emerald-500 to-emerald-600" />
                        <KpiCard label="Automatisation IA" value={formatPercent(stats?.ai_reply_rate)} hint={`${formatNumber(stats?.ai_replies)} réponses IA`} color="from-violet-500 to-fuchsia-600" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <SectionCard title="Tendance activité" subtitle={`Demandes et feedbacks sur ${periodLabel(stats?.days)}`}>
                            <div className="space-y-4">
                                <MiniTrendChart data={trend} maxValue={maxTrendValue} />
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <MetricBox label="Pending" value={formatNumber(stats?.pending_total)} />
                                    <MetricBox label="Failed" value={formatNumber(stats?.failed_total)} />
                                    <MetricBox label="Temps réponse" value={formatDuration(stats?.avg_response_hours)} />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Distribution des notes" subtitle={`${formatNumber(totalRatings)} avis analysés`}>
                            <div className="space-y-4">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = Number(ratingDistribution?.[star] || 0);
                                    const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                                    return (
                                        <div key={star}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{star}★</span>
                                                <span className="text-gray-500">{formatNumber(count)} ({pct.toFixed(1)}%)</span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-feedora-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionCard>

                        <SectionCard title="Délai de réponse" subtitle="Répartition des retours clients">
                            <div className="space-y-4">
                                {Object.entries(responseBuckets || {}).map(([label, value]) => {
                                    const total = Object.values(responseBuckets || {}).reduce((sum, current) => sum + Number(current || 0), 0);
                                    const pct = total > 0 ? (Number(value || 0) / total) * 100 : 0;
                                    return (
                                        <div key={label}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{label}</span>
                                                <span className="text-gray-500">{formatNumber(value)} ({pct.toFixed(1)}%)</span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-600" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                                    <MetricBox label="Coverage feedback" value={formatPercent(stats?.company_feedback_coverage_rate)} />
                                    <MetricBox label="Resolution rate" value={formatPercent(stats?.resolution_rate)} />
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard title="Performance par canal" subtitle="Volume, conversion et délai moyen">
                            <div className="space-y-4">
                                {['email', 'sms', 'qr'].map((channel) => {
                                    const row = channelPerformance?.[channel] || { total: 0, completed: 0, rate: 0 };
                                    const share = totalRequestsByChannel > 0 ? (Number(channels?.[channel] || 0) / totalRequestsByChannel) * 100 : 0;
                                    return (
                                        <div key={channel} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900 uppercase">{channel}</p>
                                                    <p className="text-xs text-gray-500">Part du volume: {share.toFixed(1)}%</p>
                                                </div>
                                                <span className="text-sm font-semibold text-feedora-600">{row.rate}%</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 text-sm">
                                                <MetricBox label="Demandes" value={formatNumber(row.total)} />
                                                <MetricBox label="Réponses" value={formatNumber(row.completed)} />
                                                <MetricBox label="Temps" value={formatDuration(responseTimeByChannel?.[channel])} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionCard>

                        <SectionCard title="Operations & automation" subtitle="Qualité de traitement de la plateforme">
                            <div className="grid grid-cols-2 gap-4">
                                <OpsCard label="Réponses IA" value={formatNumber(replyMix?.ai)} hint={`${formatPercent(replyMix?.ai_rate)} du total`} />
                                <OpsCard label="Réponses admin" value={formatNumber(replyMix?.admin)} hint={`${formatNumber(stats?.replies_total)} réponses totales`} />
                                <OpsCard label="Avis publics" value={formatPercent(stats?.public_share_rate)} hint={`${formatNumber(stats?.feedbacks_total)} feedbacks`} />
                                <OpsCard label="Reminders envoyés" value={formatNumber(stats?.reminders_sent)} hint="sur la période" />
                                <OpsCard label="Entreprises à risque" value={formatNumber(stats?.at_risk_companies)} hint="faible note / faible conversion" />
                                <OpsCard label="Négatifs" value={formatNumber(stats?.negative_count)} hint={`${formatPercent(100 - (stats?.positive_rate || 0))} non positifs`} />
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionCard title="Secteurs les plus performants" subtitle="Vue consolidée par vertical métier">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100">
                                            <th className="py-3">Secteur</th>
                                            <th className="py-3">Entreprises</th>
                                            <th className="py-3">Réponse</th>
                                            <th className="py-3 text-right">Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(sectorPerformance || []).map((row) => (
                                            <tr key={row.sector} className="border-b border-gray-50">
                                                <td className="py-3">
                                                    <div className="font-semibold text-gray-900">{row.sector}</div>
                                                    <div className="text-xs text-gray-500">{formatNumber(row.feedbacks_count)} feedbacks</div>
                                                </td>
                                                <td className="py-3 text-gray-700">{formatNumber(row.companies_count)}</td>
                                                <td className="py-3 text-gray-700">{row.response_rate}%</td>
                                                <td className="py-3 text-right font-semibold text-gray-900">{row.avg_rating ? `${row.avg_rating}/5` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>

                        <SectionCard title="Top entreprises" subtitle="Meilleurs moteurs de feedbacks sur la période">
                            <div className="space-y-3">
                                {(topCompanies || []).map((row, index) => (
                                    <div key={row.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-feedora-400 to-feedora-600 text-white font-bold flex items-center justify-center">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{row.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{row.sector || 'Non spécifié'}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="font-semibold text-gray-900">{row.avg_rating ? `${row.avg_rating}/5` : '—'}</p>
                                            <p className="text-gray-500">{row.response_rate}% réponse</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <SectionCard title="Comptes à surveiller" subtitle="Signal faible de performance récente" className="lg:col-span-2">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100">
                                            <th className="py-3">Entreprise</th>
                                            <th className="py-3">Secteur</th>
                                            <th className="py-3">Réponse</th>
                                            <th className="py-3">Note</th>
                                            <th className="py-3 text-right">Risk score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(riskCompanies || []).map((row) => (
                                            <tr key={row.id} className="border-b border-gray-50">
                                                <td className="py-3 font-semibold text-gray-900">{row.name}</td>
                                                <td className="py-3 text-gray-600">{row.sector || '—'}</td>
                                                <td className="py-3 text-gray-600">{row.response_rate}%</td>
                                                <td className="py-3 text-gray-600">{row.avg_rating ? `${row.avg_rating}/5` : '—'}</td>
                                                <td className="py-3 text-right font-semibold text-rose-600">{row.risk_score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>

                        <SectionCard title="Patterns temporels" subtitle="Quand les demandes performent le plus">
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Jour le plus actif</p>
                                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                                        <p className="text-2xl font-bold text-gray-900">{bestWeekday?.label || '—'}</p>
                                        <p className="text-sm text-gray-500 mt-1">{formatNumber(bestWeekday?.value || 0)} demandes</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Heure dominante</p>
                                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                                        <p className="text-2xl font-bold text-gray-900">{bestHour?.label || '—'}</p>
                                        <p className="text-sm text-gray-500 mt-1">{formatNumber(bestHour?.value || 0)} demandes</p>
                                    </div>
                                </div>

                                <PatternBars title="Semaine" values={weekdayDistribution} labels={['D', 'L', 'M', 'M', 'J', 'V', 'S']} />
                                <PatternBars title="Heures" values={hourDistribution} labels={Array.from({ length: 24 }, (_, i) => `${i}`)} compact />
                            </div>
                        </SectionCard>
                    </div>

                    <SectionCard title="Langues détectées" subtitle="Répartition des retours clients multilingues">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {(languageDistribution || []).length > 0 ? (languageDistribution || []).map((row) => (
                                <div key={row.language} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Langue</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{row.language}</p>
                                    <p className="text-sm text-gray-500 mt-1">{formatNumber(row.count)} feedbacks</p>
                                </div>
                            )) : (
                                <div className="text-sm text-gray-500">Aucune langue détectée sur la période.</div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AdminLayout>
    );
}

function SectionCard({ title, subtitle, children, className = '' }) {
    return (
        <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
            </div>
            {children}
        </div>
    );
}

function KpiCard({ label, value, hint, color }) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                <p className="text-xs text-gray-500 mt-2">{hint}</p>
            </div>
            <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
        </div>
    );
}

function MetricBox({ label, value }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
        </div>
    );
}

function OpsCard({ label, value, hint }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-2">{hint}</p>
        </div>
    );
}

function MiniTrendChart({ data = [], maxValue = 1 }) {
    return (
        <div className="grid grid-cols-12 sm:grid-cols-15 lg:grid-cols-10 xl:grid-cols-12 gap-2 items-end h-56">
            {data.map((item) => {
                const reqHeight = ((item.requests || 0) / maxValue) * 100;
                const fbHeight = ((item.feedbacks || 0) / maxValue) * 100;

                return (
                    <div key={item.date} className="h-full flex flex-col justify-end gap-1">
                        <div className="flex-1 flex items-end justify-center gap-1">
                            <div className="w-2 sm:w-3 rounded-t bg-gray-300" style={{ height: `${Math.max(reqHeight, 2)}%` }} title={`Demandes: ${item.requests}`} />
                            <div className="w-2 sm:w-3 rounded-t bg-feedora-500" style={{ height: `${Math.max(fbHeight, 2)}%` }} title={`Feedbacks: ${item.feedbacks}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function PatternBars({ title, values = [], labels = [], compact = false }) {
    const max = Math.max(1, ...(values || [0]));

    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
            <div className={`grid ${compact ? 'grid-cols-12' : 'grid-cols-7'} gap-2 items-end h-28`}>
                {(values || []).map((value, index) => (
                    <div key={`${title}-${index}`} className="h-full flex flex-col justify-end items-center gap-2">
                        <div className="w-full rounded-t bg-gradient-to-t from-feedora-500 to-feedora-300" style={{ height: `${Math.max((Number(value || 0) / max) * 100, 4)}%` }} />
                        <span className="text-[10px] text-gray-500">{labels[index]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
