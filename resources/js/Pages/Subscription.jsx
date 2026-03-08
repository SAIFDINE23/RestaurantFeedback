import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CreditCard, TrendingUp, Zap, AlertCircle, Gift, Calendar, Clock, AlertTriangle, XCircle } from 'lucide-react';

export default function Subscription({ auth, subscription, credits, plans }) {
    const currentPlan = subscription?.plan;
    const planRank = { free: 0, basic: 1, pro: 2 };
    const currentRank = currentPlan?.slug ? (planRank[currentPlan.slug] ?? -1) : -1;
    const isPastDue = subscription?.status === 'past_due';
    const isCanceled = subscription?.status === 'canceled';
    const cancelAtPeriodEnd = subscription?.cancel_at_period_end === true;
    const hasStripeSubscription = subscription?.has_stripe_subscription === true;
    const availableUpgradePlans = plans.filter((p) => {
        if (!currentPlan) {
            return true;
        }

        const rank = p.slug ? (planRank[p.slug] ?? -1) : -1;
        return rank > currentRank;
    });

    const creditsPercentage = (credits && currentPlan) ? 
        (credits.credits_available_monthly / currentPlan.credits_monthly * 100) : 0;

    // Calculer le nombre de jours restants
    const calculateDaysRemaining = () => {
        if (!subscription?.ends_at) return null;
        const endDate = new Date(subscription.ends_at);
        const today = new Date();
        const daysRemaining = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
        return daysRemaining > 0 ? daysRemaining : 0;
    };

    const daysRemaining = calculateDaysRemaining();

    // Déterminer la couleur du badge basé sur les jours restants
    const getStatusColor = () => {
        if (daysRemaining === null) return 'gray';
        if (daysRemaining === 0) return 'red';
        if (daysRemaining <= 7) return 'orange';
        if (daysRemaining <= 30) return 'amber';
        return 'green';
    };

    const statusColor = getStatusColor();
    const colorClasses = {
        red: 'bg-red-50 border-red-200 text-red-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        amber: 'bg-amber-50 border-amber-200 text-amber-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        gray: 'bg-gray-50 border-gray-200 text-gray-800'
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Abonnement & Crédits
                </h2>
            }
        >
            <Head title="Abonnement & Crédits" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    
                    {!subscription ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                            <p className="text-red-800 font-semibold">
                                ⚠️ Aucune subscription trouvée. Veuillez contacter le support.
                            </p>
                        </div>
                    ) : null}

                    {/* Alerte si expiration imminente */}
                    {subscription && daysRemaining !== null && daysRemaining <= 7 && !isPastDue && !cancelAtPeriodEnd && (
                        <div className={`border-2 rounded-lg p-6 mb-6 flex items-start gap-3 ${
                            daysRemaining === 0 
                                ? 'bg-red-50 border-red-300' 
                                : 'bg-orange-50 border-orange-300'
                        }`}>
                            <AlertCircle className={`w-6 h-6 flex-shrink-0 ${
                                daysRemaining === 0 
                                    ? 'text-red-600' 
                                    : 'text-orange-600'
                            }`} />
                            <div>
                                <p className={`font-bold ${
                                    daysRemaining === 0 
                                        ? 'text-red-900' 
                                        : 'text-orange-900'
                                }`}>
                                    {daysRemaining === 0 
                                        ? '🚨 Votre abonnement expire aujourd\'hui !' 
                                        : `⏰ Votre abonnement expire dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`}
                                </p>
                                <p className={`text-sm mt-1 ${
                                    daysRemaining === 0 
                                        ? 'text-red-800' 
                                        : 'text-orange-800'
                                }`}>
                                    Renouvelez votre abonnement pour continuer à utiliser Feedora sans interruption.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Alerte paiement échoué (past_due) */}
                    {isPastDue && (
                        <div className="border-2 border-red-400 bg-red-50 rounded-lg p-6 mb-6 flex items-start gap-3">
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-red-900">
                                    🚨 Paiement échoué — Votre abonnement est en attente de régularisation
                                </p>
                                <p className="text-sm text-red-800 mt-1">
                                    Votre dernier paiement a échoué. Veuillez mettre à jour votre méthode de paiement 
                                    via le portail Stripe pour éviter la suspension de votre abonnement.
                                </p>
                                {hasStripeSubscription && (
                                    <a
                                        href={route('subscription.portal')}
                                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Mettre à jour le paiement
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Alerte annulation programmée */}
                    {cancelAtPeriodEnd && !isCanceled && (
                        <div className="border-2 border-amber-400 bg-amber-50 rounded-lg p-6 mb-6 flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-amber-900">
                                    📋 Annulation programmée
                                </p>
                                <p className="text-sm text-amber-800 mt-1">
                                    Votre abonnement sera annulé à la fin de la période en cours
                                    {daysRemaining !== null && daysRemaining > 0 && (
                                        <> (dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''})</>  
                                    )}. Vous conservez l'accès à toutes les fonctionnalités jusqu'à cette date.
                                    Vous pouvez réactiver votre abonnement depuis le portail Stripe.
                                </p>
                                {hasStripeSubscription && (
                                    <a
                                        href={route('subscription.portal')}
                                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-sm"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Réactiver l'abonnement
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Section Plan Actuel */}
                    {subscription && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Actuel</h3>
                            
                            <div className="bg-gradient-to-br from-feedora-50 to-feedora-100 rounded-2xl border-2 border-feedora-200 p-8 shadow-lg">
                                <div className="grid md:grid-cols-3 gap-8">
                                    {/* Infos Plan */}
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-3xl font-bold text-feedora-600 mb-2">
                                                    {currentPlan?.name}
                                                </h4>
                                                <p className="text-gray-600">
                                                    {currentPlan?.description}
                                                </p>
                                            </div>
                                            
                                            {/* Badge Jours Restants */}
                                            {daysRemaining !== null && (
                                                <div className={`border rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap ${colorClasses[statusColor]}`}>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {daysRemaining === 0 
                                                                ? 'Expire aujourd\'hui !' 
                                                                : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                <strong className="text-feedora-600">Tarif:</strong>{' '}
                                                {currentPlan?.price === 0
                                                    ? 'Gratuit'
                                                    : (currentPlan?.price != null ? `${currentPlan?.price}€/mois` : '—')}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong className="text-feedora-600">Quota mensuel:</strong>{' '}
                                                {currentPlan?.credits_monthly ?? 0} unités (~{currentPlan?.credits_monthly ?? 0} SMS France)
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong className="text-feedora-600">Utilisateurs:</strong>{' '}
                                                {currentPlan?.max_users === null ? 'Illimités' : (currentPlan?.max_users ?? '—')}
                                            </p>
                                            {currentPlan?.max_feedbacks !== null && (
                                                <p className="text-sm text-gray-600">
                                                    <strong className="text-feedora-600">Feedbacks restants:</strong>{' '}
                                                    {subscription?.limits?.feedbacks_remaining ?? 0} / {currentPlan?.max_feedbacks}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Crédits */}
                                    <div className="md:col-span-2">
                                        <div className="bg-white rounded-xl p-6 shadow-md">
                                            <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-amber-500" />
                                                Vos Crédits
                                            </h5>

                                            {/* Barre de progression - QUOTA MENSUEL */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        📅 Quota Mensuel (expire)
                                                    </span>
                                                    <span className="text-lg font-bold text-blue-600">
                                                        {credits?.credits_available_monthly || 0} / {currentPlan?.credits_monthly ?? 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all ${
                                                            creditsPercentage > 20 
                                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                        }`}
                                                        style={{ width: `${creditsPercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Barre de progression - ADD-ONS */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        💎 Réserve Add-ons (permanente)
                                                    </span>
                                                    <span className="text-lg font-bold text-emerald-600">
                                                        {credits?.credits_addon_balance || 0}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                                                        style={{ width: `${credits?.credits_addon_balance > 0 ? '100' : '0'}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Détails crédits */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                                                    <p className="text-2xl font-bold text-emerald-600">
                                                        {credits?.credits_available_monthly || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">Disponibles</p>
                                                </div>
                                                
                                                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                                                    <p className="text-2xl font-bold text-amber-600">
                                                        {credits?.credits_used_monthly || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">Utilisés</p>
                                                </div>
                                                
                                                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {credits?.credits_addon_balance || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">Add-ons</p>
                                                </div>
                                            </div>

                                            {/* Alerte si crédits faibles */}
                                            {creditsPercentage < 20 && creditsPercentage > 0 && (
                                                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-900">
                                                            Crédits faibles
                                                        </p>
                                                        <p className="text-xs text-amber-700 mt-1">
                                                            Vous avez {creditsPercentage.toFixed(0)}% de vos crédits. Considérez l'upgrade ou l'achat d'add-ons.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {credits && credits.credits_total_available === 0 && (
                                                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-red-900">
                                                            Crédits épuisés
                                                        </p>
                                                        <p className="text-xs text-red-700 mt-1">
                                                            Vous n'avez plus de crédits. Upgrader votre plan ou acheter des add-ons pour continuer.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton Gérer Abonnement (si abonnement Stripe actif) */}
                            {subscription && hasStripeSubscription && currentPlan?.slug !== 'free' && !isCanceled && (
                                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Gérez votre abonnement, méthode de paiement, factures et annulation depuis le portail Stripe
                                        </p>
                                    </div>
                                    <a
                                        href={route('subscription.portal')}
                                        className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${
                                            isPastDue 
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        {isPastDue ? 'Régulariser le paiement' : 'Gérer l\'abonnement'}
                                    </a>
                                </div>
                            )}

                            {/* Info pour plan free (pas de Stripe subscription) */}
                            {currentPlan?.slug === 'free' && !hasStripeSubscription && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        Vous êtes sur le plan gratuit. Upgrader ci-dessous pour débloquer toutes les fonctionnalités.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section Upgrade */}
                    {availableUpgradePlans.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Upgrader votre plan</h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                {availableUpgradePlans.map((plan) => (
                                    <div 
                                        key={plan.id}
                                        className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-feedora-400 hover:shadow-xl transition-all p-6"
                                    >
                                        <h4 className="text-2xl font-bold text-gray-900 mb-2">
                                            {plan.name}
                                        </h4>
                                        
                                        <p className="text-gray-600 mb-4">
                                            {plan.description}
                                        </p>

                                        <div className="mb-6 pt-6 border-t border-gray-200">
                                            <p className="text-4xl font-bold text-feedora-600 mb-2">
                                                {plan.price}€<span className="text-lg text-gray-600">/mois</span>
                                            </p>
                                            
                                            <div className="space-y-3 mt-4">
                                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                    <strong>{plan.credits_monthly}</strong> unités/mois (~{plan.credits_monthly} SMS France)
                                                </p>
                                                
                                                {plan.features?.ai_reply_generation && (
                                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        Génération IA de réponses
                                                    </p>
                                                )}
                                                
                                                {plan.features?.radar_ai && (
                                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        🧠 Radar IA
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Link
                                            href={route('subscription.upgrade', { planId: plan.id })}
                                            className="block w-full text-center bg-feedora-600 hover:bg-feedora-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                                        >
                                            Upgrader vers {plan.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section Add-ons */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-pink-500" />
                            Recharges SMS (Add-ons)
                        </h3>
                        
                        <p className="text-gray-600 mb-6">
                            Besoin de plus d'unités ? Achetez des recharges ponctuelles qui ne dépendent pas de votre abonnement.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Add-on 1 */}
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-feedora-400 transition-all p-6 text-center">
                                <p className="text-3xl font-bold text-gray-900">10€</p>
                                <p className="text-lg font-semibold text-feedora-600 mt-2">+100 unités</p>
                                <p className="text-sm text-gray-600 mt-1">~100 SMS France</p>
                                <p className="text-xs text-emerald-600 font-semibold mt-2">🔒 Validité illimitée</p>
                                <form
                                    method="POST"
                                    action={route('stripe.checkout.addon', { addonId: '100' })}
                                    className="mt-4"
                                >
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                    <button
                                        type="submit"
                                        className="w-full bg-feedora-600 hover:bg-feedora-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Acheter
                                    </button>
                                </form>
                            </div>

                            {/* Add-on 2 */}
                            <div className="bg-gradient-to-br from-feedora-50 to-feedora-100 rounded-2xl shadow-lg border-2 border-feedora-400 p-6 text-center relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-feedora-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    MEILLEUR RAPPORT
                                </div>
                                <p className="text-3xl font-bold text-feedora-600">25€</p>
                                <p className="text-lg font-semibold text-feedora-700 mt-2">+300 unités</p>
                                <p className="text-sm text-gray-600 mt-1">~300 SMS France</p>
                                <p className="text-xs text-emerald-600 font-semibold mt-2">🔒 Validité illimitée</p>
                                <form
                                    method="POST"
                                    action={route('stripe.checkout.addon', { addonId: '300' })}
                                    className="mt-4"
                                >
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                    <button
                                        type="submit"
                                        className="w-full bg-feedora-600 hover:bg-feedora-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Acheter
                                    </button>
                                </form>
                            </div>

                            {/* Add-on 3 */}
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:border-feedora-400 transition-all p-6 text-center">
                                <p className="text-3xl font-bold text-gray-900">70€</p>
                                <p className="text-lg font-semibold text-feedora-600 mt-2">+1000 unités</p>
                                <p className="text-sm text-gray-600 mt-1">~1000 SMS France</p>
                                <p className="text-xs text-emerald-600 font-semibold mt-2">🔒 Validité illimitée</p>
                                <form
                                    method="POST"
                                    action={route('stripe.checkout.addon', { addonId: '1000' })}
                                    className="mt-4"
                                >
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                    <button
                                        type="submit"
                                        className="w-full bg-feedora-600 hover:bg-feedora-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Acheter
                                    </button>
                                </form>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            💡 Les unités des add-ons <strong>n'expirent jamais</strong> et sont utilisées après votre quota mensuel
                        </p>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
