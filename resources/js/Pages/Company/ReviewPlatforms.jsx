import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { Globe, Check, X, ExternalLink, HelpCircle, Star, AlertCircle, Search } from 'lucide-react';
import { getPlatformLogo } from '@/Components/PlatformLogos';

export default function ReviewPlatforms({ auth, company }) {
    const platforms = [
        {
            id: 'google',
            name: 'Google',
            color: 'from-blue-500 to-blue-600',
            helpUrl: 'https://support.google.com/business/answer/7035772',
            placeholder: 'https://g.page/r/VOTRE_ID/review',
            description: 'La plateforme la plus populaire pour les recherches locales',
            popular: true
        },
        {
            id: 'facebook',
            name: 'Facebook',
            color: 'from-blue-600 to-indigo-600',
            helpUrl: 'https://www.facebook.com/business/help',
            placeholder: 'https://www.facebook.com/NomDuRestaurant/reviews',
            description: 'Avis sur votre page Facebook professionnelle',
            popular: true
        },
        {
            id: 'tripadvisor',
            name: 'TripAdvisor',
            color: 'from-green-500 to-green-600',
            helpUrl: 'https://www.tripadvisorsupport.com/hc/fr',
            placeholder: 'https://www.tripadvisor.com/UserReview-g...',
            description: 'Idéal pour restaurants et activités touristiques',
            popular: true
        },
        {
            id: 'lafourchette',
            name: 'LaFourchette',
            color: 'from-teal-400 to-teal-600',
            helpUrl: 'https://www.thefork.fr/restaurant',
            placeholder: 'https://www.thefork.fr/restaurant/...',
            description: 'Leader de la réservation en ligne en France',
            popular: true
        },
        {
            id: 'trustpilot',
            name: 'Trustpilot',
            color: 'from-teal-500 to-cyan-600',
            helpUrl: 'https://support.trustpilot.com',
            placeholder: 'https://www.trustpilot.com/evaluate/...',
            description: 'Plateforme de confiance B2C reconnue'
        },
        {
            id: 'zomato',
            name: 'Zomato',
            color: 'from-red-500 to-red-600',
            helpUrl: 'https://www.zomato.com',
            placeholder: 'https://www.zomato.com/...',
            description: 'Découverte et avis de restaurants'
        },
        {
            id: 'opentable',
            name: 'OpenTable',
            color: 'from-red-600 to-red-700',
            helpUrl: 'https://www.opentable.fr',
            placeholder: 'https://www.opentable.fr/...',
            description: 'Réservation et avis de restaurants'
        },
        {
            id: 'yelp',
            name: 'Yelp',
            color: 'from-red-500 to-red-600',
            helpUrl: 'https://www.yelp.com/support',
            placeholder: 'https://www.yelp.com/writeareview/biz/...',
            description: 'Très populaire aux États-Unis et Canada'
        },
        {
            id: 'deliveroo',
            name: 'Deliveroo',
            color: 'from-cyan-400 to-cyan-600',
            helpUrl: 'https://www.deliveroo.fr',
            placeholder: 'https://deliveroo.fr/fr/menu/...',
            description: 'Plateforme de livraison de repas'
        },
        {
            id: 'ubereats',
            name: 'Uber Eats',
            color: 'from-green-500 to-green-600',
            helpUrl: 'https://www.ubereats.com',
            placeholder: 'https://www.ubereats.com/store/...',
            description: 'Livraison de repas rapide'
        },
        {
            id: 'justeat',
            name: 'Just Eat',
            color: 'from-orange-500 to-orange-600',
            helpUrl: 'https://www.just-eat.fr',
            placeholder: 'https://www.just-eat.fr/restaurants-...',
            description: 'Commande de repas en ligne'
        },
        {
            id: 'michelin',
            name: 'Guide Michelin',
            color: 'from-yellow-400 to-yellow-600',
            helpUrl: 'https://guide.michelin.com',
            placeholder: 'https://guide.michelin.com/fr/fr/restaurant/...',
            description: 'Le guide gastronomique de référence'
        },
        {
            id: 'booking',
            name: 'Booking.com',
            color: 'from-blue-700 to-blue-900',
            helpUrl: 'https://www.booking.com',
            placeholder: 'https://www.booking.com/hotel/...',
            description: 'Réservations et avis d\'hébergement'
        },
        {
            id: 'petitfute',
            name: 'Petit Futé',
            color: 'from-red-600 to-red-800',
            helpUrl: 'https://www.petitfute.com',
            placeholder: 'https://www.petitfute.com/...',
            description: 'Guide touristique français'
        },
        {
            id: 'discount',
            name: 'Discount',
            color: 'from-orange-500 to-orange-700',
            helpUrl: 'https://www.discount.fr',
            placeholder: 'https://www.discount.fr/...',
            description: 'Bons plans restaurants'
        },
        {
            id: 'restopolis',
            name: 'Restopolis',
            color: 'from-orange-600 to-red-600',
            helpUrl: 'https://www.restopolis.fr',
            placeholder: 'https://www.restopolis.fr/...',
            description: 'Annuaire de restaurants'
        },
        {
            id: 'gaultmillau',
            name: 'Gault&Millau',
            color: 'from-red-700 to-red-900',
            helpUrl: 'https://www.gaultmillau.com',
            placeholder: 'https://www.gaultmillau.com/...',
            description: 'Guide gastronomique français'
        },
        {
            id: 'other',
            name: 'Autre',
            color: 'from-purple-500 to-pink-600',
            helpUrl: null,
            placeholder: 'URL de votre plateforme personnalisée',
            description: 'Toute autre plateforme d\'avis en ligne'
        }
    ];

    const initialData = {};
    platforms.forEach(platform => {
        const existing = company.review_platforms?.[platform.id];
        initialData[platform.id] = {
            enabled: existing?.enabled || false,
            url: existing?.url || ''
        };
    });

    const { data, setData, post, processing, errors } = useForm(initialData);
    const [showHelp, setShowHelp] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    // Filtrer les plateformes selon la recherche
    const filteredPlatforms = platforms.filter(platform =>
        platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = (platformId) => {
        setData(platformId, {
            ...data[platformId],
            enabled: !data[platformId].enabled
        });
    };

    const handleUrlChange = (platformId, url) => {
        setData(platformId, {
            ...data[platformId],
            url: url
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('company.review-platforms.update'), {
            preserveScroll: true,
        });
    };

    const testUrl = (url) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const getStatus = (platform) => {
        if (!data[platform.id].enabled) {
            return { text: 'Désactivé', color: 'bg-gray-100 text-gray-600' };
        }
        if (!data[platform.id].url) {
            return { text: 'URL manquante', color: 'bg-amber-100 text-amber-700' };
        }
        return { text: 'Configuré', color: 'bg-green-100 text-green-700' };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Plateformes d'avis
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Configurez où vos clients satisfaits (4-5 étoiles) pourront laisser leurs avis
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Plateformes d'avis" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Info Box */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                            <Star className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Comment ça fonctionne ?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Activez les plateformes que vous utilisez</li>
                                    <li>• Entrez l'URL de votre page d'avis pour chaque plateforme</li>
                                    <li>• Vos clients verront uniquement les plateformes activées après avoir donné 4-5 étoiles</li>
                                    <li>• Plus de plateformes = plus de chances d'obtenir des avis !</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une plateforme..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="mt-2 text-sm text-gray-600">
                                {filteredPlatforms.length} plateforme{filteredPlatforms.length > 1 ? 's' : ''} trouvée{filteredPlatforms.length > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {filteredPlatforms.map((platform) => {
                                const status = getStatus(platform);
                                const isEnabled = data[platform.id].enabled;
                                
                                return (
                                    <div 
                                        key={platform.id}
                                        className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
                                            isEnabled ? 'border-blue-300 shadow-md' : 'border-gray-200'
                                        }`}
                                    >
                                        {/* Header with gradient */}
                                        <div className={`bg-gradient-to-r ${platform.color} p-4 rounded-t-lg`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-white rounded-lg p-2">
                                                        {getPlatformLogo(platform.id, "w-8 h-8")}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-white text-lg">
                                                                {platform.name}
                                                            </h3>
                                                            {platform.popular && (
                                                                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                                    Populaire
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-white/90 text-sm">
                                                            {platform.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(platform.id)}
                                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                                                        isEnabled ? 'bg-white' : 'bg-white/30'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 transform rounded-full transition-all ${
                                                            isEnabled 
                                                                ? 'translate-x-6 bg-green-500' 
                                                                : 'translate-x-1 bg-gray-400'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4">
                                            {/* Status Badge */}
                                            <div className="mb-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </div>

                                            {/* URL Input */}
                                            <div className={`space-y-2 ${!isEnabled && 'opacity-50'}`}>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    URL de la page d'avis
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="url"
                                                        disabled={!isEnabled}
                                                        value={data[platform.id].url}
                                                        onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                                                        placeholder={platform.placeholder}
                                                        className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                                            errors[`${platform.id}.url`]
                                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                        } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                                    />
                                                    {isEnabled && data[platform.id].url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => testUrl(data[platform.id].url)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Tester le lien"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                {errors[`${platform.id}.url`] && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors[`${platform.id}.url`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Help Link */}
                                            {platform.helpUrl && (
                                                <a
                                                    href={platform.helpUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-xs text-gray-500 hover:text-blue-600 mt-2 transition-colors"
                                                >
                                                    <HelpCircle className="h-3 w-3 mr-1" />
                                                    Comment trouver mon URL ?
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tips Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-amber-900 mb-2">Conseils d'utilisation</h4>
                                    <ul className="text-sm text-amber-800 space-y-1">
                                        <li>✓ Activez au minimum 2-3 plateformes pour maximiser vos avis</li>
                                        <li>✓ Testez chaque lien avant de sauvegarder</li>
                                        <li>✓ Google, Facebook et LaFourchette sont les plus utilisés en France</li>
                                        <li>✓ Les clients doivent avoir un compte sur la plateforme pour laisser un avis</li>
                                        <li>✓ Privilégiez les plateformes sur lesquelles vous êtes déjà inscrit</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Enregistrement...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        <span>Enregistrer la configuration</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
