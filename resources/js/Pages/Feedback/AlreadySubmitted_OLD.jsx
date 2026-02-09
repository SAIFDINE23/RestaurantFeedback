import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CheckCircle2, Shield, Clock, Sparkles, Info } from 'lucide-react';

export default function AlreadySubmitted({ company }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <>
            <Head title="Feedback déjà envoyé" />

            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                {/* Background blobs animés */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                <div className={`relative z-10 w-full max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Card principale */}
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                        
                        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-12 text-center">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                                
                                {/* Icon */}
                                <div className="relative inline-flex items-center justify-center mb-6 animate-scale-in">
                                    <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-60"></div>
                                    <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-full border-4 border-white/30">
                                        <CheckCircle2 className="w-16 h-16 text-white animate-pulse" />
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                                    Merci !
                                </h1>
                                <p className="text-lg text-blue-50 font-medium">
                                    Nous avons déjà reçu votre précieux feedback
                                </p>
                            </div>

                            {/* Contenu */}
                            <div className="p-8 md:p-12">
                                {/* Message principal */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-2xl border border-blue-200 mb-6">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                        <span className="text-lg font-bold text-gray-900">Feedback déjà enregistré</span>
                                    </div>

                                    <p className="text-xl text-gray-800 font-semibold mb-4">
                                        Vous avez déjà partagé votre avis pour
                                    </p>
                                    <p className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                                        {company}
                                    </p>
                                </div>

                                {/* Info Cards */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-2">Votre avis compte</h3>
                                                <p className="text-sm text-gray-600">
                                                    Nous avons bien reçu et enregistré votre feedback. Merci pour votre contribution !
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-2">Sécurité</h3>
                                                <p className="text-sm text-gray-600">
                                                    Chaque lien est unique et ne peut être utilisé qu'une seule fois pour garantir l'authenticité.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Avertissement lien */}
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 mb-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Info className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-orange-600" />
                                                Lien expiré
                                            </h3>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                Ce lien de feedback n'est plus valide car vous avez déjà soumis votre avis. 
                                                Si vous pensez qu'il s'agit d'une erreur, veuillez contacter <strong>{company}</strong> directement.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center pt-6 border-t border-gray-200">
                                    <p className="text-gray-600 font-medium mb-2">
                                        Nous apprécions votre participation !
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        Powered by Luminea
                                        <Sparkles className="w-4 h-4 text-indigo-500" />
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
                `}</style>
            </div>
        </>
    );
}
