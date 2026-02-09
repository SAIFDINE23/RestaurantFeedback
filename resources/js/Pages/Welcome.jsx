import { Head, Link } from '@inertiajs/react';
import { ChefHat, MessageSquare, BarChart3, Sparkles, Star, Users, Clock, TrendingUp, Check, X } from 'lucide-react';

export default function Welcome({ auth, plans = [] }) {
    console.log('Welcome component loaded, plans:', plans);
    return (
        <>
            <Head title="Feedora - Plateforme de feedback pour restaurants" />
            
            <div className="min-h-screen bg-white">
                {/* Header/Navigation */}
                <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            {/* Logo + Nom */}
                            <div className="flex items-center space-x-3">
                                <img 
                                    src="/images/logo_feedora.png" 
                                    alt="Feedora Logo" 
                                    className="h-10 w-auto sm:h-12"
                                />
                                <span className="text-2xl sm:text-3xl font-bold text-feedora-500">
                                    Feedora
                                </span>
                            </div>

                            {/* Navigation */}
                            <nav className="flex items-center space-x-3 sm:space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="px-4 sm:px-6 py-2.5 text-sm font-semibold text-white bg-feedora-500 rounded-lg hover:bg-feedora-600 transition-all duration-300 hover:shadow-lg"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-feedora-500 transition-colors duration-200"
                                        >
                                            Se connecter
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-4 sm:px-6 py-2.5 text-sm font-semibold text-white bg-feedora-500 rounded-lg hover:bg-feedora-600 transition-all duration-300 hover:shadow-lg"
                                        >
                                            Commencer
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-gray-50 to-white py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-medium">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Plateforme SaaS pour restaurants
                                </div>
                                
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    Transformez vos 
                                    <span className="block text-feedora-500 mt-2">feedbacks clients</span>
                                    en opportunités
                                </h1>
                                
                                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                                    Collectez, analysez et répondez aux avis de vos clients grâce à l'intelligence artificielle. 
                                    Améliorez l'expérience de vos clients et boostez votre réputation.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-feedora-500 rounded-xl hover:bg-feedora-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        Commencer maintenant
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                    
                                    <button className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-feedora-600 bg-white border-2 border-feedora-200 rounded-xl hover:border-feedora-400 transition-all duration-300">
                                        Voir la démo
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                                    <div>
                                        <p className="text-3xl font-bold text-feedora-500">98%</p>
                                        <p className="text-sm text-gray-600 mt-1">Satisfaction</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-feedora-500">500+</p>
                                        <p className="text-sm text-gray-600 mt-1">Restaurants</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-feedora-500">50K+</p>
                                        <p className="text-sm text-gray-600 mt-1">Feedbacks</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Image/Illustration */}
                            <div className="relative hidden lg:block">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="bg-gradient-to-br from-feedora-500 to-feedora-600 p-12">
                                        <div className="bg-white rounded-xl p-8 space-y-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-feedora-100 rounded-full flex items-center justify-center">
                                                    <ChefHat className="w-6 h-6 text-feedora-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-100 rounded w-1/2 mt-2"></div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-5 h-5 fill-feedora-500 text-feedora-500" />
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 bg-gray-100 rounded"></div>
                                                <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                                                <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating Elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-feedora-200 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-feedora-300 rounded-full blur-2xl opacity-40 animate-pulse delay-1000"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Pourquoi choisir Feedora ?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Une solution complète pour gérer vos feedbacks et améliorer votre service
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="group p-8 bg-gray-50 rounded-2xl hover:bg-feedora-50 transition-all duration-300 hover:shadow-xl">
                                <div className="w-14 h-14 bg-feedora-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-7 h-7 text-feedora-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Collecte automatisée
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Envoyez automatiquement des demandes de feedback par email ou SMS après chaque visite. Simple et efficace.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group p-8 bg-gray-50 rounded-2xl hover:bg-feedora-50 transition-all duration-300 hover:shadow-xl">
                                <div className="w-14 h-14 bg-feedora-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-7 h-7 text-feedora-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Réponses IA
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    L'IA génère des réponses personnalisées et adaptées au ton de chaque avis, positif ou négatif.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group p-8 bg-gray-50 rounded-2xl hover:bg-feedora-50 transition-all duration-300 hover:shadow-xl">
                                <div className="w-14 h-14 bg-feedora-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-7 h-7 text-feedora-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Analytics avancés
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Visualisez les tendances, identifiez les points d'amélioration et suivez votre score de satisfaction.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group p-8 bg-gray-50 rounded-2xl hover:bg-feedora-50 transition-all duration-300 hover:shadow-xl">
                                <div className="w-14 h-14 bg-feedora-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Clock className="w-7 h-7 text-feedora-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Gain de temps
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Automatisez la gestion de vos avis et concentrez-vous sur ce qui compte : vos clients.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group p-8 bg-gray-50 rounded-2xl hover:bg-feedora-50 transition-all duration-300 hover:shadow-xl">
                                <div className="w-14 h-14 bg-feedora-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-7 h-7 text-feedora-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Gestion multi-utilisateurs
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Collaborez avec votre équipe. Attribuez des rôles et permissions personnalisés.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group p-8 bg-gray-50 rounded-2xl hover:bg-feedora-50 transition-all duration-300 hover:shadow-xl">
                                <div className="w-14 h-14 bg-feedora-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-feedora-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Amélioration continue
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Identifiez rapidement les problèmes récurrents et améliorez votre service en temps réel.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Tarifs simples et transparents
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Choisissez le plan qui vous convient
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Tous nos plans incluent l'accès complet à la plateforme. Commencez gratuitement.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans && plans.length > 0 && plans.map((plan) => (
                                <div 
                                    key={plan.id}
                                    className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                                        plan.slug === 'basic' 
                                            ? 'border-feedora-500 relative transform scale-105' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    {plan.slug === 'basic' && (
                                        <div className="bg-gradient-to-r from-feedora-500 to-feedora-600 text-white text-center py-2 px-4 text-sm font-semibold">
                                            ⭐ Plus Populaire
                                        </div>
                                    )}

                                    <div className="p-8">
                                        {/* Plan Name */}
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {plan.name}
                                        </h3>
                                        
                                        {/* Description */}
                                        <p className="text-gray-600 mb-6 h-12">
                                            {plan.description}
                                        </p>

                                        {/* Price */}
                                        <div className="mb-6">
                                            {parseFloat(plan.price) === 0 ? (
                                                <div className="flex items-baseline">
                                                    <span className="text-5xl font-extrabold text-gray-900">Gratuit</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-baseline">
                                                    <span className="text-5xl font-extrabold text-gray-900">
                                                        {Math.floor(parseFloat(plan.price))}€
                                                    </span>
                                                    <span className="text-gray-600 ml-2">/mois</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* CTA Button */}
                                        <Link
                                            href={route('register')}
                                            className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                                                plan.slug === 'basic'
                                                    ? 'bg-feedora-500 text-white hover:bg-feedora-600 shadow-lg hover:shadow-xl'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                        >
                                            {plan.price === 0 ? 'Commencer gratuitement' : `Essayer ${plan.name}`}
                                        </Link>

                                        {/* Features List */}
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">
                                                    <strong>{plan.credits_monthly?.toLocaleString()}</strong> unités (~{plan.credits_monthly} SMS France)/mois
                                                </span>
                                            </div>

                                            <div className="flex items-start">
                                                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">
                                                    {plan.max_restaurants || 'Illimité'} restaurant{plan.max_restaurants > 1 ? 's' : ''}
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
                                                <span className="text-gray-700">Page feedback personnalisée</span>
                                            </div>

                                            <div className="flex items-start">
                                                <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">Redirection Google Reviews</span>
                                            </div>

                                            {plan.slug === 'free' ? (
                                                <div className="flex items-start">
                                                    <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-400">Génération IA de réponses</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">
                                                        <strong>Génération IA de réponses</strong>
                                                    </span>
                                                </div>
                                            )}

                                            {plan.slug === 'pro' ? (
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">
                                                        <strong>🧠 Radar IA</strong> (insights & recommandations)
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-start">
                                                    <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-400">Radar IA</span>
                                                </div>
                                            )}

                                            {plan.slug === 'free' ? (
                                                <div className="flex items-start">
                                                    <X className="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-400">Dashboard avancé</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">Dashboard complet</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add-ons info */}
                        <div className="mt-12 text-center bg-white rounded-xl p-6 shadow-md max-w-3xl mx-auto border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                📦 Besoin de plus de crédits SMS ?
                            </h4>
                            <p className="text-gray-600">
                                Achetez des recharges ponctuelles (10€, 25€, 70€) qui ne dépendent pas de votre abonnement et ne expirent jamais
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-gradient-to-br from-feedora-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Ce que disent nos clients
                            </h2>
                            <p className="text-xl text-gray-600">
                                Des restaurants satisfaits à travers le monde
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Testimonial 1 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-feedora-500 text-feedora-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "Feedora a transformé notre façon de gérer les avis clients. L'IA nous fait gagner un temps précieux !"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-feedora-200 rounded-full flex items-center justify-center">
                                        <span className="text-feedora-700 font-bold">MR</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Marie Rousseau</p>
                                        <p className="text-sm text-gray-600">La Table Gourmande, Paris</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 2 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-feedora-500 text-feedora-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "Interface intuitive et résultats impressionnants. Notre taux de satisfaction a augmenté de 25% !"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-feedora-200 rounded-full flex items-center justify-center">
                                        <span className="text-feedora-700 font-bold">JD</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Jean Dupont</p>
                                        <p className="text-sm text-gray-600">Le Bistrot Moderne, Lyon</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial 3 */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <div className="flex space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-feedora-500 text-feedora-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    "Un outil indispensable pour tout restaurateur qui souhaite améliorer son service client."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-feedora-200 rounded-full flex items-center justify-center">
                                        <span className="text-feedora-700 font-bold">SL</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Sophie Laurent</p>
                                        <p className="text-sm text-gray-600">Chez Sophie, Marseille</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-feedora-500 to-feedora-600">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Prêt à transformer vos feedbacks en succès ?
                        </h2>
                        <p className="text-xl text-feedora-100 mb-8 max-w-2xl mx-auto">
                            Rejoignez des centaines de restaurants qui utilisent déjà Feedora pour améliorer leur service client.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-feedora-600 bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Créer mon compte gratuit
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                        <p className="text-feedora-100 mt-6 text-sm">
                            Aucune carte bancaire requise • Essai gratuit 14 jours
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-300 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            {/* Company */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <img src="/images/logo_feedora.png" alt="Feedora" className="h-8 w-auto" />
                                    <span className="text-xl font-bold text-white">Feedora</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    La plateforme intelligente de gestion de feedbacks pour restaurants.
                                </p>
                            </div>

                            {/* Product */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">Produit</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Fonctionnalités</a></li>
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Tarifs</a></li>
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Sécurité</a></li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">Support</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Documentation</a></li>
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Contact</a></li>
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">FAQ</a></li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">Légal</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Mentions légales</a></li>
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">Confidentialité</a></li>
                                    <li><a href="#" className="hover:text-feedora-400 transition-colors">CGU</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                            <p>&copy; 2026 Feedora. Tous droits réservés.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
