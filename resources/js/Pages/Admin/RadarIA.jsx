import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

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
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-200"
                        strokeWidth="6"
                    />

                    {/* Positive */}
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-emerald-500"
                        strokeWidth="6"
                        strokeDasharray={`${positiveLen} ${Math.max(circumference - positiveLen, 0)}`}
                        strokeDashoffset={positiveOffset}
                        transform="rotate(-90 20 20)"
                    />

                    {/* Neutral */}
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-amber-500"
                        strokeWidth="6"
                        strokeDasharray={`${neutralLen} ${Math.max(circumference - neutralLen, 0)}`}
                        strokeDashoffset={neutralOffset}
                        transform="rotate(-90 20 20)"
                    />

                    {/* Negative */}
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-red-500"
                        strokeWidth="6"
                        strokeDasharray={`${negativeLen} ${Math.max(circumference - negativeLen, 0)}`}
                        strokeDashoffset={negativeOffset}
                        transform="rotate(-90 20 20)"
                    />
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
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-sm text-gray-700">Négatif</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{negative}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SeverityBadge({ severity }) {
    const normalized = (severity || '').toLowerCase();

    const style =
        normalized === 'high'
            ? 'bg-red-100 text-red-800 border-red-200'
            : normalized === 'medium'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

    const label = normalized === 'high' ? 'High' : normalized === 'medium' ? 'Medium' : 'Low';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
            {label}
        </span>
    );
}

function CategoryBadge({ category }) {
    const normalized = (category || '').toLowerCase();

    const style =
        normalized === 'risk'
            ? 'bg-red-50 text-red-700 border-red-200'
            : normalized === 'ops'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200';

    const label = normalized === 'risk' ? 'Risk' : normalized === 'ops' ? 'Ops' : 'Opportunity';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
            {label}
        </span>
    );
}

