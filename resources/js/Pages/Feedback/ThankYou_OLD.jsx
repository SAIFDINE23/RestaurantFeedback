import { useState, useEffect } from 'react';
import { CheckCircle, Star, Heart, Sparkles, ExternalLink } from 'lucide-react';

export default function ThankYou({ rating, googleUrl, company }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
            {/* Background blobs animés */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className={`relative z-10 w-full max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Card principale */}
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                    
                    <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        {/* Header avec pattern */}
                        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-12 text-center">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                            
                            {/* Icon de succès animé */}
                            <div className="relative inline-flex items-center justify-center mb-6 animate-scale-in">
                                <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-60"></div>
                                <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-full border-4 border-white/30">
                                    <CheckCircle className="w-16 h-16 text-white animate-check" />
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                                Merci infiniment !
                            </h1>
                            <p className="text-lg text-emerald-50 font-medium max-w-md mx-auto">
                                Votre retour précieux aide <span className="font-bold text-white">{company}</span> à s'améliorer chaque jour
                            </p>
                        </div>

                        {/* Contenu */}
                        <div className="p-8 md:p-12">
                            {/* Message de remerciement */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 rounded-2xl border border-emerald-200 mb-6">
                                    <Heart className="w-6 h-6 text-emerald-600 animate-pulse" />
                                    <span className="text-lg font-bold text-gray-900">Votre avis a été enregistré avec succès</span>
                                    <Sparkles className="w-6 h-6 text-teal-600" />
                                </div>

                                {rating && (
                                    <div className="flex justify-center gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-8 h-8 transition-all duration-300 delay-${i * 100} ${
                                                    i < rating 
                                                        ? 'text-yellow-400 fill-yellow-400 scale-110' 
                                                        : 'text-gray-300 fill-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Call to action Google */}
                            {googleUrl && rating >= 4 && (
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 mb-8">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center gap-2 mb-3">
                                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                Vous êtes satisfait !
                                            </span>
                                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <p className="text-gray-700 font-medium">
                                            Partagez votre expérience positive avec la communauté
                                        </p>
                                    </div>

                                    <a
                                        href={googleUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-5 overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity"></div>
                                        
                                        <Star className="relative w-6 h-6 text-white fill-white" />
                                        <span className="relative text-lg font-bold text-white">Laisser un avis sur Google</span>
                                        <ExternalLink className="relative w-5 h-5 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </a>

                                    <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Seulement 1 minute pour faire la différence
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-gray-600 font-medium mb-2">
                                    Nous apprécions vraiment votre temps et vos commentaires
                                </p>
                                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    Powered by Luminea
                                    <Sparkles className="w-4 h-4 text-teal-500" />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes scale-in {
                    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes check {
                    0%, 50% { transform: scale(1); }
                    60% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-check {
                    animation: check 0.6s ease-out 0.3s;
                }
            `}</style>
        </div>
    );
}
