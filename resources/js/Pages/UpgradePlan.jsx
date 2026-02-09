import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function UpgradePlan({ currentPlan, newPlan, subscription }) {
    const handleConfirm = () => {
        // Soumettre le formulaire d'upgrade
        document.getElementById('upgrade-form').submit();
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Confirmer l'upgrade
                </h2>
            }
        >
            <Head title="Confirmer l'upgrade" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        
                        {/* Plan Actuel → Nouveau Plan */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Récapitulatif de l'upgrade</h3>
                            
                            <div className="flex items-center justify-between">
                                {/* Current Plan */}
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                                        <p className="text-sm text-gray-600 mb-2">Plan actuel</p>
                                        <h4 className="text-2xl font-bold text-gray-900 mb-3">
                                            {currentPlan?.name || 'Aucun'}
                                        </h4>
                                        
                                        {currentPlan && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-700">
                                                    <strong>{currentPlan.credits_monthly}</strong> unités/mois
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    {currentPlan.price === 0 ? 'Gratuit' : `${currentPlan.price}€/mois`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="mx-6 flex flex-col items-center">
                                    <ArrowRight className="w-6 h-6 text-feedora-500 mb-2" />
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Upgrade</p>
                                </div>

                                {/* New Plan */}
                                <div className="flex-1">
                                    <div className="bg-gradient-to-br from-feedora-50 to-feedora-100 rounded-xl p-6 border-2 border-feedora-400 shadow-lg">
                                        <p className="text-sm text-feedora-600 mb-2 font-semibold">Nouveau plan</p>
                                        <h4 className="text-2xl font-bold text-feedora-600 mb-3">
                                            {newPlan.name}
                                        </h4>
                                        
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-700">
                                                <strong>{newPlan.credits_monthly}</strong> unités/mois
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                {newPlan.price === 0 ? 'Gratuit' : `${newPlan.price}€/mois`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Avantages du nouveau plan */}
                        <div className="mb-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Vous aurez accès à :
                            </h4>
                            
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            <Zap className="w-4 h-4 inline text-amber-500 mr-1" />
                                            {newPlan.credits_monthly} unités de crédits par mois
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Approximativement {Math.round(newPlan.credits_monthly)} SMS France ou {Math.round(newPlan.credits_monthly / 4.44)} SMS Maroc
                                        </p>
                                    </div>
                                </div>

                                {newPlan.features?.ai_reply_generation && (
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">Génération IA de réponses</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Générez automatiquement des réponses professionnelles à vos feedbacks
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {newPlan.features?.radar_ai && (
                                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-gray-900">🧠 Radar IA</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Obtenez des insights détaillés et des recommandations basées sur vos feedbacks
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Dashboard complet</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Accédez à tous les outils de gestion et d'analyse
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info importante */}
                        <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>ℹ️ À savoir :</strong> Votre upgrade prendra effet immédiatement. Vos crédits mensuels seront réinitialisés selon le nouveau plan.
                            </p>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-4">
                            <Link
                                href={route('subscription.index')}
                                className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Annuler
                            </Link>
                            
                            <form 
                                id="upgrade-form"
                                method="POST" 
                                action={route('stripe.checkout.plan', { planId: newPlan.id })}
                                className="flex-1"
                            >
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                <button
                                    type="submit"
                                    className="w-full bg-feedora-600 hover:bg-feedora-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Procéder au paiement
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
