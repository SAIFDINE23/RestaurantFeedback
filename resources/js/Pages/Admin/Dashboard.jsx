import DashboardExecutive from './DashboardExecutive';

export default DashboardExecutive;

/*
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
                                        <div key={plan.slug}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">{plan.name}</span>
                                                <span className="text-gray-500">{formatNumber(plan.count)} ({plan.percentage}%)</span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-feedora-400 to-feedora-600" style={{ width: `${plan.percentage}%` }} />
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
                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                            <span className="font-medium text-gray-700">{item.label}</span>
                                            <span className="text-gray-500">
                                                {item.value}{item.unit} / cible {item.target}{item.unit}
                                            </span>
                                        </div>
                                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${item.value >= item.target ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-feedora-500'}`}
                                                style={{ width: `${Math.min(100, item.value)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
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

* /
* /
    
    function HeroStat({ label, value }) {
        return (
            <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/75 font-semibold">{label}</p>
                <p className="text-2xl font-bold mt-1 text-white">{value}</p>
            </div>
        );
    }
    
    function KpiCard({ label, value, hint, color }) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-5">
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    <p className="text-xs text-gray-500 mt-2">{hint}</p>
                </div>
                <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
            </div>
        );
    }
    
    function SectionCard({ title, subtitle, children, className = '' }) {
        return (
            <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>
                {children}
            </div>
        );
    }
    
    function MiniMetric({ label, value }) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
            </div>
        );
    }
    
    function MetricTile({ label, value }) {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
        );
    }
    
    function GrowthBars({ data = [], maxValue = 1 }) {
        return (
            <div className="grid grid-cols-6 gap-4 items-end h-72">
                {data.map((item) => (
                    <div key={item.label} className="h-full flex flex-col justify-end">
                        <div className="flex items-end justify-center gap-1 h-full">
                            <div className="w-4 rounded-t bg-blue-300" style={{ height: `${Math.max(((item.companies || 0) / maxValue) * 100, 4)}%` }} title={`Entreprises: ${item.companies}`} />
                            <div className="w-4 rounded-t bg-feedora-500" style={{ height: `${Math.max(((item.requests || 0) / maxValue) * 100, 4)}%` }} title={`Demandes: ${item.requests}`} />
                            <div className="w-4 rounded-t bg-emerald-400" style={{ height: `${Math.max(((item.feedbacks || 0) / maxValue) * 100, 4)}%` }} title={`Feedbacks: ${item.feedbacks}`} />
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
        if (rating >= 4) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (rating >= 3) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    // Fonction pour obtenir l'icône selon la note
    const getRatingIcon = (rating) => {
        if (rating >= 4) return '⭐';
        if (rating >= 3) return '👍';
        return '👎';
    };

    // Calculer les statistiques pour le graphique
    const maxCount = feedbackEvolution && feedbackEvolution.length > 0 
        ? Math.max(...feedbackEvolution.map(e => e.count || 0), 1) 
        : 1;

    // Fonction pour formater les nombres avec séparateur de milliers
    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    // Insight automatique basé sur les données
    const getInsight = () => {
        if (stats.satisfactionRate >= 90) {
            return {
                type: 'success',
                icon: '🎉',
                title: 'Excellente performance !',
                message: `${stats.satisfactionRate}% de satisfaction. Les entreprises adorent votre plateforme !`
            };
        } else if (stats.npsScore >= 50) {
            return {
                type: 'success',
                icon: '✨',
                title: 'NPS exceptionnel',
                message: `Score NPS de ${stats.npsScore}. Vos clients sont de véritables promoteurs !`
            };
        } else if (stats.feedbacksGrowth > 20) {
            return {
                type: 'info',
                icon: '📈',
                title: 'Forte croissance',
                message: `+${stats.feedbacksGrowth}% de feedbacks ce mois. Continuez ainsi !`
            };
        } else if (stats.responseRate < 30) {
            return {
                type: 'warning',
                icon: '⚠️',
                title: 'Taux de réponse faible',
                message: `Seulement ${stats.responseRate}% de réponses. Encouragez vos entreprises à répondre plus.`
            };
        }
        return null;
    };

    const insight = getInsight();

    return (
        <AdminLayout header="Dashboard Administrateur">
            <Head title="Dashboard Admin" />

            <div className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header avec badge * /}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Vue d'ensemble complète de votre plateforme
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-lg">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-indigo-700">En direct</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insight automatique * /}
                    {insight && (
                        <div className={`mb-8 p-6 rounded-xl border-2 ${
                            insight.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                            insight.type === 'warning' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' :
                            'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">{insight.icon}</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{insight.title}</h3>
                                    <p className="text-gray-700">{insight.message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KPIs Cards - Design amélioré * /}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {/* Entreprises * /}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Entreprises</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalCompanies)}</p>
                                        {stats.companiesGrowth && (
                                            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stats.companiesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <span>{stats.companiesGrowth >= 0 ? '↗' : '↘'}</span>
                                                <span>{Math.abs(stats.companiesGrowth)}% ce mois</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clients * /}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Clients</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalCustomers)}</p>
                                        <p className="text-xs text-gray-500 mt-2">Sur toute la plateforme</p>
                                    </div>
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedbacks * /}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Feedbacks</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalFeedbacks)}</p>
                                        {stats.feedbacksGrowth && (
                                            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stats.feedbacksGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <span>{stats.feedbacksGrowth >= 0 ? '↗' : '↘'}</span>
                                                <span>{Math.abs(stats.feedbacksGrowth)}% ce mois</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Taux de réponse * /}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Taux de réponse</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
                                        <p className="text-xs text-gray-500 mt-2">{formatNumber(stats.totalFeedbackRequests)} demandes</p>
                                    </div>
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Métriques avancées * /}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* NPS Score * /}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium opacity-90">Net Promoter Score</h3>
                                <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold">{stats.npsScore}</p>
                                <span className="text-sm opacity-75">/ 100</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-xs opacity-75">
                        {feedbackEvolution && feedbackEvolution.length > 0 ? (
                            <div className="relative">
                                {/* Grille de fond avec labels * /}
                                <div className="absolute inset-0 flex flex-col justify-between pb-12 pr-4">
                                    {[maxCount, Math.floor(maxCount * 0.75), Math.floor(maxCount * 0.5), Math.floor(maxCount * 0.25), 0].map((value, idx) => (
                                        <div key={idx} className="flex items-center">
                                            <span className="text-xs text-gray-400 w-8 text-right">{value}</span>
                                            <div className="flex-1 border-t border-gray-100 ml-2"></div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Graphique linéaire * /}
                                <div className="relative h-64 ml-10">
                                    <svg className="w-full h-full" viewBox="0 0 1000 256" preserveAspectRatio="none">
                                        {/* Dégradé sous la courbe * /}
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        
                                        {/* Zone sous la courbe * /}
                                        <path
                                            d={(() => {
                                                const points = feedbackEvolution.map((item, index) => {
                                                    const x = (index / (feedbackEvolution.length - 1)) * 1000;
                                                    const y = 256 - (maxCount > 0 ? (item.count / maxCount) * 256 : 0);
                                                    return `${x},${y}`;
                                                });
                                                return `M 0,256 L ${points.join(' L ')} L 1000,256 Z`;
                                            })()}
                                            fill="url(#areaGradient)"
                                        />
                                        
                                        {/* Ligne principale * /}
                                        <polyline
                                            points={feedbackEvolution.map((item, index) => {
                                                const x = (index / (feedbackEvolution.length - 1)) * 1000;
                                                const y = 256 - (maxCount > 0 ? (item.count / maxCount) * 256 : 0);
                                                return `${x},${y}`;
                                            }).join(' ')}
                                            fill="none"
                                            stroke="#6366f1"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="drop-shadow-lg"
                                        />
                                        
                                        {/* Points interactifs * /}
                                        {feedbackEvolution.map((item, index) => {
                                            const x = (index / (feedbackEvolution.length - 1)) * 1000;
                                            const y = 256 - (maxCount > 0 ? (item.count / maxCount) * 256 : 0);
                                            const dateObj = new Date(item.date + 'T00:00:00');
                                            const dayLabel = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                                            
                                            return (
                                                <g key={index} className="group">
                                                    {/* Point * /}
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r="5"
                                                        fill="white"
                                                        stroke="#6366f1"
                                                        strokeWidth="2"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer drop-shadow-md"
                                                    />
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r="8"
                                                        fill="transparent"
                                                        className="cursor-pointer"
                                                    >
                                                        <title>{`${dayLabel}: ${item.count} feedback${item.count > 1 ? 's' : ''}`}</title>
                                                    </circle>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                    
                                    {/* Labels de dates * /}
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between mt-2 px-1">
                                        {feedbackEvolution.map((item, index) => {
                                            if (index % 5 !== 0) return null;
                                            const dateObj = new Date(item.date + 'T00:00:00');
                                            const dayLabel = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                                            return (
                                                <span key={index} className="text-xs text-gray-500 font-medium">
                                                    {dayLabel}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Légende * /}
                                <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-0.5 bg-indigo-500"></div>
                                        <span className="text-xs text-gray-600">Feedbacks reçus</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>
                                        <span className="text-xs text-gray-600">Points de données</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="mt-4 text-sm text-gray-500">Aucune donnée disponible pour les 30 derniers jours</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Réponses IA vs Admin et Top entreprises * /}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Réponses générées * /}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Réponses générées</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Par IA</p>
                                            <p className="text-sm text-gray-600">{replyStats.ai.count} réponses</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-600">{replyStats.ai.percentage}%</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Par Admin</p>
                                            <p className="text-sm text-gray-600">{replyStats.admin.count} réponses</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">{replyStats.admin.percentage}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top entreprises * /}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top entreprises</h3>
                            <div className="space-y-3">
                                {topCompanies && topCompanies.length > 0 ? (
                                    topCompanies.slice(0, 5).map((company, index) => (
                                        <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                                                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                                                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                                                    'bg-gradient-to-br from-gray-400 to-gray-500'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{company.name}</p>
                                                    <p className="text-xs text-gray-500">{company.sector || 'Non spécifié'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{company.feedbacks_count}</p>
                                                <p className="text-xs text-gray-500">feedbacks</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Feedbacks récents - Tableau amélioré * /}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Feedbacks récents</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entreprise</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Note</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commentaire</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentFeedbacks && recentFeedbacks.length > 0 ? (
                                        recentFeedbacks.map((feedback) => (
                                            <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{feedback.company_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{feedback.customer_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {feedback.rating && (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRatingColor(feedback.rating)}`}>
                                                            {getRatingIcon(feedback.rating)} {feedback.rating}/5
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-md truncate">
                                                        {feedback.comment || <span className="text-gray-400 italic">Aucun commentaire</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{feedback.created_at}</div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center">
                                                <div className="text-sm text-gray-500">Aucun feedback disponible</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

*/
