import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Briefcase, MapPin, Link as LinkIcon, Save, Loader2, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function Edit({ auth, company }) {
    const { data, setData, put, processing, errors } = useForm({
        name: company?.name || '',
        sector: company?.sector || '',
        google_place_id: company?.google_place_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('company.update'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Entreprise">
            <Head title="Entreprise" />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Premium Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
                    {/* Blur Blobs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
                    
                    <div className="relative px-8 py-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
                                    Paramètres de l'Entreprise
                                </h1>
                                <p className="text-purple-100 text-base font-medium">
                                    🏢 Configurez les informations de votre entreprise
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-100 overflow-hidden">
                    {/* Section 1: General Info */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b-2 border-indigo-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Informations générales</h3>
                                <p className="text-sm text-gray-600">Ces informations seront utilisées dans vos communications</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Nom de l'entreprise"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ex: Mon Entreprise SARL"
                                icon={<Building2 className="w-5 h-5 text-gray-400" />}
                                error={errors.name}
                                required
                            />

                            <FormInput
                                label="Secteur d'activité"
                                value={data.sector}
                                onChange={(e) => setData('sector', e.target.value)}
                                placeholder="Ex: Restauration, Commerce, Services..."
                                icon={<Briefcase className="w-5 h-5 text-gray-400" />}
                                error={errors.sector}
                            />
                        </div>

                        {/* Google Integration Section */}
                        <div className="pt-8 border-t-2 border-gray-100">
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-red-100">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                                            <GoogleIcon className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-1">
                                            Intégration Google Business
                                        </h4>
                                        <p className="text-base text-gray-600">
                                            Configurez votre Google Place ID et gérez vos liens d'avis dans la section "Plateformes d'avis".
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormInput
                                    label="Google Place ID"
                                    value={data.google_place_id}
                                    onChange={(e) => setData('google_place_id', e.target.value)}
                                    placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                                    icon={<MapPin className="w-5 h-5 text-gray-400" />}
                                    error={errors.google_place_id}
                                    helpText="L'identifiant unique de votre établissement sur Google Maps"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-8 border-t-2 border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                <span className="font-medium">Les modifications seront appliquées immédiatement</span>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Enregistrer les modifications
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Card */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                <HelpCircle className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-black text-gray-900 mb-3">
                                Besoin d'aide pour trouver votre Google Place ID ?
                            </h4>
                            <p className="text-base text-gray-600 mb-4">
                                Utilisez l'outil officiel de Google pour trouver votre Place ID en recherchant le nom de votre établissement.
                            </p>
                            <a
                                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                Accéder à l'outil Google Place ID Finder
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Additional Tips */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 p-8">
                    <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-purple-600" />
                        </div>
                        Conseils d'utilisation
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">
                                <strong className="font-bold">Nom de l'entreprise :</strong> Sera affiché dans tous vos emails et messages de feedback
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">
                                <strong className="font-bold">Secteur d'activité :</strong> Aide l'IA à mieux comprendre votre contexte métier
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">
                                <strong className="font-bold">Google Place ID :</strong> Permet de rediriger automatiquement les clients satisfaits vers Google Reviews
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">
                                <strong className="font-bold">Lien Google Reviews :</strong> Un lien court (g.page/r/...) pour faciliter le partage
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Form Input Component
function FormInput({ label, value, onChange, placeholder, icon, error, required, helpText }) {
    return (
        <div>
            <label className="block text-base font-bold text-gray-700 mb-3">
                {label}
                {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`
                        w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4
                        rounded-xl border-2 ${error ? 'border-red-300' : 'border-gray-200'}
                        text-base text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
                        transition-all duration-200
                    `}
                    required={required}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
                    <span>⚠️</span>
                    {error}
                </p>
            )}
            {helpText && !error && (
                <p className="mt-2 text-sm text-gray-500">{helpText}</p>
            )}
        </div>
    );
}

// Google Icon
function GoogleIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
    );
}
