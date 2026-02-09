import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, ChefHat, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 25, label: 'Faible', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 50, label: 'Moyen', color: 'bg-yellow-500' };
        if (password.length < 12) return { strength: 75, label: 'Bon', color: 'bg-blue-500' };
        return { strength: 100, label: 'Excellent', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(data.password);

    return (
        <>
            <Head title="Inscription - Feedora" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
                {/* Header with Logo */}
                <header className="p-6">
                    <Link href="/" className="flex items-center space-x-3 w-fit">
                        <img 
                            src="/images/logo_feedora.png" 
                            alt="Feedora Logo" 
                            className="h-10 w-auto"
                        />
                        <span className="text-2xl font-bold text-feedora-500">Feedora</span>
                    </Link>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center p-4 py-8">
                    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-start">
                        
                        {/* Left Side - Illustration/Info */}
                        <div className="hidden lg:flex flex-col justify-center space-y-8 sticky top-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-medium">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Rejoignez 500+ restaurants
                                </div>
                                
                                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                    Commencez avec
                                    <span className="block text-feedora-500 mt-2">Feedora</span>
                                </h1>
                                
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Créez votre compte gratuitement et transformez vos feedbacks clients en opportunités.
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 className="w-6 h-6 text-feedora-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Configuration en 2 minutes</h3>
                                        <p className="text-gray-600 text-sm">Commencez immédiatement sans formation</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 className="w-6 h-6 text-feedora-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">IA intégrée</h3>
                                        <p className="text-gray-600 text-sm">Réponses automatiques personnalisées</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <CheckCircle2 className="w-6 h-6 text-feedora-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Essai gratuit 14 jours</h3>
                                        <p className="text-gray-600 text-sm">Aucune carte bancaire requise</p>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-center space-x-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 fill-feedora-500 text-feedora-500" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 italic mb-4">
                                    "Feedora a complètement transformé notre gestion des avis. Interface intuitive et résultats impressionnants !"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-feedora-200 rounded-full flex items-center justify-center">
                                        <span className="text-feedora-700 font-bold text-sm">JD</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-semibold text-gray-900 text-sm">Jean Dupont</p>
                                        <p className="text-xs text-gray-600">Le Bistrot Moderne, Lyon</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Register Form */}
                        <div className="w-full">
                            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        Créer votre compte
                                    </h2>
                                    <p className="text-gray-600">
                                        Remplissez le formulaire pour commencer
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                            <User className="w-4 h-4 text-feedora-500" />
                                            <span>Informations personnelles</span>
                                        </div>

                                        {/* Name Field */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom complet *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                                        errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                                    placeholder="Jean Dupont"
                                                    autoComplete="name"
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Adresse email *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                                        errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                                    placeholder="nom@restaurant.com"
                                                    autoComplete="email"
                                                    required
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company Information Section */}
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                            <Building2 className="w-4 h-4 text-feedora-500" />
                                            <span>Informations restaurant</span>
                                        </div>

                                        {/* Company Name Field */}
                                        <div>
                                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom du restaurant *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <ChefHat className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="company_name"
                                                    type="text"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                                        errors.company_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                                    placeholder="La Table Gourmande"
                                                    required
                                                />
                                            </div>
                                            {errors.company_name && (
                                                <p className="text-red-500 text-sm mt-2">{errors.company_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Password Section */}
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                                            <Lock className="w-4 h-4 text-feedora-500" />
                                            <span>Sécurité</span>
                                        </div>

                                        {/* Password Field */}
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                Mot de passe *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border ${
                                                        errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {data.password && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-gray-600">Force du mot de passe</span>
                                                        <span className={`font-medium ${
                                                            passwordStrength.strength >= 75 ? 'text-green-600' :
                                                            passwordStrength.strength >= 50 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>{passwordStrength.label}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className={`h-1.5 rounded-full transition-all ${passwordStrength.color}`}
                                                            style={{ width: `${passwordStrength.strength}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            {errors.password && (
                                                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Password Confirmation Field */}
                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirmer le mot de passe *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <input
                                                    id="password_confirmation"
                                                    type={showPasswordConfirm ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border ${
                                                        errors.password_confirmation ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="text-red-500 text-sm mt-2">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Terms */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <p className="text-xs text-gray-600">
                                            En créant un compte, vous acceptez nos{' '}
                                            <a href="#" className="text-feedora-600 hover:text-feedora-700 font-medium">
                                                Conditions d'utilisation
                                            </a>{' '}
                                            et notre{' '}
                                            <a href="#" className="text-feedora-600 hover:text-feedora-700 font-medium">
                                                Politique de confidentialité
                                            </a>
                                            .
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-feedora-500 text-white font-semibold rounded-xl hover:bg-feedora-600 focus:outline-none focus:ring-2 focus:ring-feedora-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {processing ? (
                                            <span>Création en cours...</span>
                                        ) : (
                                            <>
                                                <span>Créer mon compte</span>
                                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-500">Vous avez déjà un compte ?</span>
                                        </div>
                                    </div>

                                    {/* Login Link */}
                                    <Link
                                        href={route('login')}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-white text-feedora-600 font-semibold rounded-xl border-2 border-feedora-200 hover:border-feedora-400 hover:bg-feedora-50 focus:outline-none focus:ring-2 focus:ring-feedora-500 focus:ring-offset-2 transition-all duration-300"
                                    >
                                        Se connecter
                                    </Link>
                                </form>
                            </div>

                            {/* Mobile Note */}
                            <div className="lg:hidden mt-8 text-center">
                                <p className="text-sm text-gray-600">
                                    Propulsé par <span className="font-semibold text-feedora-600">Feedora</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="p-6 text-center text-sm text-gray-500">
                    <p>&copy; 2026 Feedora. Tous droits réservés.</p>
                </footer>
            </div>
        </>
    );
}
