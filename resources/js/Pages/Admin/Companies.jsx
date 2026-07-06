import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useMemo, useCallback, useRef } from 'react';

const STATUS_MAP = {
    active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    trialing: { label: 'Essai', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    past_due: { label: 'Impayé', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    canceled: { label: 'Annulé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    unpaid: { label: 'Non payé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    none: { label: 'Aucun', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

const PLAN_COLORS = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700',
};

const SORT_OPTIONS = [
    { value: 'newest', label: 'Plus récents' },
    { value: 'oldest', label: 'Plus anciens' },
    { value: 'name', label: 'Nom A-Z' },
    { value: 'most_active', label: 'Plus actifs' },
    { value: 'most_customers', label: 'Plus de clients' },
];

export default function AdminCompanies({ stats, sectorDistribution, monthlyEvolution, topCompanies, companies, filters, filterOptions }) {
    const [search, setSearch] = useState(filters?.search || '');
    const timerRef = useRef(null);

    const fmt = (n) => (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const applyFilters = useCallback((overrides = {}) => {
        router.get(route('admin.companies'), {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : filters.status,
            plan: overrides.plan !== undefined ? overrides.plan : filters.plan,
            sector: overrides.sector !== undefined ? overrides.sector : filters.sector,
            sort: overrides.sort !== undefined ? overrides.sort : filters.sort,
        }, { preserveState: true, preserveScroll: true });
    }, [search, filters]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            applyFilters({ search: value });
        }, 400);
    };

    const resetFilters = () => {
        setSearch('');
        router.get(route('admin.companies'), {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = search || filters.status !== 'all' || filters.plan !== 'all' || filters.sector !== 'all' || filters.sort !== 'newest';

    const maxMonthlyCount = useMemo(() => Math.max(...(monthlyEvolution || []).map(i => i.count), 1), [monthlyEvolution]);

    const sectorColors = [
        'from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600',
        'from-orange-500 to-orange-600', 'from-pink-500 to-pink-600', 'from-indigo-500 to-indigo-600',
        'from-teal-500 to-teal-600', 'from-red-500 to-red-600',
    ];

    return (
        <AdminLayout header="Entreprises">
            <Head title="Admin - Entreprises" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ═══ KPIs ═══ */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <KpiCard label="Total" value={fmt(stats.totalCompanies)} sub={`+${stats.companiesThisMonth} ce mois`} icon={<BuildingIcon />} gradient="from-blue-500 to-blue-600" />
                        <KpiCard label="Actives" value={fmt(stats.activeCompanies)} sub={`${stats.totalCompanies > 0 ? Math.round((stats.activeCompanies / stats.totalCompanies) * 100) : 0}% du total`} icon={<CheckCircleIcon />} gradient="from-emerald-500 to-emerald-600" />
                        <KpiCard label="Payantes" value={fmt(stats.paidCompanies)} sub="abonnements actifs" icon={<CreditCardIcon />} gradient="from-purple-500 to-purple-600" />
                        <KpiCard label="Essai" value={fmt(stats.trialCompanies)} sub="en période d'essai" icon={<ClockIcon />} gradient="from-amber-500 to-amber-600" />
                        <KpiCard label="Engagement" value={`${stats.engagementRate}%`} sub="ont envoyé 1+ demande" icon={<TrendUpIcon />} gradient="from-pink-500 to-pink-600" />
                        <KpiCard label="Croissance" value={`${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth}%`} sub="vs mois dernier" icon={<ChartBarIcon />} gradient={stats.monthlyGrowth >= 0 ? 'from-teal-500 to-teal-600' : 'from-red-500 to-red-600'} />
                    </div>

                    {/* ═══ Graphiques + Secteurs ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Évolution 12 mois */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Évolution sur 12 mois</h3>
                                    <p className="text-sm text-gray-500">Nouvelles inscriptions / mois</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-feedora-500"></div>
                                    <span className="text-xs text-gray-500 font-medium">Entreprises</span>
                                </div>
                            </div>
                            <div className="relative h-56 ml-8">
                                <svg className="w-full h-full" viewBox="0 0 1000 224" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="evoGrad" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={`M 0,224 L ${(monthlyEvolution || []).map((item, i) => `${(i / Math.max(monthlyEvolution.length - 1, 1)) * 1000},${224 - (item.count / maxMonthlyCount) * 224}`).join(' L ')} L 1000,224 Z`} fill="url(#evoGrad)" />
                                    <polyline points={(monthlyEvolution || []).map((item, i) => `${(i / Math.max(monthlyEvolution.length - 1, 1)) * 1000},${224 - (item.count / maxMonthlyCount) * 224}`).join(' ')} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    {(monthlyEvolution || []).map((item, i) => {
                                        const x = (i / Math.max(monthlyEvolution.length - 1, 1)) * 1000;
                                        const y = 224 - (item.count / maxMonthlyCount) * 224;
                                        return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#f97316" strokeWidth="2"><title>{item.month}: {item.count}</title></circle>;
                                    })}
                                </svg>
                                <div className="absolute bottom-0 left-0 right-0 flex justify-between -mb-5">
                                    {(monthlyEvolution || []).filter((_, i) => i % 2 === 0).map((item, i) => (
                                        <span key={i} className="text-[10px] text-gray-400">{item.month.split(' ')[0]}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Répartition par secteur */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-5">Répartition par secteur</h3>
                            <div className="space-y-3">
                                {(sectorDistribution || []).slice(0, 6).map((sector, i) => {
                                    const pct = stats.totalCompanies > 0 ? (sector.count / stats.totalCompanies) * 100 : 0;
                                    return (
                                        <div key={i}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700 truncate max-w-[200px]">{sector.sector || 'Non spécifié'}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600 font-semibold">{sector.count}</span>
                                                    <span className="text-gray-400 w-10 text-right text-xs">{pct.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div className={`h-full rounded-full bg-gradient-to-r ${sectorColors[i % sectorColors.length]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!sectorDistribution || sectorDistribution.length === 0) && (
                                    <p className="text-sm text-gray-400 py-4 text-center">Aucun secteur enregistré</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══ Top 5 ═══ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Top 5 — Entreprises les plus actives</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {(topCompanies || []).map((company, i) => (
                                <div key={company.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${
                                        i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                                        i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                        i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                                        'bg-gradient-to-br from-blue-500 to-blue-600'
                                    }`}>
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{company.name}</p>
                                        <p className="text-xs text-gray-500">{company.feedbacks} demandes · {company.customers} clients</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ Filtres + Tableau ═══ */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Rechercher entreprise, email, secteur..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500 transition-colors"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select value={filters.status} onChange={(e) => applyFilters({ status: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">Tous les statuts</option>
                                        <option value="active">Actifs</option>
                                        <option value="trial">En essai</option>
                                        <option value="inactive">Inactifs</option>
                                    </select>

                                    <select value={filters.plan} onChange={(e) => applyFilters({ plan: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">Tous les plans</option>
                                        {(filterOptions?.plans || []).map(p => (
                                            <option key={p.slug} value={p.slug}>{p.name}</option>
                                        ))}
                                    </select>

                                    <select value={filters.sector} onChange={(e) => applyFilters({ sector: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">Tous les secteurs</option>
                                        {(filterOptions?.sectors || []).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>

                                    <select value={filters.sort} onChange={(e) => applyFilters({ sort: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>

                                    {hasActiveFilters && (
                                        <button onClick={resetFilters} className="text-xs text-feedora-600 hover:text-feedora-700 font-medium px-2 py-1 rounded hover:bg-feedora-50 transition-colors">
                                            ✕ Réinitialiser
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <span>{fmt(companies?.total ?? 0)} entreprise{(companies?.total ?? 0) > 1 ? 's' : ''}</span>
                                {hasActiveFilters && <span className="text-feedora-600 font-medium">(filtré)</span>}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entreprise</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Secteur</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Clients</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Feedbacks</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Créé le</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(companies?.data || []).map((company) => {
                                        const st = STATUS_MAP[company.subscription_status] || STATUS_MAP.none;
                                        const planColor = PLAN_COLORS[company.plan_slug] || 'bg-gray-100 text-gray-600';
                                        return (
                                            <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {company.logo_url ? (
                                                            <img src={`/storage/${company.logo_url}`} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-feedora-400 to-feedora-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-feedora-100">
                                                                {company.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{company.name}</p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{company.user_email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm text-gray-600">{company.sector || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${planColor}`}>
                                                        {company.plan_name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${st.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                        {st.label}
                                                        {company.is_trial && company.trial_ends_at && (
                                                            <span className="text-[10px] opacity-75 ml-1">→ {company.trial_ends_at}</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <span className="text-sm font-medium text-gray-700">{company.customers_count}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <span className="text-sm font-medium text-gray-700">{company.feedback_requests_count}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm text-gray-500">{company.created_at}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(companies?.data || []).length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="text-gray-400">
                                                    <BuildingIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                                    <p className="text-sm font-medium">Aucune entreprise trouvée</p>
                                                    <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {companies?.links && companies.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {companies.from}–{companies.to} sur {companies.total}
                                </p>
                                <div className="flex items-center gap-1">
                                    {companies.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-feedora-500 text-white shadow-sm'
                                                    : link.url
                                                        ? 'text-gray-600 hover:bg-gray-100'
                                                        : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                            preserveScroll
                                            preserveState
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}

/* ═══ Sub-components ═══ */

function KpiCard({ label, value, sub, icon, gradient }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <span className="text-white">{icon}</span>
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
    );
}

/* ═══ Icons ═══ */

function SearchIcon({ className }) {
    return <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function BuildingIcon({ className }) {
    return <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
}
function CheckCircleIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function CreditCardIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
}
function ClockIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function TrendUpIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
}
function ChartBarIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 13v4m4-8v8m4-12v12" /></svg>;
}
