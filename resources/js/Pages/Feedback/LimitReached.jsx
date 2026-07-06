import { Head } from '@inertiajs/react';

export default function LimitReached({ company }) {
    return (
        <>
            <Head title="Limite atteinte" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-5xl mb-4">😔</div>
                    <h1 className="text-xl font-bold text-gray-900 mb-3">
                        Limite mensuelle atteinte
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        <strong>{company}</strong> a atteint sa limite de feedbacks pour ce mois-ci.
                        Merci pour votre intérêt ! Veuillez réessayer le mois prochain.
                    </p>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            Propulsé par Feedora
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
