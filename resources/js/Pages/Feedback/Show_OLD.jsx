import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Show({ token, company, customer, feedback, status, isAdmin }) {
    const { data, setData, post, processing, reset } = useForm({
        rating: feedback?.rating || '',
        comment: feedback?.comment || '',
    });

    const [hoveredStar, setHoveredStar] = useState(0);

    const submit = (e) => {
        e.preventDefault();
        post(route('feedback.store', token), { 
            onFinish: () => reset(),
            onSuccess: () => {
                // Optionnel : afficher un message de succès
            }
        });
    };

    // Admin ou feedback déjà complété → afficher détails
    if (isAdmin || status === 'completed') {
        return (
            <>
                <Head title={`Feedback - ${customer}`} />
                
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Feedback reçu
                            </h1>
                            {isAdmin && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Mode Admin
                                </span>
                            )}
                        </div>

                        {/* Card principale */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            {/* Header de la card */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium mb-1">Client</p>
                                        <h2 className="text-2xl font-bold text-white">{customer}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-100 text-sm font-medium mb-1">Entreprise</p>
                                        <p className="text-white font-semibold">{company}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-8 space-y-8">
                                {/* Note */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Évaluation</h3>
                                        {feedback?.rating && (
                                            <span className={`px-4 py-2 rounded-xl font-bold text-lg ${
                                                feedback.rating >= 4 ? 'bg-green-100 text-green-700' :
                                                feedback.rating === 3 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {feedback.rating}/5
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {feedback?.rating ? (
                                            <>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        className={`w-10 h-10 ${
                                                            star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                ))}
                                                <span className="ml-3 text-2xl font-bold text-gray-900">
                                                    {feedback.rating === 5 ? 'Excellent !' :
                                                     feedback.rating === 4 ? 'Très bien' :
                                                     feedback.rating === 3 ? 'Bien' :
                                                     feedback.rating === 2 ? 'Moyen' :
                                                     'À améliorer'}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">Aucune note attribuée</span>
                                        )}
                                    </div>
                                </div>

                                {/* Commentaire */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Commentaire</h3>
                                    {feedback?.comment ? (
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                <p className="text-gray-700 leading-relaxed flex-1">
                                                    "{feedback.comment}"
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-gray-400 italic">Aucun commentaire laissé</p>
                                        </div>
                                    )}
                                </div>

                                {isAdmin && (
                                <div className="pt-6 border-t border-gray-200 flex justify-center">
                                    <Link
                                        href={route('feedback.replies.index', feedback.id)}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                                                bg-blue-600 text-white font-semibold shadow
                                                hover:bg-blue-700 transition"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 10h8m-8 4h6m-9 5h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Répondre au feedback
                                    </Link>
                                </div>
                            )}


                                {/* Statut badge */}
                                <div className="flex items-center justify-center pt-6 border-t border-gray-200">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Feedback complété
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Merci message */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Merci d'avoir pris le temps de partager votre expérience
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Formulaire pour le client
    return (
        <>
            <Head title={`Votre avis - ${company}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Votre avis compte !
                        </h1>
                        <p className="text-gray-600">
                            Partagez votre expérience avec {company}
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Demande pour</p>
                                    <p className="text-white text-lg font-bold">{customer}</p>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <div className="p-8">
                            <div className="space-y-8">
                                {/* Sélection des étoiles */}
                                <div>
                                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                                        Comment évaluez-vous votre expérience ? *
                                    </label>
                                    
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setData('rating', star)}
                                                    onMouseEnter={() => setHoveredStar(star)}
                                                    onMouseLeave={() => setHoveredStar(0)}
                                                    className="transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                    <svg
                                                        className={`w-14 h-14 transition-colors ${
                                                            star <= (hoveredStar || data.rating)
                                                                ? 'text-yellow-400'
                                                                : 'text-gray-300'
                                                        }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>

                                        {data.rating && (
                                            <div className="text-center">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-lg ${
                                                    data.rating >= 4 ? 'bg-green-100 text-green-700' :
                                                    data.rating === 3 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {data.rating}/5 - {
                                                        data.rating === 5 ? 'Excellent !' :
                                                        data.rating === 4 ? 'Très bien' :
                                                        data.rating === 3 ? 'Bien' :
                                                        data.rating === 2 ? 'Moyen' :
                                                        'À améliorer'
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {!data.rating && (
                                            <p className="text-sm text-gray-500 text-center">
                                                Cliquez sur les étoiles pour évaluer
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Commentaire */}
                                <div>
                                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                                        Partagez-nous votre expérience (optionnel)
                                    </label>
                                    
                                    <div className="relative">
                                        <textarea
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            rows={5}
                                            placeholder="Qu'avez-vous aimé ? Comment pouvons-nous nous améliorer ?"
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                            {data.comment.length} caractères
                                        </div>
                                    </div>
                                    
                                    <p className="mt-2 text-sm text-gray-500 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Vos commentaires nous aident à améliorer nos services
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 border-t border-gray-200">
                                    <PrimaryButton
                                        onClick={submit}
                                        disabled={processing || !data.rating}
                                        className="w-full justify-center py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Envoi en cours...
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Envoyer mon feedback
                                            </>
                                        )}
                                    </PrimaryButton>

                                    {!data.rating && (
                                        <p className="mt-3 text-center text-sm text-red-600">
                                            Veuillez sélectionner une note avant d'envoyer
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Vos données sont sécurisées et confidentielles
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}