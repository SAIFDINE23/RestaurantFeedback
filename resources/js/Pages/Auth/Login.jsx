import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, ArrowRight, ChefHat, Sparkles } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Connexion - Feedora" />

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
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                        
                        {/* Left Side - Illustration/Info */}
                        <div className="hidden lg:flex flex-col justify-center space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center px-4 py-2 bg-feedora-50 text-feedora-600 rounded-full text-sm font-medium">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Plateforme de feedback pour restaurants
                                </div>
                                
                                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                    Bienvenue sur
                                    <span className="block text-feedora-500 mt-2">Feedora</span>
                                </h1>
                                
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Gérez vos avis clients avec intelligence artificielle et améliorez votre service.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-feedora-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <ChefHat className="w-5 h-5 text-feedora-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Spécialement pour restaurants</h3>
                                        <p className="text-gray-600 text-sm">Solution adaptée à vos besoins</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-feedora-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-feedora-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">IA intégrée</h3>
                                        <p className="text-gray-600 text-sm">Réponses automatiques personnalisées</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Element */}
                            <div className="relative">
                                <div className="w-full h-64 bg-gradient-to-br from-feedora-100 to-feedora-50 rounded-3xl"></div>
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-feedora-200 rounded-full blur-2xl opacity-60"></div>
                                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-feedora-300 rounded-full blur-3xl opacity-40"></div>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="w-full">
                            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        Connexion
                                    </h2>
                                    <p className="text-gray-600">
                                        Accédez à votre espace restaurant
                                    </p>
                                </div>

                                {/* Status Message */}
                                {status && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Adresse email
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
                                                autoComplete="username"
                                                required
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mot de passe
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                                } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                required
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="w-4 h-4 text-feedora-500 border-gray-300 rounded focus:ring-feedora-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Se souvenir de moi</span>
                                        </label>

                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm font-medium text-feedora-600 hover:text-feedora-700 transition-colors"
                                            >
                                                Mot de passe oublié ?
                                            </Link>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-feedora-500 text-white font-semibold rounded-xl hover:bg-feedora-600 focus:outline-none focus:ring-2 focus:ring-feedora-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {processing ? (
                                            <span>Connexion en cours...</span>
                                        ) : (
                                            <>
                                                <span>Se connecter</span>
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
                                            <span className="px-4 bg-white text-gray-500">Pas encore de compte ?</span>
                                        </div>
                                    </div>

                                    {/* Register Link */}
                                    <Link
                                        href={route('register')}
                                        className="w-full flex items-center justify-center px-6 py-4 bg-white text-feedora-600 font-semibold rounded-xl border-2 border-feedora-200 hover:border-feedora-400 hover:bg-feedora-50 focus:outline-none focus:ring-2 focus:ring-feedora-500 focus:ring-offset-2 transition-all duration-300"
                                    >
                                        Créer un compte
                                    </Link>
                                </form>
                            </div>

                            {/* Mobile Logo */}
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
