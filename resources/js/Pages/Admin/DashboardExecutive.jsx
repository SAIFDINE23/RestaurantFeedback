import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DashboardExecutive({ stats, growthSeries, planMix, operationalHealth, focusAreas }) {
    const businessScore = useMemo(() => {
        const metrics = [
            Math.min(100, stats?.activeRate || 0),
            Math.min(100, (stats?.paidRate || 0) * 1.6),
            Math.min(100, stats?.responseRate || 0),
            Math.min(100, stats?.aiReplyRate || 0),
        ];

        return Math.round(metrics.reduce((sum, value) => sum + value, 0) / metrics.length);
    }, [stats]);

    const maxSeriesValue = useMemo(() => {
        return Math.max(
            1,
            ...(growthSeries || []).flatMap((item) => [item.companies || 0, item.requests || 0, item.feedbacks || 0])
        );
    }, [growthSeries]);

    return (
        <AdminLayout header="Dashboard">
            <Head title="Dashboard Admin" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-feedora-500 bg-gradient-to-r from-feedora-600 via-feedora-500 to-orange-500 shadow-xl">
                        <div className="p-6 text-white lg:p-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                                        Feedora Executive View
                                    </div>
                                    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                        Platform command center
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-feedora-50/90 sm:text-base">
                                        Une vue SaaS orientée business: croissance, monétisation, activation, adoption produit et santé opérationnelle.
                                    </p>
                                </div>

                                <div className="grid min-w-[280px] grid-cols-2 gap-4">
                                    <HeroStat label="Business score" value={`${businessScore}/100`} />
                                    <HeroStat label="MRR estimé" value={formatMoney(stats?.estimatedMrr || 0)} />
                                    <HeroStat label="Actifs" value={formatNumber(stats?.activeCompanies || 0)} />
                                    <HeroStat label="Payants actifs" value={formatNumber(stats?.paidActiveCompanies || 0)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <KpiCard
                            label="Croissance acquisition"
                            value={formatNumber(stats?.companiesLast30 || 0)}
                            hint={`${stats?.companyGrowthRate >= 0 ? '+' : ''}${stats?.companyGrowthRate || 0}% vs période précédente`}
                            color="from-blue-500 to-indigo-600"
                        />
                        <KpiCard
                            label="Adoption active"
                            value={formatPercent(stats?.activeRate || 0)}
                            hint={`${formatNumber(stats?.activeCompanies || 0)} / ${formatNumber(stats?.totalCompanies || 0)} comptes actifs`}
                            color="from-emerald-500 to-emerald-600"
                        />
                        <KpiCard
                            label="Conversion payante"
                            value={formatPercent(stats?.paidRate || 0)}
                            hint={`${formatNumber(stats?.paidCompanies || 0)} comptes payants`}
                            color="from-violet-500 to-fuchsia-600"
                        />
                        <KpiCard
                            label="Usage plateforme"
                            value={formatNumber(stats?.requestsLast30 || 0)}
                            hint={`${formatNumber(stats?.feedbacksLast30 || 0)} feedbacks • ${formatPercent(stats?.responseRate || 0)} response rate`}
                            color="from-feedora-500 to-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <SectionCard title="Growth engine" subtitle="Évolution business des 6 derniers mois" className="lg:col-span-2">
                            <div className="space-y-5">
                                <GrowthBars data={growthSeries} maxValue={maxSeriesValue} />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <MiniMetric label="Demandes 30j" value={formatNumber(stats?.requestsLast30 || 0)} />
                                    <MiniMetric label="Feedbacks 30j" value={formatNumber(stats?.feedbacksLast30 || 0)} />
                                    <MiniMetric label="Réponses totales" value={formatNumber(stats?.totalReplies || 0)} />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Immediate focus" subtitle="Les sujets à piloter maintenant">
                            <div className="space-y-3">
                                {(focusAreas || []).length > 0 ? (
                                    focusAreas.map((item, index) => (
                                        <div key={index} className={`rounded-xl border p-4 ${focusTone(item.tone)}`}>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="mt-1 text-sm leading-6">{item.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                                        Aucun signal critique pour le moment.
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SectionCard title="Revenue & monetization" subtitle="Monétisation de la base clients">
                            <div className="grid grid-cols-2 gap-4">
                                <MetricTile label="MRR estimé" value={formatMoney(stats?.estimatedMrr || 0)} />
                                <MetricTile label="Payants actifs" value={formatNumber(stats?.paidActiveCompanies || 0)} />
                                <MetricTile label="Comptes en essai" value={formatNumber(stats?.trialCompanies || 0)} />
                                <MetricTile label="Past due" value={formatNumber(stats?.pastDueCompanies || 0)} />
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-5">
                                <p className="mb-2 text-sm font-medium text-gray-700">Mix des plans</p>
                                <div className="space-y-3">
                                    {(planMix || []).map((plan) => (
                                        <div key={plan.slug}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-700">{plan.name}</span>
                                                <span className="text-gray-500">{formatNumber(plan.count)} ({plan.percentage}%)</span>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-feedora-400 to-feedora-600"
                                                    style={{ width: `${plan.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Product & ops health" subtitle="Qualité d’adoption et efficacité plateforme">
                            <div className="space-y-4">
                                {(operationalHealth || []).map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{item.label}</span>
                                            <span className="text-gray-500">
                                                {item.value}{item.unit} / cible {item.target}{item.unit}
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full ${item.value >= item.target ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-feedora-500'}`}
                                                style={{ width: `${Math.min(100, item.value)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                                    <MetricTile label="IA replies 30j" value={formatNumber(stats?.aiRepliesLast30 || 0)} />
                                    <MetricTile label="Usage crédits" value={formatPercent(stats?.creditsUsageRate || 0)} />
                                    <MetricTile label="Note moyenne 30j" value={stats?.avgRating ? `${stats.avgRating}/5` : '—'} />
                                    <MetricTile label="Taux de réponse" value={formatPercent(stats?.responseRate || 0)} />
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function HeroStat({ label, value }) {
    return (
        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/75">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function KpiCard({ label, value, hint, color }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="p-5">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                <p className="mt-2 text-xs text-gray-500">{hint}</p>
            </div>
            <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
        </div>
    );
}

function SectionCard({ title, subtitle, children, className = '' }) {
    return (
        <div className={`rounded-xl border border-gray-100 bg-white p-6 shadow-lg ${className}`}>
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
        </div>
    );
}

function MetricTile({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function GrowthBars({ data = [], maxValue = 1 }) {
    return (
        <div className="grid h-72 grid-cols-6 items-end gap-4">
            {data.map((item) => (
                <div key={item.label} className="flex h-full flex-col justify-end">
                    <div className="flex h-full items-end justify-center gap-1">
                        <div
                            className="w-4 rounded-t bg-blue-300"
                            style={{ height: `${Math.max(((item.companies || 0) / maxValue) * 100, 4)}%` }}
                            title={`Entreprises: ${item.companies}`}
                        />
                        <div
                            className="w-4 rounded-t bg-feedora-500"
                            style={{ height: `${Math.max(((item.requests || 0) / maxValue) * 100, 4)}%` }}
                            title={`Demandes: ${item.requests}`}
                        />
                        <div
                            className="w-4 rounded-t bg-emerald-400"
                            style={{ height: `${Math.max(((item.feedbacks || 0) / maxValue) * 100, 4)}%` }}
                            title={`Feedbacks: ${item.feedbacks}`}
                        />
                    </div>
                    <div className="mt-3 text-center text-xs font-medium text-gray-500">{item.label}</div>
                </div>
            ))}
        </div>
    );
}

function focusTone(tone) {
    if (tone === 'danger') return 'bg-rose-50 border-rose-200 text-rose-800';
    if (tone === 'warning') return 'bg-amber-50 border-amber-200 text-amber-800';
    if (tone === 'success') return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
}

function formatNumber(value = 0) {
    return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function formatPercent(value = 0) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function formatMoney(value = 0, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}
