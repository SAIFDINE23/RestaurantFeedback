<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tarifs - Feedora</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl font-bold text-indigo-600">Feedora</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/" class="text-gray-600 hover:text-gray-900">Accueil</a>
                    @auth
                        <a href="{{ route('dashboard') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            Dashboard
                        </a>
                    @else
                        <a href="{{ route('login') }}" class="text-gray-600 hover:text-gray-900">Connexion</a>
                        <a href="{{ route('register') }}" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                            Commencer
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 class="text-5xl font-extrabold text-gray-900 mb-4">
            Choisissez votre plan
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Des tarifs simples et transparents pour développer votre restaurant avec des feedbacks clients
        </p>
    </div>

    <!-- Pricing Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div class="grid md:grid-cols-3 gap-8">
            
            @foreach($plans as $plan)
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 {{ $plan->slug === 'basic' ? 'border-indigo-500 relative' : 'border-gray-200' }} hover:shadow-xl transition-shadow">
                
                @if($plan->slug === 'basic')
                <!-- Badge "Most Popular" -->
                <div class="bg-indigo-500 text-white text-center py-2 px-4 text-sm font-semibold">
                    ⭐ Plus Populaire
                </div>
                @endif

                <div class="p-8">
                    <!-- Plan Name -->
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">
                        {{ $plan->name }}
                    </h3>
                    
                    <!-- Description -->
                    <p class="text-gray-600 mb-6 h-12">
                        {{ $plan->description }}
                    </p>

                    <!-- Price -->
                    <div class="mb-6">
                        @if($plan->price == 0)
                            <div class="flex items-baseline">
                                <span class="text-5xl font-extrabold text-gray-900">Gratuit</span>
                            </div>
                        @else
                            <div class="flex items-baseline">
                                <span class="text-5xl font-extrabold text-gray-900">{{ number_format($plan->price, 0) }}€</span>
                                <span class="text-gray-600 ml-2">/mois</span>
                            </div>
                        @endif
                    </div>

                    <!-- CTA Button -->
                    <a href="{{ $plan->price == 0 ? route('register') : route('register') }}" 
                       class="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors mb-8
                              {{ $plan->slug === 'basic' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200' }}">
                        @if($plan->price == 0)
                            Commencer gratuitement
                        @else
                            Essayer {{ $plan->name }}
                        @endif
                    </a>

                    <!-- Features List -->
                    <div class="space-y-4">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                <strong>{{ number_format($plan->credits_monthly, 0, ',', ' ') }} unités</strong> de crédits SMS/mois
                            </span>
                        </div>

                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                {{ $plan->max_restaurants }} restaurant
                            </span>
                        </div>

                        <div class="flex items-start">
                            <svg class="w-5 h-5 {{ $plan->max_users ? 'text-green-500' : 'text-gray-300' }} mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $plan->max_users ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12' }}"></path>
                            </svg>
                            <span class="{{ $plan->max_users ? 'text-gray-700' : 'text-gray-400' }}">
                                {{ $plan->max_users ? 'Utilisateurs illimités' : $plan->max_users . ' utilisateur' }}
                            </span>
                        </div>

                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                Emails illimités
                            </span>
                        </div>

                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                Page feedback personnalisée
                            </span>
                        </div>

                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                Redirection Google Reviews (⭐ ≥ 4)
                            </span>
                        </div>

                        @if($plan->hasFeature('ai_reply_generation'))
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                <strong>Génération IA de réponses</strong>
                            </span>
                        </div>
                        @else
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <span class="text-gray-400">
                                Génération IA de réponses
                            </span>
                        </div>
                        @endif

                        @if($plan->hasFeature('radar_ai'))
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                <strong>🧠 Radar IA</strong> (insights & recommandations)
                            </span>
                        </div>
                        @else
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <span class="text-gray-400">
                                Radar IA
                            </span>
                        </div>
                        @endif

                        @if($plan->slug === 'free')
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <span class="text-gray-400">
                                Dashboard avancé
                            </span>
                        </div>
                        @else
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700">
                                Dashboard complet
                            </span>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
            @endforeach

        </div>

        <!-- Add-ons Section -->
        <div class="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 class="text-2xl font-bold text-gray-900 mb-4 text-center">
                📦 Recharges SMS (Add-ons)
            </h3>
            <p class="text-gray-600 text-center mb-8">
                Besoin de plus d'unités ? Achetez des recharges ponctuelles qui ne dépendent pas de votre abonnement
            </p>
            
            <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div class="border border-gray-200 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <div class="text-3xl font-bold text-gray-900 mb-2">10€</div>
                    <div class="text-gray-600 mb-4">+100 unités</div>
                    <div class="text-sm text-gray-500">~100 SMS France</div>
                </div>
                
                <div class="border-2 border-indigo-500 rounded-lg p-6 text-center bg-indigo-50">
                    <div class="text-sm text-indigo-600 font-semibold mb-2">MEILLEUR RAPPORT</div>
                    <div class="text-3xl font-bold text-gray-900 mb-2">25€</div>
                    <div class="text-gray-600 mb-4">+300 unités</div>
                    <div class="text-sm text-gray-500">~300 SMS France</div>
                </div>
                
                <div class="border border-gray-200 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <div class="text-3xl font-bold text-gray-900 mb-2">70€</div>
                    <div class="text-gray-600 mb-4">+1000 unités</div>
                    <div class="text-sm text-gray-500">~1000 SMS France</div>
                </div>
            </div>
            
            <p class="text-center text-sm text-gray-500 mt-6">
                💡 Les unités des add-ons sont utilisées après votre quota mensuel et ne expirent jamais
            </p>
        </div>

        <!-- FAQ / Info -->
        <div class="mt-12 text-center">
            <p class="text-gray-600">
                Une question ? <a href="mailto:support@feedora.com" class="text-indigo-600 hover:text-indigo-700 font-semibold">Contactez-nous</a>
            </p>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
            <p>&copy; {{ date('Y') }} Feedora. Tous droits réservés.</p>
        </div>
    </footer>

</body>
</html>
