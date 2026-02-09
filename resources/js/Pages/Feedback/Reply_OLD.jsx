import { useState } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { useHasFeature } from '@/Components/FeatureLock';

export default function Reply({ feedback }) {
    const { props } = usePage();
    const { data, setData, post, processing } = useForm({
        content: '',
    });

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const hasAI = useHasFeature('ai_reply_generation');

    const submitManual = (e) => {
        e.preventDefault();
        post(route('feedback.replies.store', feedback.id), {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        });
    };

    const submitAI = async () => {
        setAiError(null);
        setAiLoading(true);
        
        try {
            // Utiliser Inertia pour faire la requête avec le bon CSRF token
            const response = await window.axios.post(
                route('feedback.replies.ai.generate', feedback.id)
            );

            if (response.data?.content) {
                setData('content', response.data.content);
            } else {
                throw new Error('Réponse IA invalide');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Erreur lors de la génération IA';
            setAiError(message);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <>
            <Head title="Répondre au feedback" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Répondre au feedback
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Client : {feedback.feedback_request?.customer?.name || 'Sans nom'}
                        </p>
                    </div>

                    {/* Feedback Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {feedback.feedback_request?.customer?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Feedback du client
                                </h3>
                                
                                {/* Rating */}
                                {feedback.rating && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{feedback.rating}/5</span>
                                    </div>
                                )}

                                {/* Comment */}
                                {feedback.comment && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            "{feedback.comment}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Response Form */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                            <h2 className="text-lg font-semibold text-white">
                                Votre réponse
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">
                                Rédigez une réponse personnalisée ou utilisez l'IA pour vous aider
                            </p>
                        </div>

                        {/* Form Body */}
                        <div className="p-8">
                            <div className="space-y-6">
                                {/* Textarea */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        Contenu de la réponse *
                                    </label>
                                    <textarea
                                        className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        rows="8"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Écrivez votre réponse ici...&#10;&#10;Exemple : &#10;Merci beaucoup pour votre retour ! Nous sommes ravis que notre service vous ait plu. N'hésitez pas à nous contacter si vous avez besoin d'aide."
                                        disabled={processing || aiLoading}
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-xs text-gray-500">
                                            {data.content.length} caractères
                                        </p>
                                        {data.content && (
                                            <button
                                                type="button"
                                                onClick={() => setData('content', '')}
                                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Effacer
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* AI Error */}
                                {aiError && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-800">Erreur IA</p>
                                            <p className="text-sm text-red-700 mt-0.5">{aiError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-blue-900">Conseil</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Une bonne réponse remercie le client, montre de l'empathie et propose une solution si nécessaire.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={submitManual}
                                        disabled={processing || aiLoading || !data.content}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Envoyer la réponse
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={submitAI}
                                        disabled={processing || aiLoading || !hasAI}
                                        className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 ${
                                            hasAI 
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' 
                                                : 'bg-gray-400 cursor-not-allowed'
                                        } text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                                        title={!hasAI ? "Cette fonctionnalité nécessite un plan BASIC ou PRO" : ""}
                                    >
                                        {aiLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Génération IA...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {hasAI ? 'Générer avec IA' : '🔒 Upgrade requis (BASIC+)'}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Cancel Link */}
                                <div className="text-center pt-2">
                                    <Link 
                                        href={route('feedback.adminShow', feedback.id)} 
                                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Annuler et retourner
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Comment bien répondre ?
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start">
                                <svg className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Remerciez le client pour son feedback, qu'il soit positif ou négatif</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Montrez de l'empathie et personnalisez votre réponse</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Si nécessaire, proposez une action concrète ou une solution</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>Utilisez l'IA pour vous inspirer, mais personnalisez toujours</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Réponse envoyée avec succès !</span>
                    </div>
                </div>
            )}
        </>
    );
}
