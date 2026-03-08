import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Users, Mail, Phone, User, CheckCircle, Sparkles } from 'lucide-react';

export default function Show({ company, token }) {
    const [submitted, setSubmitted] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('public.form.store', token), {
            onSuccess: () => setSubmitted(true),
        });
    };

    // Utiliser les design settings si disponibles
    const primaryColor = company.design_settings?.primary_color || '#3B82F6';
    const secondaryColor = company.design_settings?.secondary_color || '#8B5CF6';

    if (submitted) {
        return (
            <>
                <Head title={`Merci ! - ${company.name}`} />
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                            {company.logo_url && (
                                <img 
                                    src={company.logo_url} 
                                    alt={company.name}
                                    className="w-20 h-20 mx-auto mb-6 rounded-full object-cover"
                                />
                            )}
                            
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                Merci !
                            </h1>
                            
                            <p className="text-gray-600 text-lg mb-6">
                                Vous êtes maintenant membre de notre liste VIP
                            </p>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                                <div className="flex items-start gap-3 text-left">
                                    <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-2">
                                            Profitez de vos avantages :
                                        </p>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            <li>✓ Offres exclusives réservées aux membres</li>
                                            <li>✓ Alertes sur nos événements spéciaux</li>
                                            <li>✓ Participez aux tirages au sort mensuels</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-500 text-sm">
                                À très bientôt chez <span className="font-semibold text-gray-900">{company.name}</span> !
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Rejoignez-nous - ${company.name}`} />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div 
                            className="p-8 text-white text-center"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                            }}
                        >
                            {company.logo_url ? (
                                <img 
                                    src={company.logo_url} 
                                    alt={company.name}
                                    className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-10 h-10" />
                                </div>
                            )}
                            
                            <h1 className="text-2xl font-bold mb-2">
                                Rejoignez notre liste VIP
                            </h1>
                            <p className="text-white text-opacity-90">
                                {company.name}
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-700">
                                    <p className="font-semibold mb-1">Profitez d'avantages exclusifs :</p>
                                    <ul className="space-y-1">
                                        <li>✓ Offres et promotions réservées aux membres</li>
                                        <li>✓ Soyez informé de nos événements spéciaux</li>
                                        <li>✓ Participez aux tirages au sort mensuels</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Nom complet *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Jean Dupont"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="jean@exemple.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Téléphone (optionnel)
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="06 12 34 56 78"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        }}
                                    >
                                        {processing ? 'Inscription...' : 'Rejoindre maintenant'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-6">
                                En vous inscrivant, vous acceptez de recevoir des communications de {company.name}.
                                Vos données sont protégées et ne seront jamais partagées.
                            </p>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            Propulsé par <span className="font-semibold text-gray-700">Feedora</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