export default function RadarIA({ period, kpis, sentiment, ops, companiesAtRisk, analysis, lastUpdated }) {
    const { flash } = usePage().props;
    const [regenerating, setRegenerating] = useState(false);

    const formatted = useMemo(() => {
        const avg = kpis?.avg_rating_30d;
        return {
            companiesTotal: kpis?.companies_total ?? 0,
            requests30d: kpis?.requests_30d ?? 0,
            feedbacks30d: kpis?.feedbacks_30d ?? 0,
            responseRate: kpis?.response_rate_30d ?? 0,
            avgRating: avg === null || avg === undefined ? '—' : `${avg}/5`,
            failed: ops?.failed_requests_30d ?? 0,
        };
    }, [kpis, ops]);

    const onRegenerate = () => {
        if (regenerating) {
            return;
        }

        if (!confirm('Régénérer le Radar IA global maintenant ?')) {
            return;
        }

        setRegenerating(true);

        router.post(
            route('admin.radar.regenerate'),
            { days: period?.days ?? 30 },
            {
                preserveScroll: true,
                onFinish: () => setRegenerating(false),
            }
        );
    };

    const signals = Array.isArray(analysis?.signals) ? analysis.signals : [];
    const actions = Array.isArray(analysis?.recommended_actions) ? analysis.recommended_actions : [];

    const channels = Array.isArray(ops?.channels_30d) ? ops.channels_30d : [];

    return (
        <AdminLayout header="Radar IA Global">
            <Head title="Radar IA Global" />

            <div className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-gradient-to-r from-feedora-600 to-feedora-500 shadow-lg overflow-hidden border border-feedora-500 mb-8">
                        <div className="p-6">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Radar IA Global</h1>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20">
                                            GLOBAL
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                                            {period?.days ?? 30}j
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-feedora-50/90">
                                        Période: <span className="font-semibold text-white">{period?.from}</span> → <span className="font-semibold text-white">{period?.to}</span>
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-feedora-50/90">
                                            Dernière mise à jour: <span className="font-semibold text-white">{lastUpdated}</span>
                                        </span>
                                        <span className="hidden sm:inline text-white/40">•</span>
                                        <span className="text-xs text-feedora-50/90">
                                            Confiance: <span className="font-semibold text-white">{analysis?.confidence ?? '—'}</span>
                                        </span>
                                        {analysis?.cached && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                                                Cache
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {flash?.success && (
                                        <div className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium">
                                            {flash.success}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={onRegenerate}
                                        disabled={regenerating}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-feedora-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {regenerating ? 'Régénération…' : 'Régénérer'}
                                    </button>
                                </div>
                            </div>

                            {channels.length > 0 && (
                                <div className="mt-5 flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-semibold text-white/90">Canaux (30j):</span>
                                    {channels.map((c) => (
                                        <span
                                            key={c.channel}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20"
                                        >
                                            {c.channel}: {c.count}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <p className="text-sm font-medium text-gray-600">Entreprises</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatted.companiesTotal}</p>
                            <p className="text-xs text-gray-500 mt-2">Total plateforme</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <p className="text-sm font-medium text-gray-600">Demandes (30j)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatted.requests30d}</p>
                            <p className="text-xs text-gray-500 mt-2">Créées sur la période</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <p className="text-sm font-medium text-gray-600">Feedbacks (30j)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatted.feedbacks30d}</p>
                            <p className="text-xs text-gray-500 mt-2">Réponses reçues</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <p className="text-sm font-medium text-gray-600">Taux de réponse</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatted.responseRate}%</p>
                            <p className="text-xs text-gray-500 mt-2">Feedbacks / demandes (30j)</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatted.avgRating}</p>
                            <p className="text-xs text-gray-500 mt-2">Sur la période</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <p className="text-sm font-medium text-gray-600">Échecs d’envoi</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatted.failed}</p>
                            <p className="text-xs text-gray-500 mt-2">Demandes en statut failed (30j)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <h2 className="text-lg font-bold text-gray-900">Résumé exécutif</h2>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200">
                                        Scope: Global
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{analysis?.summary ?? '—'}</p>
                            {analysis?.note && (
                                <p className="text-xs text-gray-500 mt-3">Note: {analysis.note}</p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Sentiment</h2>
                            <p className="text-xs text-gray-500 mb-4">Répartition sur la période</p>
                            <SentimentDonut
                                positive={sentiment?.positive ?? 0}
                                neutral={sentiment?.neutral ?? 0}
                                negative={sentiment?.negative ?? 0}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Signaux (Radar)</h2>

                            {signals.length === 0 ? (
                                <p className="text-sm text-gray-600">Aucun signal détecté pour cette période.</p>
                            ) : (
                                <div className="space-y-4">
                                    {signals.map((s, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <CategoryBadge category={s.category} />
                                                        <SeverityBadge severity={s.severity} />
                                                    </div>
                                                    <h3 className="mt-2 font-semibold text-gray-900">{s.title}</h3>
                                                </div>
                                                {typeof s.evidence_count === 'number' && (
                                                    <span className="text-xs font-semibold text-gray-600">x{s.evidence_count}</span>
                                                )}
                                            </div>
                                            {s.detail && (
                                                <p className="text-sm text-gray-700 mt-2">{s.detail}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Actions recommandées</h2>

                            {actions.length === 0 ? (
                                <p className="text-sm text-gray-600">Aucune action recommandée disponible.</p>
                            ) : (
                                <div className="space-y-4">
                                    {actions.map((a, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                                                {a.priority && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200">
                                                        {a.priority}
                                                    </span>
                                                )}
                                            </div>
                                            {a.detail && (
                                                <p className="text-sm text-gray-700 mt-2">{a.detail}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Entreprises à risque (30j)</h2>
                        {companiesAtRisk?.length ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600">
                                            <th className="py-2 pr-4">Entreprise</th>
                                            <th className="py-2 pr-4">Score</th>
                                            <th className="py-2 pr-4">Taux négatif</th>
                                            <th className="py-2 pr-4">Taux réponse</th>
                                            <th className="py-2 pr-4">Note moy.</th>
                                            <th className="py-2 pr-4">Demandes</th>
                                            <th className="py-2">Feedbacks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companiesAtRisk.map((c) => (
                                            <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3 pr-4 font-semibold text-gray-900">{c.name}</td>
                                                <td className="py-3 pr-4 text-gray-900">{c.risk_score}</td>
                                                <td className="py-3 pr-4 text-gray-900">{c.negative_rate_30d}%</td>
                                                <td className="py-3 pr-4 text-gray-900">{c.response_rate_30d}%</td>
                                                <td className="py-3 pr-4 text-gray-900">{c.avg_rating_30d ?? '—'}</td>
                                                <td className="py-3 pr-4 text-gray-900">{c.requests_30d}</td>
                                                <td className="py-3 text-gray-900">{c.feedbacks_30d}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">Aucune entreprise à risque détectée.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
