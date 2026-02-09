import { useState } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { useHasFeature } from '@/Components/FeatureLock';
import { MessageCircle, Send, Zap, Heart, MessageSquare, ArrowLeft, Copy, Check, AlertCircle, Lightbulb } from 'lucide-react';

export default function Reply({ feedback }) {
    const { props } = usePage();
    const { data, setData, post, processing } = useForm({
        content: '',
    });

    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'from-green-500 to-emerald-600';
        if (rating === 3) return 'from-amber-500 to-orange-600';
        return 'from-red-500 to-rose-600';
    };

    const getRatingText = (rating) => {
        switch(rating) {
            case 5: return 'Excellent';
            case 4: return 'Très bien';
            case 3: return 'Bien';
            case 2: return 'Moyen';
            case 1: return 'À améliorer';
            default: return 'Non noté';
        }
    };

    return (
        <>
            <Head title="Répondre au feedback" />
            
            <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>

                <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <Link
                        href={route('feedbacks.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all mb-8 backdrop-blur-sm border border-white/20"
                    >
                        <ArrowLeft size={18} />
                        Retour à la liste
                    </Link>

                    <div className="max-w-4xl mx-auto">
                        {/* Main Card Container */}
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                            
                            {/* Content Container */}
                            <div className="relative bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                                
                                {/* Header Section with Gradient */}
                                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12">
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-30"></div>
                                    </div>
                                    
                                    <div className="relative">
                                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">
                                            💬 Gérer le Feedback
                                        </h1>
                                        <p className="text-blue-100 text-lg font-medium">
                                            Répondez au client avec bienveillance et professionnalisme
                                        </p>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-8 sm:p-12 space-y-8">
                                    
                                    {/* Customer Feedback Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8 relative overflow-hidden group/card">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                                        
                                        <div className="relative">
                                            {/* Customer header */}
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur opacity-30"></div>
                                                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                        {feedback.feedback_request?.customer?.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-black text-gray-900">
                                                        {feedback.feedback_request?.customer?.name || 'Client'}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm font-medium mt-1">
                                                        {feedback.feedback_request?.customer?.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                                                    <MessageCircle size={16} className="text-blue-600" />
                                                    <span className="text-xs font-bold text-gray-700">Feedback ID: {feedback.id}</span>
                                                </div>
                                            </div>

                                            {/* Rating & Comment */}
                                            <div className="space-y-4">
                                                {feedback.rating && (
                                                    <div className="flex items-center gap-4">
                                                        <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getRatingColor(feedback.rating)} text-white font-bold text-lg shadow-lg`}>
                                                            ⭐ {feedback.rating}/5
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg
                                                                    key={star}
                                                                    className={`w-6 h-6 ${star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-lg font-bold text-gray-900 ml-auto">
                                                            {getRatingText(feedback.rating)}
                                                        </span>
                                                    </div>
                                                )}

                                                {feedback.comment && (
                                                    <div className="mt-6 p-6 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <Heart size={20} className="text-red-500 flex-shrink-0 mt-1" />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Commentaire du client</p>
                                                                <p className="text-gray-900 text-lg leading-relaxed italic">
                                                                    "{feedback.comment}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Response Form Card */}
                                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-8 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <Send size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900">Votre Réponse</h2>
                                                <p className="text-gray-600 text-sm font-medium">Rédigez une réponse professionnelle et bienveillante</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mt-8">
                                            {/* Textarea */}
                                            <div className="relative">
                                                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                                                    Contenu de la réponse *
                                                </label>
                                                <div className="relative group/textarea">
                                                    <textarea
                                                        className="w-full border-2 border-gray-300 rounded-xl p-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-medium text-gray-900 placeholder-gray-400"
                                                        rows="10"
                                                        value={data.content}
                                                        onChange={(e) => setData('content', e.target.value)}
                                                        placeholder="Écrivez votre réponse ici...&#10;&#10;Conseil: Soyez empathique, remerciez le client et proposez une solution si pertinent."
                                                        disabled={processing || aiLoading}
                                                    />
                                                    <div className="absolute bottom-0 right-0 px-4 py-2 text-xs font-bold text-gray-500 bg-white rounded-tl-lg border-t border-l border-gray-300">
                                                        {data.content.length}/1000
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Copy button */}
                                            {data.content && (
                                                <button
                                                    type="button"
                                                    onClick={copyToClipboard}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                                                >
                                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                                    {copied ? 'Copié!' : 'Copier le texte'}
                                                </button>
                                            )}

                                            {/* AI Error */}
                                            {aiError && (
                                                <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold text-red-900">Erreur IA</p>
                                                        <p className="text-red-700 text-sm mt-1">{aiError}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tips Box */}
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                                                <div className="flex items-start gap-3">
                                                    <Lightbulb size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-black text-blue-900 mb-2">💡 Conseils pour une excellente réponse</h4>
                                                        <ul className="space-y-2 text-sm text-blue-800">
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-lg">✓</span>
                                                                <span><strong>Remerciez</strong> le client pour son feedback, positif ou négatif</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-lg">✓</span>
                                                                <span><strong>Montrez de l'empathie</strong> et de la compréhension</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-lg">✓</span>
                                                                <span><strong>Proposez une solution</strong> si le feedback pointe un problème</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="text-lg">✓</span>
                                                                <span><strong>Personnalisez</strong> votre réponse avec le nom du client</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                                <button
                                                    onClick={submitManual}
                                                    disabled={processing || aiLoading || !data.content}
                                                    className="relative group/btn inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                                            <Send size={20} />
                                                            Envoyer la réponse
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={submitAI}
                                                    disabled={processing || aiLoading || !hasAI}
                                                    className={`relative group/btn inline-flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all ${
                                                        hasAI 
                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' 
                                                            : 'bg-gray-400 text-gray-100 cursor-not-allowed'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    title={!hasAI ? "Cette fonctionnalité nécessite un plan BASIC ou PRO" : "Générer une réponse avec l'IA"}
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
                                                            <Zap size={20} />
                                                            {hasAI ? 'Générer avec IA' : '🔒 Upgrade requis'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Character count and clear */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <p className="text-xs font-semibold text-gray-500">
                                            {data.content.length > 800 ? (
                                                <span className="text-orange-600">⚠️ {1000 - data.content.length} caractères restants</span>
                                            ) : data.content.length > 0 ? (
                                                <span className="text-green-600">✓ {data.content.length}/1000</span>
                                            ) : (
                                                <span className="text-gray-400">Commencez à taper...</span>
                                            )}
                                        </p>
                                        {data.content && (
                                            <button
                                                type="button"
                                                onClick={() => setData('content', '')}
                                                className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                                            >
                                                Effacer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-green-400 backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-bold">Succès!</p>
                            <p className="text-sm">Votre réponse a été envoyée avec succès</p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
