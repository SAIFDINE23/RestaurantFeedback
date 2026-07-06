import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useMemo, useState } from 'react';

const statusStyles = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    trialing: 'bg-blue-100 text-blue-700 border-blue-200',
    past_due: 'bg-amber-100 text-amber-700 border-amber-200',
    canceled: 'bg-rose-100 text-rose-700 border-rose-200',
    unpaid: 'bg-rose-100 text-rose-700 border-rose-200',
    incomplete: 'bg-gray-100 text-gray-700 border-gray-200',
};

function formatMoney(value = 0, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function formatNumber(value = 0) {
    return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function toDateLabel(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
}

export default function AdminSubscriptions({
    stats,
    financeMetrics,
    statusDistribution,
    planDistribution,
    planPerformance,
    cohorts,
    subscriptions,
    filters,
    filterOptions,
}) {
    const [localFilters, setLocalFilters] = useState({
        search: filters?.search ?? '',
        status: filters?.status ?? 'all',
        plan: filters?.plan ?? 'all',
        sort: filters?.sort ?? 'newest',
    });

    const healthScore = useMemo(() => {
        if (!stats?.total_accounts) return 0;
        const activeRate = (stats.active_accounts / stats.total_accounts) * 100;
        const riskPenalty = (stats.past_due_accounts / stats.total_accounts) * 30;
        return Math.max(0, Math.min(100, Math.round(activeRate - riskPenalty)));
    }, [stats]);

    const applyFilters = (e) => {
        e.preventDefault();

        router.get(route('admin.subscriptions'), localFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const next = { search: '', status: 'all', plan: 'all', sort: 'newest' };
        setLocalFilters(next);
        router.get(route('admin.subscriptions'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AdminLayout header="Abonnements">
            <Head title="Admin - Abonnements" />

            <div className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="rounded-2xl bg-gradient-to-r from-feedora-600 to-feedora-500 shadow-lg overflow-hidden border border-feedora-500">
                        <div className="p-6 text-white">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">Subscription Intelligence</h1>
                                    <p className="mt-2 text-sm text-feedora-50/90">
                                        Vue globale des abonnements, revenus estimés, qualité des données Stripe et consommation crédits.
                                    </p>
                                </div>

                                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-w-[210px]">
                                    <p className="text-xs uppercase tracking-wide text-white/80">SaaS Health Score</p>
                                    <p className="text-3xl font-bold mt-1">{healthScore}/100</p>
                                    <p className="text-xs text-white/80 mt-1">
                                        Actifs: {formatNumber(stats?.active_accounts)} • Risque: {formatNumber(stats?.past_due_accounts)} past_due
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <KpiCard
                            label="MRR estimé"
                            value={formatMoney(stats?.estimated_mrr || 0)}
                            hint={`ARR: ${formatMoney(stats?.estimated_arr || 0)}`}
                            gradient="from-emerald-500 to-emerald-600"
                        />
                        <KpiCard
                            label="Comptes actifs"
                            value={`${formatNumber(stats?.active_accounts || 0)} / ${formatNumber(stats?.total_accounts || 0)}`}
                            hint={`${stats?.total_accounts ? ((stats.active_accounts / stats.total_accounts) * 100).toFixed(1) : 0}% de base active`}
                            gradient="from-blue-500 to-blue-600"
                        />
                        <KpiCard
                            label="Comptes payants actifs"
                            value={formatNumber(stats?.paid_active_accounts || 0)}
                            hint={`ARPA: ${formatMoney(stats?.arpa || 0)}`}
                            gradient="from-violet-500 to-violet-600"
                        />
                        <KpiCard
                            label="Risque immédiat"
                            value={formatNumber((stats?.past_due_accounts || 0) + (stats?.ending_soon || 0))}
                            hint={`${formatNumber(stats?.past_due_accounts || 0)} past_due • ${formatNumber(stats?.ending_soon || 0)} fins < 7j`}
                            gradient="from-amber-500 to-amber-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <KpiCard
                            label="Churn proxy 30j"
                            value={`${financeMetrics?.churn_rate_30d || 0}%`}
                            hint={`${formatNumber(financeMetrics?.churned_accounts_30d || 0)} comptes churnés estimés`}
                            gradient="from-rose-500 to-rose-600"
                        />
                        <KpiCard
                            label="Réactivations 30j"
                            value={formatNumber(financeMetrics?.reactivated_accounts_30d || 0)}
                            hint={`Expansion rate: ${financeMetrics?.expansion_rate_30d || 0}%`}
                            gradient="from-cyan-500 to-cyan-600"
                        />
                        <KpiCard
                            label="MRR à risque"
                            value={formatMoney(financeMetrics?.mrr_at_risk || 0)}
                            hint="past_due + fins proches < 7 jours"
                            gradient="from-orange-500 to-red-500"
                        />
                        <KpiCard
                            label="LTV proxy"
                            value={financeMetrics?.ltv_proxy ? formatMoney(financeMetrics.ltv_proxy) : '—'}
                            hint={`Signup → paid 30j: ${financeMetrics?.signup_to_paid_conversion_30d || 0}%`}
                            gradient="from-fuchsia-500 to-violet-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:col-span-1">
                            <h3 className="text-lg font-semibold text-gray-900">Distribution statuts</h3>
                            <p className="text-sm text-gray-500 mt-1">État actuel (latest subscription / entreprise)</p>
                            <div className="space-y-4 mt-5">
                                {(statusDistribution || []).map((row) => (
                                    <div key={row.status}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{row.status}</span>
                                            <span className="text-gray-500">{formatNumber(row.count)} ({row.percentage}%)</span>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-feedora-400 to-feedora-600"
                                                style={{ width: `${Math.min(100, row.percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900">Monétisation par plan</h3>
                            <p className="text-sm text-gray-500 mt-1">Adoption + MRR estimé par segment</p>
                            <div className="mt-5 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100">
                                            <th className="pb-3">Plan</th>
                                            <th className="pb-3">Comptes</th>
                                            <th className="pb-3">Actifs</th>
                                            <th className="pb-3">Adoption</th>
                                            <th className="pb-3 text-right">MRR estimé</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(planPerformance || []).map((plan) => (
                                            <tr key={plan.id} className="border-b border-gray-50">
                                                <td className="py-3">
                                                    <div className="font-semibold text-gray-900">{plan.name}</div>
                                                    <div className="text-xs text-gray-500 uppercase">{plan.slug}</div>
                                                </td>
                                                <td className="py-3 text-gray-700">{formatNumber(plan.count)}</td>
                                                <td className="py-3 text-gray-700">{formatNumber(plan.active_count)}</td>
                                                <td className="py-3 text-gray-700">{plan.adoption_rate}%</td>
                                                <td className="py-3 text-right font-semibold text-gray-900">{formatMoney(plan.estimated_mrr || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Crédits (pool global)</h3>
                        <p className="text-sm text-gray-500 mt-1">Capacité mensuelle, consommation et stock add-on</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                            <MetricChip label="Quota mensuel total" value={formatNumber(stats?.credits_monthly_total)} />
                            <MetricChip label="Utilisé ce mois" value={formatNumber(stats?.credits_used_monthly)} />
                            <MetricChip label="Disponible" value={formatNumber(stats?.credits_available_monthly)} />
                            <MetricChip label="Add-on balance" value={formatNumber(stats?.credits_addon_balance)} />
                        </div>

                        <div className="mt-5">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">Taux de consommation mensuel</span>
                                <span className="text-gray-600">{stats?.credits_usage_rate || 0}%</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-feedora-400 to-feedora-600"
                                    style={{ width: `${Math.min(100, stats?.credits_usage_rate || 0)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Base abonnements (état actuel)</h3>
                                <p className="text-sm text-gray-500">Dernière subscription par entreprise, avec crédits et statut Stripe.</p>
                            </div>
                        </div>

                        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-5">
                            <input
                                type="text"
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters((prev) => ({ ...prev, search: e.target.value }))}
                                placeholder="Recherche entreprise, email, stripe ID"
                                className="xl:col-span-2 rounded-lg border-gray-300 focus:border-feedora-500 focus:ring-feedora-500"
                            />

                            <select
                                value={localFilters.status}
                                onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))}
                                className="rounded-lg border-gray-300 focus:border-feedora-500 focus:ring-feedora-500"
                            >
                                <option value="all">Tous statuts</option>
                                {(filterOptions?.statuses || []).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>

                            <select
                                value={localFilters.plan}
                                onChange={(e) => setLocalFilters((prev) => ({ ...prev, plan: e.target.value }))}
                                className="rounded-lg border-gray-300 focus:border-feedora-500 focus:ring-feedora-500"
                            >
                                <option value="all">Tous plans</option>
                                {(filterOptions?.plans || []).map((plan) => (
                                    <option key={plan.id} value={plan.slug}>{plan.name}</option>
                                ))}
                            </select>

                            <select
                                value={localFilters.sort}
                                onChange={(e) => setLocalFilters((prev) => ({ ...prev, sort: e.target.value }))}
                                className="rounded-lg border-gray-300 focus:border-feedora-500 focus:ring-feedora-500"
                            >
                                <option value="newest">Plus récent</option>
                                <option value="oldest">Plus ancien</option>
                                <option value="ends_soon">Fin la plus proche</option>
                                <option value="plan_asc">Ordre des plans</option>
                            </select>

                            <div className="xl:col-span-5 flex items-center gap-3">
                                <button type="submit" className="px-4 py-2.5 rounded-lg bg-feedora-500 text-white font-semibold hover:bg-feedora-600 transition-colors">
                                    Appliquer
                                </button>
                                <button type="button" onClick={resetFilters} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                                    Réinitialiser
                                </button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-100">
                                        <th className="py-3">Entreprise</th>
                                        <th className="py-3">Plan</th>
                                        <th className="py-3">Statut</th>
                                        <th className="py-3">Crédits (mois)</th>
                                        <th className="py-3">Stripe</th>
                                        <th className="py-3">Dates</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(subscriptions?.data || []).map((row) => (
                                        <tr key={row.id} className="border-b border-gray-50 align-top">
                                            <td className="py-3">
                                                <p className="font-semibold text-gray-900">{row.company?.name || '—'}</p>
                                                <p className="text-xs text-gray-500">{row.company?.user_email || '—'}</p>
                                            </td>
                                            <td className="py-3">
                                                <p className="font-semibold text-gray-900">{row.plan?.name || '—'}</p>
                                                <p className="text-xs text-gray-500 uppercase">
                                                    {row.plan?.slug || '—'} • {formatMoney(row.plan?.price || 0, row.plan?.currency || 'EUR')}/{row.plan?.billing_period === 'year' ? 'an' : 'mois'}
                                                </p>
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[row.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-3 min-w-[220px]">
                                                {row.credits ? (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                            <span>{formatNumber(row.credits.credits_used_monthly)} / {formatNumber(row.credits.credits_monthly)}</span>
                                                            <span>{row.credits.usage_percent}%</span>
                                                        </div>
                                                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-feedora-400 to-feedora-600"
                                                                style={{ width: `${Math.min(100, row.credits.usage_percent)}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500">Add-on: {formatNumber(row.credits.credits_addon_balance)} • Total: {formatNumber(row.credits.credits_total_available)}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Aucune donnée crédits</span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <p className="text-xs font-mono text-gray-700 break-all">
                                                    {row.stripe_subscription_id || 'Aucun Stripe ID'}
                                                </p>
                                            </td>
                                            <td className="py-3">
                                                <p className="text-xs text-gray-600">Créé: {toDateLabel(row.created_at)}</p>
                                                <p className="text-xs text-gray-600">Fin: {toDateLabel(row.ends_at)}</p>
                                                <p className="text-xs text-gray-600">Trial: {toDateLabel(row.trial_ends_at)}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {(subscriptions?.data || []).length === 0 && (
                                <div className="text-center py-10 text-gray-500">Aucun abonnement trouvé avec les filtres actuels.</div>
                            )}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                                Affichage de {formatNumber(subscriptions?.from || 0)} à {formatNumber(subscriptions?.to || 0)} sur {formatNumber(subscriptions?.total || 0)} résultats
                            </p>

                            <div className="flex items-center gap-2">
                                {(subscriptions?.links || []).map((link, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                            link.active
                                                ? 'bg-feedora-500 text-white border-feedora-500'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Distribution plan (snapshot)</h3>
                        <p className="text-sm text-gray-500 mt-1">Répartition instantanée des comptes et contribution MRR</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
                            {(planDistribution || []).map((row) => (
                                <div key={row.slug} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{row.name}</p>
                                            <p className="text-xs text-gray-500 uppercase">{row.slug}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-feedora-100 text-feedora-700 font-semibold">
                                            {row.percentage}%
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Comptes: <span className="font-semibold text-gray-900">{formatNumber(row.count)}</span></p>
                                        <p>Actifs: <span className="font-semibold text-gray-900">{formatNumber(row.active_count)}</span></p>
                                        <p>MRR estimé: <span className="font-semibold text-gray-900">{formatMoney(row.mrr || 0)}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Cohortes d'acquisition</h3>
                                <p className="text-sm text-gray-500 mt-1">Lecture signup → ever paid → retained paid par mois d'entrée.</p>
                            </div>
                            <div className="rounded-lg bg-feedora-50 border border-feedora-100 px-4 py-2 text-sm text-feedora-700 font-medium">
                                Analyse proxy sur 12 mois
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b border-gray-100">
                                        <th className="py-3">Cohorte</th>
                                        <th className="py-3">Entreprises</th>
                                        <th className="py-3">Ever paid</th>
                                        <th className="py-3">Paid actuels</th>
                                        <th className="py-3">Conversion</th>
                                        <th className="py-3">Retention paid</th>
                                        <th className="py-3 text-right">MRR estimé</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(cohorts || []).map((row) => (
                                        <tr key={row.cohort} className="border-b border-gray-50">
                                            <td className="py-3 font-semibold text-gray-900">{row.label}</td>
                                            <td className="py-3 text-gray-700">{formatNumber(row.companies)}</td>
                                            <td className="py-3 text-gray-700">{formatNumber(row.ever_paid)}</td>
                                            <td className="py-3 text-gray-700">{formatNumber(row.current_paid)}</td>
                                            <td className="py-3">
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                                                    {row.conversion_rate}%
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                                    {row.retained_paid_rate}%
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-semibold text-gray-900">{formatMoney(row.estimated_mrr || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function KpiCard({ label, value, hint, gradient }) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-5">
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                <p className="text-xs text-gray-500 mt-2">{hint}</p>
            </div>
            <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
        </div>
    );
}

function MetricChip({ label, value }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}
