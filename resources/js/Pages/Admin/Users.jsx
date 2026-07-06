import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState, useRef, useCallback, useMemo } from 'react';

const SORT_OPTIONS = [
    { value: 'newest',  label: 'Plus récents' },
    { value: 'oldest',  label: 'Plus anciens' },
    { value: 'name',    label: 'Nom A-Z' },
    { value: 'email',   label: 'Email A-Z' },
];

const PLAN_COLORS = {
    free:       'bg-gray-100 text-gray-700',
    basic:      'bg-blue-100 text-blue-700',
    pro:        'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700',
    none:       'bg-gray-100 text-gray-400',
};

const SUB_STATUS = {
    active:    { label: 'Actif',    color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    trialing:  { label: 'Essai',    color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500' },
    past_due:  { label: 'Impayé',   color: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500' },
    canceled:  { label: 'Annulé',   color: 'bg-red-100 text-red-700',         dot: 'bg-red-500' },
    none:      { label: 'Aucun',    color: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-300' },
};

const PROVIDER_ICONS = {
    google: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
    ),
    email: (
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
    ),
};

export default function AdminUsers({ stats, monthlyEvolution, providerBreakdown, users, filters, filterOptions }) {
    const [search, setSearch] = useState(filters?.search || '');
    const timerRef = useRef(null);

    const fmt = (n) => (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const applyFilters = useCallback((overrides = {}) => {
        router.get(route('admin.users'), {
            search:   overrides.search   !== undefined ? overrides.search   : search,
            verified: overrides.verified !== undefined ? overrides.verified : filters.verified,
            twofa:    overrides.twofa    !== undefined ? overrides.twofa    : filters.twofa,
            provider: overrides.provider !== undefined ? overrides.provider : filters.provider,
            company:  overrides.company  !== undefined ? overrides.company  : filters.company,
            sort:     overrides.sort     !== undefined ? overrides.sort     : filters.sort,
        }, { preserveState: true, preserveScroll: true });
    }, [search, filters]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => applyFilters({ search: value }), 400);
    };

    const resetFilters = () => {
        setSearch('');
        router.get(route('admin.users'), {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = search
        || filters.verified !== 'all'
        || filters.twofa    !== 'all'
        || filters.provider !== 'all'
        || filters.company  !== 'all'
        || filters.sort     !== 'newest';

    const maxMonthly = useMemo(() => Math.max(...(monthlyEvolution || []).map(i => i.count), 1), [monthlyEvolution]);

    return (
        <AdminLayout header="Utilisateurs">
            <Head title="Admin - Utilisateurs" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ═══ KPIs ═══ */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <KpiCard
                            label="Total"
                            value={fmt(stats.totalUsers)}
                            sub={`+${stats.usersThisMonth} ce mois`}
                            icon={<UsersIcon />}
                            gradient="from-blue-500 to-blue-600"
                        />
                        <KpiCard
                            label="Vérifiés"
                            value={fmt(stats.verifiedUsers)}
                            sub={`${stats.verifiedRate}% du total`}
                            icon={<BadgeCheckIcon />}
                            gradient="from-emerald-500 to-emerald-600"
                        />
                        <KpiCard
                            label="Non vérifiés"
                            value={fmt(stats.unverifiedUsers)}
                            sub="email non confirmé"
                            icon={<MailWarningIcon />}
                            gradient={stats.unverifiedUsers > 0 ? 'from-amber-500 to-amber-600' : 'from-gray-400 to-gray-500'}
                        />
                        <KpiCard
                            label="2FA actif"
                            value={fmt(stats.twoFaUsers)}
                            sub={`${stats.twoFaRate}% sécurisés`}
                            icon={<ShieldIcon />}
                            gradient="from-purple-500 to-purple-600"
                        />
                        <KpiCard
                            label="OAuth"
                            value={fmt(stats.oauthUsers)}
                            sub="via Google / tiers"
                            icon={<KeyIcon />}
                            gradient="from-pink-500 to-pink-600"
                        />
                        <KpiCard
                            label="Avec entreprise"
                            value={fmt(stats.withCompany)}
                            sub={`${stats.companyRate}% activés`}
                            icon={<BuildingIcon />}
                            gradient="from-teal-500 to-teal-600"
                        />
                    </div>

                    {/* ═══ Graphique + Providers ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Évolution 12 mois */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Inscriptions sur 12 mois</h3>
                                    <p className="text-sm text-gray-500">Nouveaux comptes / mois</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs text-gray-500 font-medium">
                                        Croissance : <span className={`font-bold ${stats.monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth}%
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-48 ml-6">
                                <svg className="w-full h-full" viewBox="0 0 1000 192" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="userGrad" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M 0,192 L ${(monthlyEvolution || []).map((item, i) =>
                                            `${(i / Math.max(monthlyEvolution.length - 1, 1)) * 1000},${192 - (item.count / maxMonthly) * 192}`
                                        ).join(' L ')} L 1000,192 Z`}
                                        fill="url(#userGrad)"
                                    />
                                    <polyline
                                        points={(monthlyEvolution || []).map((item, i) =>
                                            `${(i / Math.max(monthlyEvolution.length - 1, 1)) * 1000},${192 - (item.count / maxMonthly) * 192}`
                                        ).join(' ')}
                                        fill="none" stroke="#3b82f6" strokeWidth="2.5"
                                        strokeLinecap="round" strokeLinejoin="round"
                                    />
                                    {(monthlyEvolution || []).map((item, i) => {
                                        const x = (i / Math.max(monthlyEvolution.length - 1, 1)) * 1000;
                                        const y = 192 - (item.count / maxMonthly) * 192;
                                        return (
                                            <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2">
                                                <title>{item.month}: {item.count} utilisateur{item.count > 1 ? 's' : ''}</title>
                                            </circle>
                                        );
                                    })}
                                </svg>
                                <div className="absolute bottom-0 left-0 right-0 flex justify-between -mb-5">
                                    {(monthlyEvolution || []).filter((_, i) => i % 2 === 0).map((item, i) => (
                                        <span key={i} className="text-[10px] text-gray-400">{item.month.split(' ')[0]}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Providers + Sécurité */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Méthodes de connexion</h3>
                                <div className="space-y-2">
                                    {(providerBreakdown || []).map((p, i) => {
                                        const pct = stats.totalUsers > 0 ? (p.count / stats.totalUsers) * 100 : 0;
                                        const isGoogle = p.provider === 'google';
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {PROVIDER_ICONS[p.provider] || PROVIDER_ICONS.email}
                                                        <span className="font-medium text-gray-700 capitalize">{p.provider}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="font-semibold text-gray-900">{p.count}</span>
                                                        <span className="text-gray-400">{pct.toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`h-full rounded-full ${isGoogle ? 'bg-gradient-to-r from-blue-500 to-red-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Sécurité</h3>
                                <div className="space-y-2">
                                    <SecurityBar
                                        label="Email vérifié"
                                        count={stats.verifiedUsers}
                                        pct={stats.verifiedRate}
                                        color="bg-emerald-500"
                                    />
                                    <SecurityBar
                                        label="2FA activé"
                                        count={stats.twoFaUsers}
                                        pct={stats.twoFaRate}
                                        color="bg-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ Tableau des utilisateurs ═══ */}
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
                                        placeholder="Nom, email, nom d'entreprise..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500 transition-colors"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select value={filters.verified} onChange={(e) => applyFilters({ verified: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">Email vérifié : tous</option>
                                        <option value="yes">Vérifiés</option>
                                        <option value="no">Non vérifiés</option>
                                    </select>

                                    <select value={filters.twofa} onChange={(e) => applyFilters({ twofa: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">2FA : tous</option>
                                        <option value="yes">2FA actif</option>
                                        <option value="no">Sans 2FA</option>
                                    </select>

                                    <select value={filters.provider} onChange={(e) => applyFilters({ provider: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">Connexion : tous</option>
                                        <option value="email">Email/Password</option>
                                        {(filterOptions?.providers || []).map(p => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>

                                    <select value={filters.company} onChange={(e) => applyFilters({ company: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-feedora-500/20 focus:border-feedora-500">
                                        <option value="all">Entreprise : tous</option>
                                        <option value="yes">Avec entreprise</option>
                                        <option value="no">Sans entreprise</option>
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
                                <span>{(users?.total ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} utilisateur{(users?.total ?? 0) > 1 ? 's' : ''}</span>
                                {hasActiveFilters && <span className="text-feedora-600 font-medium">(filtré)</span>}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entreprise</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Connexion</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sécurité</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(users?.data || []).map((user) => {
                                        const st = SUB_STATUS[user.subscription_status] || SUB_STATUS.none;
                                        const planColor = PLAN_COLORS[user.plan_slug] || PLAN_COLORS.none;
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* Utilisateur */}
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" />
                                                        ) : (
                                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ${user.is_admin ? 'bg-gradient-to-br from-feedora-400 to-feedora-600 ring-feedora-100' : 'bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-100'}`}>
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{user.name}</p>
                                                                {user.is_admin && (
                                                                    <span className="px-1.5 py-0.5 bg-feedora-100 text-feedora-700 text-[10px] font-bold rounded uppercase">Admin</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                {user.email_verified ? (
                                                                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-3 h-3 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                                                    </svg>
                                                                )}
                                                                <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Entreprise */}
                                                <td className="px-4 py-3.5">
                                                    {user.company_name ? (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{user.company_name}</p>
                                                            <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.company_sector || '—'}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Aucune</span>
                                                    )}
                                                </td>

                                                {/* Plan + Statut */}
                                                <td className="px-4 py-3.5">
                                                    {user.plan_name ? (
                                                        <div className="space-y-1">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${planColor}`}>
                                                                {user.plan_name}
                                                            </span>
                                                            {user.subscription_status && (
                                                                <div>
                                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${st.color}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                                        {st.label}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">—</span>
                                                    )}
                                                </td>

                                                {/* Provider */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        {PROVIDER_ICONS[user.provider] || PROVIDER_ICONS.email}
                                                        <span className="text-xs font-medium text-gray-600 capitalize">{user.provider}</span>
                                                    </div>
                                                </td>

                                                {/* Sécurité */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span title={user.email_verified ? `Vérifié le ${user.email_verified_at}` : 'Email non vérifié'}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${user.email_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            ✉
                                                        </span>
                                                        <span title={user.two_factor_enabled ? '2FA activé' : '2FA non activé'}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${user.two_factor_enabled ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                                                            🔒
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3.5">
                                                    <span className="text-sm text-gray-500">{user.created_at}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {(users?.data || []).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="text-gray-400">
                                                    <UsersIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                                    <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
                                                    <p className="text-xs mt-1">Essayez de modifier vos filtres</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users?.links && users.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {users.from}–{users.to} sur {users.total}
                                </p>
                                <div className="flex items-center gap-1">
                                    {users.links.map((link, i) => (
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

function SecurityBar({ label, count, pct, color }) {
    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 font-medium">{label}</span>
                <span className="text-gray-500">{count} <span className="text-gray-400">({pct}%)</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ═══ Icons ═══ */

function SearchIcon({ className }) {
    return <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function UsersIcon({ className }) {
    return <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function BadgeCheckIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function MailWarningIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function ShieldIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function KeyIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
}
function BuildingIcon({ className }) {
    return <svg className={className || 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>;
}
