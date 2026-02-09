import { usePage, Link } from '@inertiajs/react';
import { ExclamationTriangleIcon, BoltIcon } from '@heroicons/react/24/solid';

export default function LowCreditsAlert() {
    const { subscription } = usePage().props;
    const creditsData = subscription?.credits;
    if (!creditsData) {
        return null;
    }

    const rawCredits = creditsData.credits_total_available;
    const credits = Number.isFinite(Number(rawCredits)) ? Number(rawCredits) : 0;
    const lowThreshold = 5;

    // Afficher uniquement si le quota total (mensuel + add-ons) est très bas
    if (credits > lowThreshold) {
        return null;
    }

    return (
        <div className="mx-auto max-w-6xl px-6 mt-4">
            <div className={`${
                credits === 0 ? 'bg-red-500' : 'bg-orange-500'
            } text-white rounded-xl shadow-md p-4 border border-white/20`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            {credits === 0 ? (
                                <ExclamationTriangleIcon className="w-6 h-6" />
                            ) : (
                                <BoltIcon className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-base">
                                {credits === 0 ? 'Crédits épuisés !' : 'Crédits très faibles'}
                            </h4>
                            <p className="text-sm opacity-90">
                                {credits === 0 
                                    ? "Vous n'avez plus de crédits disponibles. Rechargez pour continuer à envoyer des SMS."
                                    : `Il vous reste seulement ${credits.toFixed(2)} unités. Pensez à recharger !`
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('subscription.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                            <BoltIcon className="w-4 h-4" />
                            Acheter add-ons
                        </Link>
                        {subscription?.plan?.slug === 'free' && (
                            <Link
                                href={route('subscription.index')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors text-sm"
                            >
                                Upgrader
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
