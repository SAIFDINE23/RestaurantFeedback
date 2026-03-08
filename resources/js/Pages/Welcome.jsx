import { Head, Link } from '@inertiajs/react';
import { 
    MessageSquare, BarChart3, Sparkles, Star, Users, TrendingUp, Check, X, 
    Zap, Send, QrCode, Shield, Brain, ArrowRight,
    Globe, Layers, RefreshCw, Target
} from 'lucide-react';

export default function Welcome({ auth, plans = [] }) {
    return (
        <>
            <Head title="Feedora - Plateforme de feedback intelligente pour restaurants" />
            
            <div className="min-h-screen bg-white">
                {/* ── Header/Navigation ── */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src="/images/logo_feedora.png" 
                                    alt="Feedora Logo" 
                                    className="h-12 w-auto sm:h-14 drop-shadow-md"
                                />
                                <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-feedora-500 to-feedora-700 bg-clip-text text-transparent">
                                    Feedora
                                </span>
                            </div>

                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="#features" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Fonctionnalités</a>
                                <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Comment ça marche</a>
                                <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Tarifs</a>
                                <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-feedora-500 transition-colors">Témoignages</a>
                            </nav>

                            <div className="flex items-center space-x-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-feedora-500 rounded-xl hover:bg-feedora-600 transition-all duration-300 shadow-lg shadow-feedora-500/25 hover:shadow-xl hover:shadow-feedora-500/30"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-feedora-500 transition-colors"
                                        >
                                            Se connecter
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-5 py-2.5 text-sm font-semibold text-white bg-feedora-500 rounded-xl hover:bg-feedora-600 transition-all duration-300 shadow-lg shadow-feedora-500/25"
                                        >
                                            Essai gratuit
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Hero Section ── */}
                <section className="relative overflow-hidden bg-gradient-to-b from-feedora-50/50 via-white to-white pt-16 sm:pt-24 pb-20">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-feedora-200/30 to-feedora-400/10 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute top-40 right-0 w-72 h-72 bg-feedora-100/40 rounded-full blur-3xl -z-10"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-semibold border border-feedora-100">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Plateforme SaaS #1 pour la restauration
                                </div>
                                
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                                    Vos feedbacks clients, 
                                    <span className="bg-gradient-to-r from-feedora-500 to-feedora-600 bg-clip-text text-transparent"> propulsés par l'IA</span>
                                </h1>
                                
                                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                                    Collectez par <strong>SMS, email ou QR code</strong>. Analysez avec l'intelligence artificielle. 
                                    Répondez automatiquement. Boostez votre réputation en ligne.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={route('register')}
                                        className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-feedora-500 to-feedora-600 rounded-xl hover:from-feedora-600 hover:to-feedora-700 transition-all duration-300 shadow-xl shadow-feedora-500/25 hover:shadow-2xl hover:shadow-feedora-500/30 hover:-translate-y-0.5"
                                    >
                                        Démarrer gratuitement
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    
                                    <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-feedora-600 bg-white border-2 border-feedora-200 rounded-xl hover:border-feedora-400 hover:bg-feedora-50 transition-all duration-300">
                                        <span className="mr-2">▶</span> Voir comment ça marche
                                    </a>
                                </div>

                                {/* Trust indicators */}
                                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-500" />
                                        <span className="text-sm text-gray-600">RGPD conforme</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-feedora-500" />
                                        <span className="text-sm text-gray-600">Setup en 5 min</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span className="text-sm text-gray-600">Sans carte bancaire</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right - Dashboard Preview */}
                            <div className="relative hidden lg:block">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
                                    {/* Fake browser bar */}
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="h-6 bg-white rounded-md border border-gray-200 flex items-center px-3">
                                                <span className="text-xs text-gray-400">app.feedora.io/dashboard</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Dashboard mockup content */}
                                    <div className="p-6 space-y-4">
                                        {/* Stats row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-feedora-50 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-feedora-600">4.7</p>
                                                <p className="text-xs text-gray-500">Note moyenne</p>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-green-600">+23%</p>
                                                <p className="text-xs text-gray-500">Satisfaction</p>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-blue-600">156</p>
                                                <p className="text-xs text-gray-500">Avis ce mois</p>
                                            </div>
                                        </div>
                                        {/* Feedback cards */}
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 bg-feedora-200 rounded-full flex items-center justify-center text-xs font-bold text-feedora-700">MR</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900">Marie R.</span>
                                                        <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-feedora-500 text-feedora-500" />)}</div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Excellent service, cuisine raffinée !</p>
                                                </div>
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Positif</span>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">JD</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900">Jean D.</span>
                                                        <div className="flex">{[...Array(4)].map((_, i) => <Star key={i} className="w-3 h-3 fill-feedora-500 text-feedora-500" />)}<Star className="w-3 h-3 text-gray-300" /></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Très bon, attente un peu longue</p>
                                                </div>
                                                <span className="px-2 py-0.5 bg-feedora-100 text-feedora-700 rounded text-xs font-medium">IA ✨</span>
                                            </div>
                                        </div>
                                        {/* AI reply preview */}
                                        <div className="bg-gradient-to-r from-feedora-50 to-feedora-100/50 rounded-lg p-3 border border-feedora-200/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-4 h-4 text-feedora-600" />
                                                <span className="text-xs font-semibold text-feedora-700">Réponse IA générée</span>
                                            </div>
                                            <p className="text-xs text-gray-600">Merci Jean pour votre retour ! Nous prenons note du temps d'attente et…</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating decorations */}
                                <div className="absolute -top-6 -right-6 w-32 h-32 bg-feedora-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-feedora-300 rounded-full blur-2xl opacity-30 animate-pulse delay-1000"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Integrations Bar ── */}
                <section className="py-12 bg-gray-50 border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">Intégré avec vos outils préférés</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-60">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Globe className="w-6 h-6" />
                                <span className="font-bold text-lg">Google Reviews</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <MessageSquare className="w-6 h-6" />
                                <span className="font-bold text-lg">TripAdvisor</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Send className="w-6 h-6" />
                                <span className="font-bold text-lg">Brevo SMS</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Zap className="w-6 h-6" />
                                <span className="font-bold text-lg">Stripe</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Brain className="w-6 h-6" />
                                <span className="font-bold text-lg">Gemini AI</span>
                            </div>
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

                {/* ── How it Works ── */}
                <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-semibold mb-6">
                                <Zap className="w-4 h-4 mr-2" />
                                Simple comme bonjour
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                                Opérationnel en 3 étapes
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Pas besoin d'être tech — votre restaurant est prêt en quelques minutes
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                            {[
                                {
                                    step: '01',
                                    title: 'Créez votre compte',
                                    desc: "Inscrivez-vous gratuitement, ajoutez les infos de votre restaurant et importez votre liste de clients.",
                                    icon: Users,
                                },
                                {
                                    step: '02',
                                    title: 'Personnalisez et envoyez',
                                    desc: "Choisissez votre canal (SMS, email, QR), personnalisez les templates et lancez vos campagnes de feedback.",
                                    icon: Send,
                                },
                                {
                                    step: '03',
                                    title: 'Analysez et améliorez',
                                    desc: "L'IA analyse les retours, génère des réponses et vous propose des insights pour améliorer votre service.",
                                    icon: TrendingUp,
                                },
                            ].map((item, index) => (
                                <div key={index} className="relative text-center">
                                    {/* Connector line */}
                                    {index < 2 && (
                                        <div className="hidden md:block absolute top-16 left-[60%] w-[80%] border-t-2 border-dashed border-feedora-200 z-0"></div>
                                    )}
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-feedora-500 to-feedora-600 rounded-2xl text-white font-extrabold text-xl mb-6 shadow-lg shadow-feedora-500/25">
                                            {item.step}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
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
                <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-semibold mb-6">
                                <Star className="w-4 h-4 mr-2 fill-feedora-500" />
                                Témoignages
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                                Ils font confiance à Feedora
                            </h2>
                            <p className="text-xl text-gray-600">
                                Des restaurateurs qui ont transformé leur relation client
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    quote: "Depuis Feedora, notre note Google est passée de 3.8 à 4.6 étoiles. La redirection automatique des avis positifs, c'est magique !",
                                    name: "Marie Rousseau",
                                    restaurant: "La Table Gourmande, Paris",
                                    initials: "MR",
                                },
                                {
                                    quote: "Le Radar IA nous a fait découvrir un problème récurrent sur l'accueil qu'on ne voyait pas. On a corrigé et les avis se sont améliorés immédiatement.",
                                    name: "Jean Dupont",
                                    restaurant: "Le Bistrot Moderne, Lyon",
                                    initials: "JD",
                                },
                                {
                                    quote: "L'envoi par QR code a tout changé — nos clients donnent leur avis directement au restaurant. Le taux de réponse a explosé à 45% !",
                                    name: "Sophie Laurent",
                                    restaurant: "Chez Sophie, Marseille",
                                    initials: "SL",
                                },
                            ].map((testimonial, index) => (
                                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex space-x-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-feedora-500 text-feedora-500" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-6 leading-relaxed italic">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-feedora-400 to-feedora-600 rounded-full flex items-center justify-center shadow-md">
                                            <span className="text-white font-bold text-sm">{testimonial.initials}</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-bold text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.restaurant}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA Section ── */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-feedora-500 via-feedora-600 to-feedora-700"></div>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NEgyNFYwaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                    
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                            Prêt à booster la satisfaction<br className="hidden sm:block" /> de vos clients ?
                        </h2>
                        <p className="text-xl text-feedora-100 mb-10 max-w-2xl mx-auto">
                            Rejoignez les restaurants qui transforment chaque feedback en opportunité de croissance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('register')}
                                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-feedora-600 bg-white rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:-translate-y-0.5"
                            >
                                Créer mon compte gratuit
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-feedora-100 text-sm">
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Plan gratuit inclus</span>
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Sans carte bancaire</span>
                            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Annulation à tout moment</span>
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
