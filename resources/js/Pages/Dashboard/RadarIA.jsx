import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import { FileText, Download, TrendingUp, AlertCircle, Target, Lightbulb, Award, Brain, CheckCircle, ListChecks, ClipboardList } from 'lucide-react';
import FeedbackResolutionModal from '@/Components/FeedbackResolutionModal';
import ResolutionBadge from '@/Components/ResolutionBadge';
import axios from 'axios';

export default function RadarIA({ auth, stats, analysis, lastUpdated, period, trends, signals, recommendedActions, channels, benchmarks, healthScore, radarIssues }) {
    const [loading, setLoading] = useState(false);
    const [creatingTask, setCreatingTask] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [resolutionModal, setResolutionModal] = useState(null);
    const [updatedActions, setUpdatedActions] = useState(recommendedActions || []);
    const total = stats?.total || 0;
    const positiveRate = stats?.positiveRate || 0;
    const negativeRate = stats?.negativeRate || 0;
    const neutralRate = total > 0 ? Math.max(0, 100 - positiveRate - negativeRate) : 0;

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        const offStart = router.on('start', start);
        const offFinish = router.on('finish', finish);

        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const handleCreateTask = (action) => {
        if (!action?.title) {
            return;
        }

        const priority = (action.priority || '').toUpperCase();
        const importance = priority === 'P0' ? 'high' : priority === 'P1' ? 'medium' : 'low';

        const contextLines = [];
        if (action.context?.signal_title) {
            contextLines.push(`Signal: ${action.context.signal_title}`);
        }
        if (action.context?.signal_detail) {
            contextLines.push(`Détail: ${action.context.signal_detail}`);
        }
        if (Array.isArray(action.context?.evidence) && action.context.evidence.length) {
            contextLines.push('Exemples:');
            action.context.evidence.slice(0, 3).forEach((e) => {
                contextLines.push(`- ${e}`);
            });
        }

        const description = [action.detail, ...contextLines].filter(Boolean).join('\n');

        // Collecter les feedback_ids liés à cette action
        const feedbackIds = action.context?.feedback_ids || [];

        setCreatingTask(true);

        router.post(
            route('tasks.store'),
            {
                title: action.title,
                description: description || null,
                importance,
                feedback_ids: feedbackIds,
                radar_category: action.context?.category || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Retirer l'action de la liste locale après création
                    setUpdatedActions((prev) => prev.filter((a) => a.title !== action.title));
                },
                onFinish: () => setCreatingTask(false),
            }
        );
    };

    const handleExportPdf = () => {
        setExportingPdf(true);
        window.location.assign(route('radar.export.pdf', { days: period?.days ?? 30 }));
        setTimeout(() => setExportingPdf(false), 2000);
    };

    const handleMarkResolved = (action) => {
        // Ouvrir le modal avec le contexte de l'action
        // Inclure le premier feedback ID pour l'appel API
        const feedbackIds = action.context?.feedback_ids || [];
        setResolutionModal({
            ...action,
            primaryFeedbackId: feedbackIds[0] || null,
        });
    };

    const handleResolveConfirm = async (data) => {
        // L'action a été résolue, mettre à jour la liste
        setUpdatedActions(updatedActions.filter(a => a.id !== data.id));
        router.reload({ preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Radar IA">
            <Head title="Radar IA Pro - Intelligence Décisionnelle" />

            <div className="space-y-6">
                {/* Pro Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                    <div className="relative flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-black text-white">Radar IA Pro</h2>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-orange-600 shadow-lg">
                                        EXCLUSIF PRO
                                    </span>
                                </div>
                                <p className="mt-2 text-white/90 font-medium">Intelligence décisionnelle basée sur vos données clients</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-yellow-300" />
                            <span className="text-white/90 font-semibold">Disponible uniquement en Plan Pro</span>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                        <Spinner />
                        <span>Analyse en cours… merci de patienter quelques secondes.</span>
                    </div>
                )}

                {/* Export Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => window.location.assign(route('radar.export', { days: period?.days ?? 30 }))}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg border border-indigo-200"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={handleExportPdf}
                        disabled={exportingPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {exportingPdf ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Génération...</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                Rapport PDF Pro
                            </>
                        )}
                    </button>
                </div>

                {/* Indicateur de cache */}
                {analysis?.cached && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 text-sm">
                        <strong>✅ Analyse en cache:</strong> Les mêmes feedbacks génèrent instantanément la même analyse. 
                        <span className="block text-xs mt-1 opacity-75">Mise en cache depuis {analysis?.cached_at}</span>
                    </div>
                )}

                {analysis?.status === 'fallback' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
                        <strong>Mode local:</strong> {analysis?.note || 'Analyse IA indisponible, affichage d’une analyse locale.'}
                    </div>
                )}

                {/* Section Insights Stratégiques PRO */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-blue-200 p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Insights Stratégiques</h3>
                            <p className="text-sm text-gray-600">Analyses exclusives pour optimiser vos décisions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Impact Business */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <h4 className="font-bold text-gray-900">Impact Business</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Taux de satisfaction</span>
                                    <span className="font-bold text-green-600">{positiveRate.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Clients à risque</span>
                                    <span className="font-bold text-red-600">{stats?.negative || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Opportunités</span>
                                    <span className="font-bold text-blue-600">{signals?.filter(s => s.category === 'opportunity').length || 0}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-500 italic">
                                {positiveRate > 80 ? "✨ Excellente performance ! Capitalisez sur vos points forts." : 
                                 positiveRate > 60 ? "📊 Performance correcte. Identifiez les axes d'amélioration." :
                                 "⚠️ Attention requise. Priorisez les actions correctives."}
                            </p>
                        </div>

                        {/* Tendances Critiques */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-gray-900">Alertes & Tendances</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Signaux détectés</span>
                                    <span className="font-bold text-orange-600">{signals?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Évolution sentiment</span>
                                    <span className={`font-bold ${trends?.positiveRate?.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {trends?.positiveRate?.delta >= 0 ? '+' : ''}{trends?.positiveRate?.delta?.toFixed(1) || 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Actions urgentes</span>
                                    <span className="font-bold text-red-600">{recommendedActions?.filter(a => a.priority === 'P0').length || 0}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-500 italic">
                                {signals?.length > 5 ? "🚨 Plusieurs signaux nécessitent votre attention immédiate." :
                                 signals?.length > 0 ? "👀 Surveillez les tendances émergentes." :
                                 "✅ Aucun signal critique. Continuez votre stratégie actuelle."}
                            </p>
                        </div>

                        {/* Recommandations Prioritaires */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Target className="w-5 h-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-900">Actions à Prendre</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Haute priorité (P0)</span>
                                    <span className="font-bold text-red-600">{recommendedActions?.filter(a => a.priority === 'P0').length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Priorité moyenne (P1)</span>
                                    <span className="font-bold text-orange-600">{recommendedActions?.filter(a => a.priority === 'P1').length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">À planifier (P2)</span>
                                    <span className="font-bold text-blue-600">{recommendedActions?.filter(a => a.priority === 'P2').length || 0}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-500 italic">
                                💡 Suivez nos recommandations pour améliorer votre score de satisfaction de {positiveRate > 70 ? '+5 à 10%' : '+15 à 25%'}.
                            </p>
                        </div>
                    </div>

                    {/* Synthèse IA des problèmes */}
                    <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-amber-400" />
                            <h4 className="text-lg font-bold">Synthèse IA</h4>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">Généré automatiquement</span>
                        </div>
                        <p className="text-white/90 leading-relaxed text-sm">
                            {analysis?.summary || 'Aucune synthèse disponible pour le moment. Ajoutez des feedbacks pour activer l\'analyse IA.'}
                        </p>
                        {analysis?.keyIssues?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs font-semibold text-amber-400 mb-2">Problèmes principaux identifiés :</p>
                                <ul className="space-y-1">
                                    {analysis.keyIssues.slice(0, 4).map((issue, idx) => (
                                        <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                                            <span className="text-amber-400 mt-0.5">•</span>
                                            <span><strong>{issue.title}</strong>{issue.count ? ` (${issue.count} mentions)` : ''} — {issue.detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysis?.confidence && (
                            <p className="mt-3 text-xs text-white/50">Confiance: {analysis.confidence}</p>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Feedbacks analysés" value={total} tone="blue" />
                    <StatCard title="Positifs" value={stats?.positive || 0} tone="emerald" />
                    <StatCard title="Négatifs" value={stats?.negative || 0} tone="rose" />
                    <StatCard title="Neutres" value={stats?.neutral || 0} tone="amber" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900">Résumé exécutif</h3>
                        <p className="text-sm text-gray-600 mt-1">Synthèse orientée décision</p>
                        <p className="mt-4 text-gray-700 leading-relaxed">{analysis?.summary || '—'}</p>
                        {analysis?.note && (
                            <p className="text-xs text-gray-500 mt-3">Note: {analysis.note}</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Sentiment</h3>
                        <p className="text-xs text-gray-500">Répartition sur la période</p>
                        <div className="mt-4">
                            <SentimentDonut
                                positive={stats?.positive || 0}
                                neutral={stats?.neutral || 0}
                                negative={stats?.negative || 0}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">Tendances clés</h3>
                            <span className="text-xs text-gray-500">Vs période précédente</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <TrendCard label="Taux positif" value={trends?.positiveRate?.current} delta={trends?.positiveRate?.delta} unit="%" />
                            <TrendCard label="Taux négatif" value={trends?.negativeRate?.current} delta={trends?.negativeRate?.delta} unit="%" inverse />
                            <TrendCard label="Taux de réponse" value={trends?.responseRate?.current} delta={trends?.responseRate?.delta} unit="%" />
                            <TrendCard label="Note moyenne" value={trends?.avgRating?.current} delta={trends?.avgRating?.delta} unit="" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Health Score</h3>
                        <p className="text-xs text-gray-500">Synthèse globale (0–100)</p>
                        <div className="mt-4">
                            <HealthScoreCard score={healthScore?.score} drivers={healthScore?.drivers} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Benchmarks internes</h3>
                    <p className="text-xs text-gray-500">Comparaison anonyme vs autres entreprises</p>
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600">
                                    <th className="py-2 pr-4">Métrique</th>
                                    <th className="py-2 pr-4">Vous</th>
                                    <th className="py-2 pr-4">Médiane</th>
                                    <th className="py-2">Percentile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(benchmarks || {}).map((b) => (
                                    <tr key={b.label} className="border-t border-gray-100">
                                        <td className="py-3 pr-4 font-semibold text-gray-900">{b.label}</td>
                                        <td className="py-3 pr-4 text-gray-900">{b.company ?? '—'}</td>
                                        <td className="py-3 pr-4 text-gray-900">{b.median ?? '—'}</td>
                                        <td className="py-3 text-gray-900">{b.percentile !== null ? `${b.percentile}%` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Canaux (30j)</h3>
                    <p className="text-xs text-gray-500">Distribution des demandes</p>
                    <div className="mt-4">
                        <ChannelBars channels={channels} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Signals */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Signaux détectés</h3>
                            <span className="text-xs text-gray-500">Anomalies & opportunités</span>
                        </div>
                        {signals?.length ? (
                            <ul className="mt-4 space-y-3">
                                {signals.map((signal, idx) => (
                                    <li key={`${signal.title}-${idx}`} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <CategoryBadge category={signal.category} />
                                                    <SeverityBadge severity={signal.severity} />
                                                </div>
                                                <p className="mt-2 font-semibold text-gray-900">{signal.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{signal.detail}</p>
                                                {signal.evidence?.length ? (
                                                    <div className="mt-3 space-y-2">
                                                        <p className="text-xs font-semibold text-gray-500">Exemples</p>
                                                        {signal.evidence.map((e, eidx) => (
                                                            <div key={`${signal.title}-e-${eidx}`} className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
                                                                “{e}”
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                            {typeof signal.evidence_count === 'number' && (
                                                <p className="text-xs text-gray-500">x{signal.evidence_count}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">Aucun signal critique détecté.</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Actions recommandées</h3>
                            <span className="text-xs text-gray-500">Priorisées</span>
                        </div>
                        {recommendedActions?.length ? (
                            <ul className="mt-4 space-y-3">
                                {recommendedActions.map((action, idx) => (
                                    <li key={`${action.title}-${idx}`} className="p-4 border border-gray-100 rounded-lg bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900">{action.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{action.detail}</p>
                                                {action.context?.feedback_ids?.length > 0 && (
                                                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                        🔗 {action.context.feedback_ids.length} feedback{action.context.feedback_ids.length > 1 ? 's' : ''} liés
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {action.priority && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                                        {action.priority}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={creatingTask}
                                                    onClick={() => handleCreateTask(action)}
                                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                                                >
                                                    Créer une tâche
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkResolved(action)}
                                                    className="text-xs font-semibold text-green-600 hover:text-green-800 flex items-center gap-1 whitespace-nowrap"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Résolu
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500">Aucune action prioritaire pour l’instant.</p>
                        )}
                    </div>
                </div>

                {/* Key Issues Only */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Problèmes détectés & Actions requises</h3>
                        <span className="text-xs text-gray-500">{updatedActions?.length > 0 ? `${updatedActions.length} actions` : 'Aucune action'}</span>
                    </div>
                    {updatedActions?.length ? (
                        <ul className="mt-4 space-y-3">
                            {updatedActions.map((issue, idx) => (
                                <li key={`${issue.title}-${idx}`} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{issue.title}</p>
                                            <p className="text-sm text-gray-600 mt-1">{issue.detail}</p>
                                            {issue.context?.example && (
                                                <p className="text-xs text-gray-500 mt-2 italic">Ex: {issue.context.example}</p>
                                            )}
                                            {issue.context?.feedback_ids?.length > 0 && (
                                                <p className="text-xs text-indigo-600 mt-1 font-medium">
                                                    🔗 {issue.context.feedback_ids.length} feedback{issue.context.feedback_ids.length > 1 ? 's' : ''} liés — seront exclus de la prochaine analyse
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {issue.priority && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-2">
                                                    {issue.priority}
                                                </span>
                                            )}
                                            {issue.context?.mentions && (
                                                <p className="text-xs text-gray-500 mt-2">{issue.context.mentions} mentions</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button 
                                            type="button"
                                            disabled={creatingTask}
                                            onClick={() => handleCreateTask(issue)}
                                            className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50"
                                        >
                                            Créer une tâche
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleMarkResolved(issue)}
                                            className="text-xs px-3 py-1 rounded bg-green-100 text-green-600 hover:bg-green-200"
                                        >
                                            Résolu
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-sm text-gray-500">Aucun problème majeur détecté pour l’instant.</p>
                    )}
                </div>

                {/* Radar Issues Tracker - Problèmes pris en charge */}
                {radarIssues?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Problèmes pris en charge</h3>
                                    <p className="text-xs text-gray-500">
                                        {radarIssues.filter(i => i.status === 'resolved').length} résolus · {radarIssues.filter(i => i.status === 'task_created').length} en cours
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {radarIssues.map((issue) => (
                                <div key={issue.id} className={`p-4 rounded-lg border ${
                                    issue.status === 'resolved' 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-blue-200 bg-blue-50'
                                }`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-gray-900">{issue.title}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    issue.severity === 'P0' ? 'bg-rose-100 text-rose-700' : 
                                                    issue.severity === 'P1' ? 'bg-amber-100 text-amber-700' : 
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {issue.severity}
                                                </span>
                                                {issue.category && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                                        {issue.category}
                                                    </span>
                                                )}
                                            </div>
                                            {issue.description && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{issue.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>📋 {issue.feedback_count} feedback{issue.feedback_count > 1 ? 's' : ''} liés</span>
                                                <span>📅 Détecté le {issue.detected_at}</span>
                                                {issue.resolved_at && <span>✅ Résolu le {issue.resolved_at}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {issue.status === 'resolved' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Résolu
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    <ListChecks className="w-3.5 h-3.5" /> Tâche en cours
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-700">
                            <strong>💡 Info:</strong> Les feedbacks liés à ces problèmes sont automatiquement exclus des prochaines analyses IA. 
                            Si un nouveau feedback mentionne le même problème, il sera détecté normalement.
                        </div>
                    </div>
                )}

                {/* Modal de résolution */}
                {resolutionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Marquer comme résolu</h2>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                <strong>Action:</strong><br/>
                                {resolutionModal.title}
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const note = e.target.note?.value || '';
                                
                                if (!resolutionModal.primaryFeedbackId) {
                                    console.error('Pas d\'ID de feedback trouvé');
                                    return;
                                }
                                
                                try {
                                    await axios.post(
                                        route('feedback.resolve', resolutionModal.primaryFeedbackId),
                                        { resolution_note: note },
                                    );

                                    // Succès - mettre à jour la liste locale et fermer le modal
                                    setUpdatedActions(updatedActions.filter(a => a.title !== resolutionModal.title));
                                    setResolutionModal(null);
                                    
                                    // Recharger la page pour rafraîchir les données
                                    router.reload({ preserveScroll: true });
                                } catch (error) {
                                    console.error('Erreur lors de la résolution:', error);
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Note de résolution (optionnel)
                                    </label>
                                    <textarea
                                        name="note"
                                        placeholder="Ex: Problème résolu - mesures prises..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        rows="3"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setResolutionModal(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Valider
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
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
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-200"
                        strokeWidth="6"
                    />

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

                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-rose-500"
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

function StatCard({ title, value, tone }) {
    const tones = {
        blue: 'from-blue-500 to-indigo-600',
        emerald: 'from-emerald-500 to-teal-600',
        rose: 'from-rose-500 to-pink-600',
        amber: 'from-amber-400 to-orange-500',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600">{title}</p>
            <div className="flex items-center justify-between mt-3">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tones[tone]} opacity-90`} />
            </div>
        </div>
    );
}

function TrendCard({ label, value, delta, unit = '', inverse = false }) {
    const numeric = typeof value === 'number' ? value : null;
    const deltaNumber = typeof delta === 'number' ? delta : null;
    const isPositive = deltaNumber !== null ? deltaNumber >= 0 : null;
    const tone = isPositive === null
        ? 'text-gray-500'
        : (inverse ? !isPositive : isPositive)
            ? 'text-emerald-600'
            : 'text-rose-600';

    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-600">{label}</p>
            <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold text-gray-900">
                    {numeric === null ? '—' : `${numeric}${unit}`}
                </p>
                {deltaNumber !== null ? (
                    <span className={`text-xs font-semibold ${tone}`}>
                        {deltaNumber >= 0 ? '▲' : '▼'} {Math.abs(deltaNumber)}{unit}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
            </div>
        </div>
    );
}

function ChannelBars({ channels }) {
    if (!channels?.length) {
        return <p className="text-sm text-gray-500">Aucune donnée disponible.</p>;
    }

    const max = Math.max(...channels.map((c) => c.count), 1);

    return (
        <div className="space-y-3">
            {channels.map((c) => (
                <div key={c.channel}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span className="uppercase tracking-wide">{c.channel}</span>
                        <span className="font-semibold text-gray-900">{c.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.round((c.count / max) * 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function HealthScoreCard({ score, drivers }) {
    const value = typeof score === 'number' ? score : null;
    const tone = value === null
        ? 'bg-gray-200'
        : value >= 80
            ? 'bg-emerald-500'
            : value >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
                    <p className="text-xs text-gray-500">Score global</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Drivers</p>
                    <p className="text-xs text-gray-600">Note / Négatif / Réponse / Échecs</p>
                </div>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                    className={`h-full ${tone}`}
                    style={{ width: `${value ?? 0}%` }}
                />
            </div>
            {drivers && (
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>Score note: <span className="font-semibold text-gray-900">{drivers.rating_score ?? '—'}</span></div>
                    <div>Pénalité négatif: <span className="font-semibold text-gray-900">{drivers.negative_penalty ?? '—'}</span></div>
                    <div>Pénalité réponse: <span className="font-semibold text-gray-900">{drivers.response_penalty ?? '—'}</span></div>
                    <div>Pénalité échecs: <span className="font-semibold text-gray-900">{drivers.failed_penalty ?? '—'}</span></div>
                </div>
            )}
        </div>
    );
}

function ImpactBadge({ impact }) {
    const map = {
        faible: 'bg-green-100 text-green-700',
        moyen: 'bg-amber-100 text-amber-700',
        fort: 'bg-rose-100 text-rose-700',
    };
    const tone = map[impact] || 'bg-gray-100 text-gray-600';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tone}`}>
            {impact || '—'}
        </span>
    );
}

function SeverityBadge({ severity }) {
    const normalized = (severity || '').toLowerCase();
    const style =
        normalized === 'high'
            ? 'bg-rose-100 text-rose-700'
            : normalized === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700';

    const label = normalized === 'high' ? 'High' : normalized === 'medium' ? 'Medium' : 'Low';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
            {label}
        </span>
    );
}

function CategoryBadge({ category }) {
    const normalized = (category || '').toLowerCase();
    const style =
        normalized === 'risk'
            ? 'bg-rose-100 text-rose-700'
            : normalized === 'ops'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-violet-100 text-violet-700';
    const label = normalized === 'risk' ? 'Risk' : normalized === 'ops' ? 'Ops' : 'Opportunity';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
            {label}
        </span>
    );
}

function Spinner() {
    return (
        <span className="relative flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
            <span className="relative inline-flex h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </span>
    );
}
