import { Head, Link } from '@inertiajs/react';
import {
    Star, Check, X, ArrowRight, Sparkles, Brain, Send, QrCode,
    BarChart3, Shield, Zap, MessageSquare, TrendingUp, Globe,
    ChevronRight, Users, RefreshCw, Target, Layers, MessageCircle,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function StarRow({ n = 5, size = 'w-4 h-4', color = 'fill-amber-400 text-amber-400' }) {
    return (
        <div className="flex">
            {Array.from({ length: n }).map((_, i) => (
                <Star key={i} className={`${size} ${color}`} />
            ))}
        </div>
    );
}

export default function Welcome({ auth, plans = [] }) {
    return (
        <>
            <Head title="Feedora — Plus d'avis Google, automatiquement" />

            <div className="min-h-screen bg-white overflow-x-hidden">
                {/* ── Header/Navigation ── */}
                <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                        <img src="/images/logo_feedora.png" alt="Feedora" className="h-10 w-auto" />

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Comment ça marche</a>
                            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Fonctionnalités</a>
                            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Tarifs</a>
                            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Témoignages</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="px-5 py-2.5 text-sm font-bold text-white bg-feedora-500 rounded-xl hover:bg-feedora-600 transition-all shadow-lg shadow-feedora-500/25">
                                    Mon dashboard →
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-feedora-500 transition-colors">
                                        Se connecter
                                    </Link>
                                    <Link href={route('register')} className="px-5 py-2.5 text-sm font-bold text-white bg-feedora-500 rounded-xl hover:bg-feedora-600 transition-all shadow-lg shadow-feedora-500/25">
                                        Essai gratuit
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Hero Section ── */}
                <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 pt-20 pb-24 sm:pt-28 sm:pb-32">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-feedora-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-feedora-500/10 border border-feedora-500/20 text-feedora-400 rounded-full text-sm font-semibold">
                                    <Star className="w-4 h-4 fill-feedora-400" />
                                    #1 outil de réputation pour restaurants &amp; hôtels
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                                    Transformez vos clients satisfaits en{' '}
                                    <span className="bg-gradient-to-r from-amber-400 to-feedora-400 bg-clip-text text-transparent">
                                        avis Google 5 ⭐
                                    </span>{' '}
                                    automatiquement
                                </h1>

                                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg">
                                    Feedora envoie une demande d'avis à vos clients (SMS, email ou QR code),
                                    analyse leur satisfaction, et redirige les clients heureux{' '}
                                    <strong className="text-white">directement vers votre fiche Google.</strong>
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={route('register')}
                                        className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-feedora-500 to-feedora-600 rounded-xl hover:from-feedora-400 hover:to-feedora-500 transition-all shadow-2xl shadow-feedora-500/30 hover:-translate-y-0.5"
                                    >
                                        Démarrer gratuitement
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-300 border border-slate-600 rounded-xl hover:border-slate-400 hover:text-white transition-all">
                                        Voir comment ça marche
                                    </a>
                                </div>

                                <div className="flex flex-wrap gap-5 pt-4 border-t border-slate-700">
                                    <span className="flex items-center gap-2 text-sm text-slate-400"><Check className="w-4 h-4 text-green-400" /> Sans carte bancaire</span>
                                    <span className="flex items-center gap-2 text-sm text-slate-400"><Check className="w-4 h-4 text-green-400" /> Setup en 5 min</span>
                                    <span className="flex items-center gap-2 text-sm text-slate-400"><Shield className="w-4 h-4 text-green-400" /> RGPD conforme</span>
                                </div>
                            </div>

                            {/* Right: dark dashboard mockup with Google redirect */}
                            <div className="relative hidden lg:flex flex-col gap-3">
                                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-700/50 bg-slate-900">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="h-6 bg-slate-700 rounded flex items-center px-3">
                                                <span className="text-xs text-slate-400">app.feedora.io/dashboard</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-feedora-500/10 border border-feedora-500/20 rounded-xl p-3 text-center">
                                                <p className="text-2xl font-extrabold text-feedora-400">4.8</p>
                                                <div className="flex justify-center mt-0.5"><StarRow n={5} size="w-3 h-3" color="fill-amber-400 text-amber-400" /></div>
                                                <p className="text-xs text-slate-400 mt-1">Note Google</p>
                                            </div>
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                                                <p className="text-2xl font-extrabold text-green-400">+47%</p>
                                                <p className="text-xs text-slate-400 mt-1.5">Avis collectés</p>
                                            </div>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                                                <p className="text-2xl font-extrabold text-amber-400">82%</p>
                                                <p className="text-xs text-slate-400 mt-1.5">Taux réponse</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { init: 'MR', name: 'Marie R.', note: 5, text: 'Excellent service, cuisine raffinée !', badge: '→ Google', badgeCls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
                                                { init: 'JD', name: 'Jean D.', note: 5, text: 'La viande était parfaite 🥩', badge: '→ Google', badgeCls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
                                                { init: 'SL', name: 'Sophie L.', note: 2, text: 'Service lent ce soir…', badge: 'Alerte', badgeCls: 'bg-red-500/20 text-red-300 border border-red-500/30' },
                                            ].map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                                    <div className="w-8 h-8 bg-feedora-500/20 rounded-full flex items-center justify-center text-xs font-bold text-feedora-300 flex-shrink-0">{f.init}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-white">{f.name}</span>
                                                            <StarRow n={f.note} size="w-2.5 h-2.5" color="fill-amber-400 text-amber-400" />
                                                        </div>
                                                        <p className="text-xs text-slate-400 truncate">{f.text}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${f.badgeCls}`}>{f.badge}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gradient-to-r from-feedora-500/10 to-purple-500/10 border border-feedora-500/20 rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Brain className="w-3.5 h-3.5 text-feedora-400" />
                                                <span className="text-xs font-bold text-feedora-300">Radar IA</span>
                                            </div>
                                            <p className="text-xs text-slate-400">📌 Point fort : qualité des plats (14×). Axe : <strong className="text-slate-300">temps de service</strong>.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating SMS bubble */}
                                <div className="absolute -left-8 top-16 bg-white rounded-2xl shadow-xl p-4 w-56 border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-8 h-8 bg-feedora-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900">SMS envoyé ✓</p>
                                            <p className="text-xs text-gray-500 mt-0.5">"Votre expérience vous a plu ? Partagez en 30s →"</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Google review */}
                                <div className="absolute -right-6 bottom-20 bg-white rounded-2xl shadow-xl p-4 w-52 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span className="text-xs font-bold text-gray-900">Nouvel avis Google</span>
                                    </div>
                                    <StarRow n={5} size="w-3.5 h-3.5" />
                                    <p className="text-xs text-gray-600 mt-1.5 italic">"Excellent ! Je recommande 🌟"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wave separator */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" fill="white"/>
                        </svg>
                    </div>
                </section>

                {/* ── Stats Bar ── */}
                <section className="py-14 bg-white border-b border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-10">Résultats observés sur nos restaurants partenaires</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: '+2.3 ⭐', label: 'Note Google en moyenne', color: 'text-amber-500' },
                                { value: '45%',    label: 'Taux de réponse moyen', color: 'text-feedora-500' },
                                { value: '3×',     label: "Plus d'avis en 30 jours", color: 'text-green-500' },
                                { value: '5 min',  label: 'Pour être opérationnel', color: 'text-blue-500' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <p className={`text-4xl font-extrabold ${s.color} mb-2`}>{s.value}</p>
                                    <p className="text-sm text-gray-500 leading-snug">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Problem / Solution ── */}
                <section className="py-24 bg-gradient-to-b from-white to-slate-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-bold mb-5">Le problème réel</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                Vos clients satisfaits<br className="hidden sm:block" /> ne laissent jamais d'avis
                            </h2>
                            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                                Les clients mécontents savent trouver Google. Les clients heureux rentrent chez eux et oublient.
                                <strong className="text-gray-700"> Feedora renverse ce déséquilibre.</strong>
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-red-50/80 border border-red-100 rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Sans Feedora</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        "Vos clients satisfaits partent sans laisser d'avis",
                                        'Les avis négatifs dominent votre fiche Google',
                                        "Vous ne savez pas pourquoi votre note baisse",
                                        'Répondre aux avis prend des heures chaque semaine',
                                        'Note Google bloquée à 3.9 ⭐ depuis des mois',
                                    ].map((t, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <X className="w-3 h-3 text-red-600" />
                                            </div>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 p-3 bg-white/70 rounded-xl">
                                    <p className="text-xs text-gray-400 font-medium">Votre note Google</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StarRow n={4} size="w-4 h-4" color="fill-gray-300 text-gray-300" />
                                        <Star className="w-4 h-4 text-gray-200" />
                                        <span className="text-lg font-bold text-gray-400">3.8</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-feedora-50 to-green-50 border border-feedora-100 rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                        <Check className="w-5 h-5 text-feedora-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Avec Feedora</h3>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        "Chaque client reçoit une demande d'avis automatique",
                                        'Les clients 4-5★ sont redirigés vers Google',
                                        'Les avis négatifs vous alertent avant la publication',
                                        "L'IA répond aux avis en un clic, dans votre ton",
                                        'Votre note Google monte progressivement',
                                    ].map((t, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                            <div className="w-5 h-5 rounded-full bg-feedora-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-feedora-700" />
                                            </div>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 p-3 bg-white/70 rounded-xl">
                                    <p className="text-xs text-feedora-600 font-medium">Votre note Google</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StarRow n={5} size="w-4 h-4" color="fill-amber-400 text-amber-400" />
                                        <span className="text-lg font-bold text-feedora-600">4.8 ✨</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── How it Works ── */}
                <section id="how-it-works" className="py-24 bg-slate-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 bg-feedora-50 text-feedora-600 rounded-full text-sm font-bold mb-5">Comment ça marche</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                Client satisfait → avis Google<br className="hidden sm:block" /> en 4 étapes automatiques
                            </h2>
                            <p className="text-lg text-gray-500 max-w-xl mx-auto">Vous configurez une fois. Feedora s'occupe de tout le reste.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 relative">
                            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-feedora-200 z-0" />
                            {[
                                { step: '01', emoji: '📲', title: 'Envoi automatique', desc: "Après la visite, votre client reçoit un SMS ou email avec le lien de feedback.", color: 'from-feedora-500 to-feedora-600' },
                                { step: '02', emoji: '⭐', title: 'Il note son expérience', desc: "Il répond en 30 secondes en donnant sa note (1 à 5 étoiles) et un commentaire.", color: 'from-amber-500 to-orange-500' },
                                { step: '03', emoji: '🔀', title: 'Redirection intelligente', desc: "Note 4-5★ → redirigé vers Google. Note 1-2★ → alerte privée pour vous.", color: 'from-blue-500 to-indigo-500' },
                                { step: '04', emoji: '📈', title: 'Votre note monte', desc: "Seuls les avis positifs arrivent sur Google. Votre note s'améliore progressivement.", color: 'from-green-500 to-emerald-500' },
                            ].map((item, idx) => (
                                <div key={idx} className="relative z-10 text-center">
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-2xl shadow-lg mb-4 mx-auto`}>
                                        {item.emoji}
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Étape {item.step}</p>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 text-center">
                            <Link href={route('register')} className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-feedora-500 to-feedora-600 rounded-xl hover:from-feedora-600 hover:to-feedora-700 transition-all shadow-xl shadow-feedora-500/25 hover:-translate-y-0.5">
                                Activer la redirection Google gratuitement
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <p className="text-sm text-gray-400 mt-3">Aucune carte bancaire requise</p>
                        </div>
                    </div>
                </section>


                {/* ── Features Section ── */}
                <section id="features" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-semibold mb-6">
                                <Layers className="w-4 h-4 mr-2" />
                                Fonctionnalités
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                                Tout ce dont votre restaurant a besoin
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Une plateforme tout-en-un pour collecter, analyser et exploiter les feedbacks de vos clients
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Send,
                                    bgColor: 'bg-feedora-100',
                                    textColor: 'text-feedora-600',
                                    title: "Studio d'envoi multi-canal",
                                    desc: "Envoyez vos demandes de feedback par SMS, email ou QR code depuis un studio unifié. Chaque canal isolé, templates personnalisables.",
                                },
                                {
                                    icon: Brain,
                                    bgColor: 'bg-purple-100',
                                    textColor: 'text-purple-600',
                                    title: 'Radar IA intelligent',
                                    desc: "L'IA analyse automatiquement tous vos avis et génère des insights actionnables : points forts, axes d'amélioration, tendances.",
                                },
                                {
                                    icon: Sparkles,
                                    bgColor: 'bg-amber-100',
                                    textColor: 'text-amber-600',
                                    title: 'Réponses IA personnalisées',
                                    desc: "Générez des réponses adaptées au ton de chaque avis en un clic. Gagnez des heures chaque semaine tout en restant authentique.",
                                },
                                {
                                    icon: QrCode,
                                    bgColor: 'bg-blue-100',
                                    textColor: 'text-blue-600',
                                    title: 'QR Codes personnalisés',
                                    desc: "Créez des QR codes aux couleurs de votre restaurant. Vos clients scannent et donnent leur avis en 30 secondes.",
                                },
                                {
                                    icon: BarChart3,
                                    bgColor: 'bg-green-100',
                                    textColor: 'text-green-600',
                                    title: 'Analytics & Dashboard',
                                    desc: "Tableaux de bord en temps réel : score de satisfaction, évolution, répartition des notes, taux de réponse, et plus.",
                                },
                                {
                                    icon: RefreshCw,
                                    bgColor: 'bg-indigo-100',
                                    textColor: 'text-indigo-600',
                                    title: 'Relance automatique',
                                    desc: "Relancez les clients qui n'ont pas répondu en un clic, avec des limites intelligentes (max 3 relances, intervalle 72h).",
                                },
                                {
                                    icon: Target,
                                    bgColor: 'bg-rose-100',
                                    textColor: 'text-rose-600',
                                    title: 'Escalade des avis négatifs',
                                    desc: "Les avis négatifs sont automatiquement signalés et escaladés pour une réponse rapide et appropriée.",
                                },
                                {
                                    icon: Globe,
                                    bgColor: 'bg-teal-100',
                                    textColor: 'text-teal-600',
                                    title: 'Redirection Google Reviews',
                                    desc: "Redirigez automatiquement les clients satisfaits vers Google, TripAdvisor ou Yelp pour booster votre visibilité.",
                                },
                                {
                                    icon: Users,
                                    bgColor: 'bg-orange-100',
                                    textColor: 'text-orange-600',
                                    title: 'Gestion des clients (CRM)',
                                    desc: "Base de données clients intégrée avec historique des feedbacks, coordonnées et statistiques par client.",
                                },
                            ].map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:border-feedora-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <div className={`w-14 h-14 ${feature.bgColor} ${feature.textColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>


                {/* ── Pricing Section ── */}
                <section id="pricing" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-semibold mb-6">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Tarifs transparents
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                                Un plan pour chaque restaurant
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Commencez gratuitement, évoluez quand vous êtes prêt. Aucun engagement.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans && plans.length > 0 && plans.map((plan) => {
                                const isPopular = plan.slug === 'basic';
                                const isPro = plan.slug === 'pro';
                                return (
                                    <div 
                                        key={plan.id}
                                        className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                                            isPopular 
                                                ? 'border-2 border-feedora-500 shadow-xl shadow-feedora-500/10 scale-105 z-10' 
                                                : 'border border-gray-200 shadow-lg'
                                        }`}
                                    >
                                        {isPopular && (
                                            <div className="bg-gradient-to-r from-feedora-500 to-feedora-600 text-white text-center py-2.5 px-4 text-sm font-bold tracking-wide">
                                                ⭐ PLUS POPULAIRE
                                            </div>
                                        )}

                                        <div className="p-8">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                            <p className="text-gray-500 mb-6 text-sm min-h-[40px]">{plan.description}</p>

                                            <div className="mb-8">
                                                {parseFloat(plan.price) === 0 ? (
                                                    <div className="flex items-baseline">
                                                        <span className="text-5xl font-extrabold text-gray-900">Gratuit</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-baseline">
                                                        <span className="text-5xl font-extrabold text-gray-900">
                                                            {Math.floor(parseFloat(plan.price))}€
                                                        </span>
                                                        <span className="text-gray-500 ml-2 text-lg">/mois</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                href={route('register')}
                                                className={`block w-full text-center py-3.5 px-6 rounded-xl font-bold transition-all duration-300 mb-8 ${
                                                    isPopular
                                                        ? 'bg-gradient-to-r from-feedora-500 to-feedora-600 text-white hover:from-feedora-600 hover:to-feedora-700 shadow-lg shadow-feedora-500/25'
                                                        : isPro
                                                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                }`}
                                            >
                                                {parseFloat(plan.price) === 0 ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
                                            </Link>

                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">
                                                        <strong>{plan.credits_monthly?.toLocaleString()}</strong> crédits/mois (~{plan.credits_monthly} SMS)
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">
                                                        {plan.max_users === null ? 'Utilisateurs illimités' : `${plan.max_users} utilisateur${plan.max_users > 1 ? 's' : ''}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">Emails illimités</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">Page feedback & QR code</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">Redirection avis Google</span>
                                                </div>

                                                {plan.slug === 'free' ? (
                                                    <>
                                                        <div className="flex items-start">
                                                            <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-400">Réponses IA</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-400">Radar IA & insights</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-400">Studio d'envoi multi-canal</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-start">
                                                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700"><strong>Réponses IA</strong> personnalisées</span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700"><strong>Studio d'envoi</strong> multi-canal</span>
                                                        </div>
                                                    </>
                                                )}

                                                {plan.slug === 'pro' ? (
                                                    <>
                                                        <div className="flex items-start">
                                                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700">
                                                                <strong>🧠 Radar IA</strong> — insights & recommandations
                                                            </span>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                            <span className="text-gray-700"><strong>Dashboard avancé</strong> complet</span>
                                                        </div>
                                                    </>
                                                ) : plan.slug !== 'free' ? (
                                                    <div className="flex items-start">
                                                        <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-400">Radar IA & insights avancés</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add-ons */}
                        <div className="mt-16 text-center">
                            <div className="inline-flex items-center bg-gradient-to-r from-feedora-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-feedora-100 shadow-sm max-w-3xl">
                                <div className="text-left">
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                                        📦 Recharges SMS à la carte
                                    </h4>
                                    <p className="text-gray-600">
                                        Besoin de plus de crédits ? Achetez des packs (10€, 25€, 70€) qui <strong>n'expirent jamais</strong> et 
                                        s'ajoutent à votre quota mensuel.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section id="testimonials" className="py-24 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-bold mb-5">Témoignages</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                Ils ont boosté leur note Google
                            </h2>
                            <div className="flex items-center justify-center gap-1">
                                <StarRow n={5} size="w-5 h-5" color="fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold text-gray-500 ml-2">4.9 sur 5 · Feedora</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    quote: "On était bloqués à 3.8 ★ depuis 2 ans. Avec Feedora, on a atteint 4.6 ★ en 6 semaines. La redirection automatique, c'est la fonctionnalité qui change tout.",
                                    name: "Marie Rousseau",
                                    role: "La Table Gourmande, Paris",
                                    init: "MR",
                                    before: '3.8', after: '4.6',
                                },
                                {
                                    quote: "Le Radar IA nous a révélé que nos clients se plaignaient du bruit. On a posé des panneaux acoustiques. Les avis se sont améliorés en 3 semaines.",
                                    name: "Jean Dupont",
                                    role: "Le Bistrot Moderne, Lyon",
                                    init: "JD",
                                    before: '4.0', after: '4.7',
                                },
                                {
                                    quote: "Le QR code sur nos tables, c'est magique. Les clients donnent leur avis pendant qu'ils sont encore enthousiastes. 45% de taux de réponse !",
                                    name: "Sophie Laurent",
                                    role: "Chez Sophie, Marseille",
                                    init: "SL",
                                    before: '4.1', after: '4.9',
                                },
                            ].map((t, i) => (
                                <div key={i} className="bg-white p-7 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5">
                                    <StarRow n={5} size="w-4 h-4" color="fill-amber-400 text-amber-400" />
                                    <p className="text-gray-700 mt-4 mb-5 text-sm leading-relaxed italic">"{t.quote}"</p>
                                    <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-gray-400">Avant</p>
                                            <p className="text-xl font-extrabold text-gray-400">{t.before} ⭐</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-feedora-400 flex-shrink-0" />
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-feedora-600 font-semibold">Avec Feedora</p>
                                            <p className="text-xl font-extrabold text-feedora-600">{t.after} ⭐</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-feedora-400 to-feedora-600 rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-white text-xs font-bold">{t.init}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{t.name}</p>
                                            <p className="text-xs text-gray-500">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA Section ── */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-feedora-900 to-slate-900" />
                    <div className="absolute top-0 left-1/3 w-96 h-96 bg-feedora-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex justify-center gap-1 mb-6">
                            <StarRow n={5} size="w-6 h-6" color="fill-amber-400 text-amber-400" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                            Vos prochains avis Google<br className="hidden sm:block" /> vous attendent
                        </h2>
                        <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
                            Rejoignez les restaurants qui ont boosté leur note Google avec Feedora.
                            Configuré en 5 minutes. Sans carte bancaire.
                        </p>
                        <Link
                            href={route('register')}
                            className="group inline-flex items-center justify-center px-10 py-5 text-lg font-extrabold text-feedora-700 bg-white rounded-2xl hover:bg-feedora-50 transition-all shadow-2xl hover:-translate-y-1"
                        >
                            Créer mon compte gratuit
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-400 text-sm">
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Plan gratuit inclus</span>
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Sans carte bancaire</span>
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Annulation à tout moment</span>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="relative overflow-hidden">
                    <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
                        {/* Top accent line */}
                        <div className="h-1 bg-gradient-to-r from-feedora-400 via-feedora-500 to-feedora-600"></div>
                        
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                            <div className="grid md:grid-cols-5 gap-12 mb-16">
                                {/* Brand */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <img 
                                            src="/images/logo_feedora.png" 
                                            alt="Feedora" 
                                            className="h-12 w-auto brightness-110"
                                        />
                                        <span className="text-2xl font-extrabold bg-gradient-to-r from-feedora-400 to-feedora-500 bg-clip-text text-transparent">
                                            Feedora
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
                                        La plateforme SaaS qui aide les restaurants à collecter, analyser et répondre aux feedbacks clients grâce à l'intelligence artificielle.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-feedora-500 rounded-lg flex items-center justify-center transition-colors duration-300 group">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.944 13.944 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.523 6.573 4.897 4.897 0 0 1-2.229-.616v.06a4.916 4.916 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.085 4.917 4.917 0 0 0 4.6 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.025 10.025 0 0 0 24 4.557z" /></svg>
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-feedora-500 rounded-lg flex items-center justify-center transition-colors duration-300 group">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-feedora-500 rounded-lg flex items-center justify-center transition-colors duration-300 group">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                                        </a>
                                    </div>
                                </div>

                                {/* Product */}
                                <div>
                                    <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Produit</h4>
                                    <ul className="space-y-3">
                                        <li><a href="#features" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Fonctionnalités</a></li>
                                        <li><a href="#pricing" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Tarifs</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Intégrations</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Changelog</a></li>
                                    </ul>
                                </div>

                                {/* Resources */}
                                <div>
                                    <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Ressources</h4>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Documentation</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Guide de démarrage</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">FAQ</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Contact support</a></li>
                                    </ul>
                                </div>

                                {/* Legal */}
                                <div>
                                    <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Légal</h4>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Mentions légales</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Politique de confidentialité</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">Conditions d'utilisation</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-feedora-400 transition-colors text-sm">RGPD</a></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Bottom bar */}
                            <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-500">
                                    &copy; {new Date().getFullYear()} Feedora. Tous droits réservés.
                                </p>
                                <p className="text-sm text-gray-600">
                                    Fait avec <span className="text-feedora-500">♥</span> pour les restaurateurs
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
