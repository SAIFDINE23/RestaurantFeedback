import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Settings as SettingsIcon, Building2, Briefcase, MapPin, Lock, Save, Loader2, CheckCircle2, HelpCircle, Eye, EyeOff, Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Settings({ auth, company }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    
    const { data, setData, put, processing, errors } = useForm({
        name: company?.name || '',
        sector: company?.sector || '',
        google_place_id: company?.google_place_id || '',
    });

    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        putPassword(route('password.update'), {
            onSuccess: () => {
                resetPassword();
                setShowPasswords({ current: false, new: false, confirm: false });
            }
        });
    };

    const { data: deleteData, setData: setDeleteData, delete: deleteAccount, processing: deleteProcessing } = useForm({
        confirmation: ''
    });

    const submitDelete = (e) => {
        e.preventDefault();
        if (confirm('⚠️ Êtes-vous absolument sûr ? Cette action est IRRÉVERSIBLE et supprimera :\n\n• Votre compte\n• Tous vos données\n• Tous vos feedbacks\n\nTapez "SUPPRIMER" pour confirmer.')) {
            const confirmation = prompt('Confirmer en tapant: SUPPRIMER');
            if (confirmation === 'SUPPRIMER') {
                deleteAccount(route('settings.delete-account'), {
                    onSuccess: () => {
                        window.location.href = '/';
                    }
                });
            }
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil Entreprise', icon: Building2 },
        { id: 'security', label: 'Sécurité', icon: Lock },
    ];

    return (
        <AuthenticatedLayout user={auth.user} header="Paramètres">
            <Head title="Paramètres" />

            <div className="max-w-6xl mx-auto">
                {/* Premium Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-3xl shadow-2xl mb-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
                    
                    <div className="relative px-8 py-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                                <SettingsIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
                                    Paramètres
                                </h1>
                                <p className="text-slate-200 text-base font-medium">
                                    ⚙️ Gérez tous les paramètres de votre compte et entreprise
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden">
                    <div className="flex flex-wrap border-b border-slate-200">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !tab.comingSoon && setActiveTab(tab.id)}
                                    disabled={tab.comingSoon}
                                    className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all duration-200 border-b-2 relative group ${
                                        tab.comingSoon
                                            ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                            : isActive
                                            ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                                            : 'text-gray-600 border-transparent hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                >
                                    <TabIcon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    {tab.comingSoon && (
                                        <span className="absolute -top-1 -right-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs rounded-full font-bold whitespace-nowrap">
                                            Bientôt
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-100 overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b-2 border-indigo-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Profil de l'Entreprise</h3>
                                    <p className="text-sm text-gray-600">Informations de base et configuration Google</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-8">
                            {/* Company Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Nom de l'entreprise *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Mon Restaurant SARL"
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                                                errors.name
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                                            } focus:outline-none focus:ring-2`}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <span className="font-bold">✕</span> {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Secteur d'activité
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.sector}
                                            onChange={(e) => setData('sector', e.target.value)}
                                            placeholder="Ex: Restauration, Commerce, Services..."
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring-2 transition-all duration-200"
                                        />
                                    </div>
                                    {errors.sector && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <span className="font-bold">✕</span> {errors.sector}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Google Place ID
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.google_place_id}
                                            onChange={(e) => setData('google_place_id', e.target.value)}
                                            placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring-2 transition-all duration-200"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">
                                        L'identifiant unique de votre établissement sur Google Maps
                                    </p>
                                    {errors.google_place_id && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <span className="font-bold">✕</span> {errors.google_place_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">💡 Besoin d'aide ?</p>
                                        <p>
                                            Pour gérer les liens d'avis de vos clients satisfaits (4-5 étoiles), rendez-vous dans 
                                            <span className="font-bold"> Plateformes d'avis</span> dans le menu de configuration.
                                        </p>
                                    </div>
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
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-100 overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b-2 border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Lock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Sécurité du Compte</h3>
                                    <p className="text-sm text-gray-600">Modifiez votre mot de passe et les paramètres de sécurité</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submitPassword} className="p-8 space-y-8">
                            {/* Change Password */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Mot de passe actuel *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            required
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            placeholder="Entrez votre mot de passe actuel"
                                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                                                passwordErrors.current_password
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 focus:border-red-500 focus:ring-red-500'
                                            } focus:outline-none focus:ring-2`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {passwordErrors.current_password && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <span className="font-bold">✕</span> {passwordErrors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Nouveau mot de passe *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            required
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData('password', e.target.value)}
                                            placeholder="Entrez un nouveau mot de passe"
                                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                                                passwordErrors.password
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 focus:border-red-500 focus:ring-red-500'
                                            } focus:outline-none focus:ring-2`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Au minimum 8 caractères avec majuscules, minuscules et chiffres
                                    </p>
                                    {passwordErrors.password && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <span className="font-bold">✕</span> {passwordErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Confirmer le mot de passe *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            required
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                            placeholder="Confirmez votre nouveau mot de passe"
                                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                                                passwordErrors.password_confirmation
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 focus:border-red-500 focus:ring-red-500'
                                            } focus:outline-none focus:ring-2`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {passwordErrors.password_confirmation && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <span className="font-bold">✕</span> {passwordErrors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Security Tips */}
                            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-orange-800">
                                        <p className="font-semibold mb-2">🔒 Conseils de sécurité :</p>
                                        <ul className="space-y-1">
                                            <li>✓ Utilisez un mot de passe unique et fort</li>
                                            <li>✓ Ne partagez votre mot de passe avec personne</li>
                                            <li>✓ Modifiez-le régulièrement (tous les 3 mois)</li>
                                            <li>✓ Activez l'authentification 2FA si disponible</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-8 border-t-2 border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CheckCircle2 className="w-5 h-5 text-red-500" />
                                    <span className="font-medium">Vous serez déconnecté après le changement</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordProcessing}
                                    className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {passwordProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Changement en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Changer le mot de passe
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Delete Account Section */}
                {activeTab === 'security' && (
                    <div className="space-y-8">
                        {/* Existing password change form above this is already shown */}
                        
                        {/* Delete Account - Danger Zone */}
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg border-2 border-red-300 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 flex items-center gap-4">
                                <Trash2 className="w-8 h-8 text-white" />
                                <div>
                                    <h3 className="text-xl font-black text-white">Zone dangereuse</h3>
                                    <p className="text-red-100 text-sm">Supprimer votre compte définitivement</p>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="bg-white border-2 border-red-200 rounded-xl p-6 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-red-900 mb-3">⚠️ Attention : cette action est IRRÉVERSIBLE</p>
                                            <ul className="space-y-2 text-sm text-red-800">
                                                <li>✕ Votre compte sera supprimé définitivement</li>
                                                <li>✕ Tous vos paramètres seront perdus</li>
                                                <li>✕ Tous vos feedbacks et données seront supprimés</li>
                                                <li>✕ Cette action ne peut pas être annulée</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={submitDelete} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-red-900 mb-3">
                                            ⚠️ Pour confirmer, tapez "<span className="text-red-600 font-black">SUPPRIMER</span>" exactement *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="SUPPRIMER"
                                            value={deleteData.confirmation}
                                            onChange={(e) => setDeleteData('confirmation', e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-red-300 rounded-xl font-mono font-bold text-center text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={deleteProcessing || deleteData.confirmation !== 'SUPPRIMER'}
                                        className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                                    >
                                        {deleteProcessing ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Suppression en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-6 h-6" />
                                                Supprimer définitivement mon compte
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
