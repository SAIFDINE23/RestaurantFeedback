import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Palette, Upload, Eye, Star, Heart, ThumbsUp } from 'lucide-react';

export default function Edit({ auth, company }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [logoPreview, setLogoPreview] = useState(company.logo_url ? `/storage/${company.logo_url}` : null);

    const { data, setData, post, processing, errors, progress } = useForm({
        logo: null,
        design_settings: company.design_settings,
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const updateSetting = (key, value) => {
        setData('design_settings', {
            ...data.design_settings,
            [key]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('feedback.design.update'), {
            forceFormData: true,
        });
    };

    const starStyles = {
        classic: '⭐',
        modern: '★',
        heart: '❤️',
        thumbs: '👍',
    };

    const buttonStyles = {
        rounded: 'rounded-lg',
        square: 'rounded-none',
        pill: 'rounded-full',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Palette className="w-6 h-6 text-purple-600" />
                        <h2 className="text-xl font-semibold">Design Page Feedback</h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        <Eye className="w-4 h-4" />
                        {previewMode ? 'Masquer' : 'Aperçu'}
                    </button>
                </div>
            }
        >
            <Head title="Design Feedback" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Formulaire de configuration */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Personnalisation</h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Logo */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <Upload className="w-4 h-4 inline mr-2" />
                                        Logo de l'entreprise
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-purple-50 file:text-purple-700
                                            hover:file:bg-purple-100"
                                    />
                                    {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                                    
                                    <label className="flex items-center gap-2 mt-3">
                                        <input
                                            type="checkbox"
                                            checked={data.design_settings.show_logo}
                                            onChange={(e) => updateSetting('show_logo', e.target.checked)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Afficher le logo</span>
                                    </label>
                                </div>

                                {/* Message personnalisé */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Message d'accueil
                                    </label>
                                    <input
                                        type="text"
                                        value={data.design_settings.custom_message}
                                        onChange={(e) => updateSetting('custom_message', e.target.value)}
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Votre avis compte pour nous!"
                                    />
                                </div>

                                {/* Style d'étoiles */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <Star className="w-4 h-4 inline mr-2" />
                                        Style des étoiles
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(starStyles).map(([key, icon]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => updateSetting('star_style', key)}
                                                className={`p-3 text-2xl border rounded-lg transition ${
                                                    data.design_settings.star_style === key
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Couleurs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Couleur primaire
                                        </label>
                                        <input
                                            type="color"
                                            value={data.design_settings.primary_color}
                                            onChange={(e) => updateSetting('primary_color', e.target.value)}
                                            className="w-full h-10 rounded border cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Couleur secondaire
                                        </label>
                                        <input
                                            type="color"
                                            value={data.design_settings.secondary_color}
                                            onChange={(e) => updateSetting('secondary_color', e.target.value)}
                                            className="w-full h-10 rounded border cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Couleur des étoiles
                                        </label>
                                        <input
                                            type="color"
                                            value={data.design_settings.star_color}
                                            onChange={(e) => updateSetting('star_color', e.target.value)}
                                            className="w-full h-10 rounded border cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Couleur de fond
                                        </label>
                                        <input
                                            type="color"
                                            value={data.design_settings.background_color}
                                            onChange={(e) => updateSetting('background_color', e.target.value)}
                                            className="w-full h-10 rounded border cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Style de bouton */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Style de bouton
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(buttonStyles).map(([key, className]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => updateSetting('button_style', key)}
                                                className={`p-3 border transition ${className} ${
                                                    data.design_settings.button_style === key
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                            >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Police */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Police de caractères
                                    </label>
                                    <select
                                        value={data.design_settings.font_family}
                                        onChange={(e) => updateSetting('font_family', e.target.value)}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="Inter">Inter</option>
                                        <option value="Roboto">Roboto</option>
                                        <option value="Poppins">Poppins</option>
                                        <option value="Montserrat">Montserrat</option>
                                        <option value="Open Sans">Open Sans</option>
                                    </select>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>

                                {progress && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Aperçu en temps réel */}
                        <div 
                            className="sticky top-6"
                            style={{ 
                                backgroundColor: data.design_settings.background_color,
                                fontFamily: data.design_settings.font_family 
                            }}
                        >
                            <div className="rounded-lg shadow-lg p-8 min-h-[600px] flex items-center justify-center">
                                <div 
                                    className="w-full max-w-md rounded-xl shadow-xl p-8"
                                    style={{ 
                                        backgroundColor: data.design_settings.card_background,
                                        color: data.design_settings.text_color 
                                    }}
                                >
                                    {/* Logo */}
                                    {data.design_settings.show_logo && logoPreview && (
                                        <div className="flex justify-center mb-6">
                                            <img 
                                                src={logoPreview} 
                                                alt={company.name}
                                                className="h-16 object-contain"
                                            />
                                        </div>
                                    )}

                                    {/* Titre */}
                                    <h1 className="text-2xl font-bold mb-2 text-center">
                                        {data.design_settings.custom_message}
                                    </h1>

                                    <p className="text-sm opacity-75 mb-6 text-center">
                                        {company.name}
                                    </p>

                                    {/* Étoiles */}
                                    <label className="block mb-3 font-medium">Votre note</label>
                                    <div className="flex gap-2 mb-6 justify-center">
                                        {[5, 4, 3, 2, 1].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                className="text-4xl transition-transform hover:scale-110"
                                                style={{ color: data.design_settings.star_color }}
                                            >
                                                {starStyles[data.design_settings.star_style]}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Commentaire */}
                                    <label className="block mb-2 font-medium">Votre commentaire</label>
                                    <textarea
                                        className="w-full border rounded-lg p-3 mb-6"
                                        rows="4"
                                        placeholder="Partagez votre expérience..."
                                        style={{ 
                                            borderColor: data.design_settings.primary_color + '40',
                                            fontFamily: data.design_settings.font_family 
                                        }}
                                    />

                                    {/* Bouton */}
                                    <button
                                        type="button"
                                        className={`w-full text-white py-3 font-semibold ${buttonStyles[data.design_settings.button_style]} transition-all hover:opacity-90`}
                                        style={{ backgroundColor: data.design_settings.primary_color }}
                                    >
                                        Envoyer mon avis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
