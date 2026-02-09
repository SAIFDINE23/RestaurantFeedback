import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Palette, Upload, Eye, Star, Sparkles, RefreshCw, ChevronRight, Copy, Check } from 'lucide-react';

export default function Edit({ auth, company }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [logoPreview, setLogoPreview] = useState(company.logo_url ? `/storage/${company.logo_url}` : null);
    const [copiedTemplate, setCopiedTemplate] = useState(null);
    const [activeTab, setActiveTab] = useState('templates');

    const { data, setData, post, processing, errors, progress } = useForm({
        logo: null,
        design_settings: company.design_settings,
    });

    // Design Templates
    const templates = {
        modern: {
            name: 'Moderne Bleu',
            description: 'Design contemporain avec dégradés bleus',
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            star_color: '#FBBF24',
            background_color: '#F0F9FF',
            card_background: '#FFFFFF',
            text_color: '#1F2937',
            star_style: 'modern',
            button_style: 'rounded',
            font_family: 'Inter',
            custom_message: 'Votre avis compte pour nous!',
            show_logo: true,
            icon: '🎨',
            colors: ['#3B82F6', '#1E40AF', '#FBBF24']
        },
        elegant: {
            name: 'Élégance Noire',
            description: 'Design premium avec fond sombre',
            primary_color: '#111827',
            secondary_color: '#6B7280',
            star_color: '#FCD34D',
            background_color: '#111827',
            card_background: '#1F2937',
            text_color: '#F3F4F6',
            star_style: 'classic',
            button_style: 'pill',
            font_family: 'Poppins',
            custom_message: 'Partagez votre expérience',
            show_logo: true,
            icon: '✨',
            colors: ['#111827', '#FCD34D', '#6B7280']
        },
        vibrant: {
            name: 'Vibrant Tropical',
            description: 'Design énergique avec couleurs chaudes',
            primary_color: '#FF6B35',
            secondary_color: '#F7931E',
            star_color: '#FFD700',
            background_color: '#FFF5E6',
            card_background: '#FFFFFF',
            text_color: '#1F2937',
            star_style: 'heart',
            button_style: 'rounded',
            font_family: 'Montserrat',
            custom_message: 'Aidez-nous à nous améliorer!',
            show_logo: true,
            icon: '🌴',
            colors: ['#FF6B35', '#F7931E', '#FFD700']
        },
        professional: {
            name: 'Professionnel Minimaliste',
            description: 'Design épuré et professionnel',
            primary_color: '#0F766E',
            secondary_color: '#14B8A6',
            star_color: '#F59E0B',
            background_color: '#F8FAFC',
            card_background: '#FFFFFF',
            text_color: '#0F172A',
            star_style: 'modern',
            button_style: 'square',
            font_family: 'Open Sans',
            custom_message: 'Votre retour est important',
            show_logo: true,
            icon: '💼',
            colors: ['#0F766E', '#14B8A6', '#F59E0B']
        },
        playful: {
            name: 'Ludique & Coloré',
            description: 'Design amusant avec couleurs vives',
            primary_color: '#A855F7',
            secondary_color: '#7C3AED',
            star_color: '#EC4899',
            background_color: '#FAF5FF',
            card_background: '#FFFFFF',
            text_color: '#4C1D95',
            star_style: 'thumbs',
            button_style: 'pill',
            font_family: 'Poppins',
            custom_message: 'Qu\'en pensez-vous?',
            show_logo: true,
            icon: '🎉',
            colors: ['#A855F7', '#EC4899', '#8B5CF6']
        },
        minimalist: {
            name: 'Minimaliste Zen',
            description: 'Design épuré et calme',
            primary_color: '#64748B',
            secondary_color: '#CBD5E1',
            star_color: '#FBBF24',
            background_color: '#FFFFFF',
            card_background: '#F8FAFC',
            text_color: '#1E293B',
            star_style: 'classic',
            button_style: 'pill',
            font_family: 'Inter',
            custom_message: 'Votre avis',
            show_logo: true,
            icon: '🧘',
            colors: ['#64748B', '#FBBF24', '#CBD5E1']
        }
    };

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

    const applyTemplate = (templateKey) => {
        const template = templates[templateKey];
        setData('design_settings', {
            ...data.design_settings,
            primary_color: template.primary_color,
            secondary_color: template.secondary_color,
            star_color: template.star_color,
            background_color: template.background_color,
            card_background: template.card_background,
            text_color: template.text_color,
            star_style: template.star_style,
            button_style: template.button_style,
            font_family: template.font_family,
            custom_message: template.custom_message,
            show_logo: template.show_logo,
        });
        setCopiedTemplate(templateKey);
        setTimeout(() => setCopiedTemplate(null), 2000);
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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Design Feedback</h2>
                            <p className="text-sm text-gray-600">Personnalisez la page de feedback de vos clients</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
                    >
                        <Eye className="w-4 h-4" />
                        {previewMode ? '👁️ Masquer aperçu' : '👁️ Voir aperçu'}
                    </button>
                </div>
            }
        >
            <Head title="Design Feedback" />

            <div className="py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabs Navigation */}
                    <div className="flex gap-4 mb-8 border-b border-gray-200 bg-white rounded-lg p-2 shadow-sm">
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-6 py-3 font-bold rounded-lg transition-all ${
                                activeTab === 'templates'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            🎨 Modèles de Design
                        </button>
                        <button
                            onClick={() => setActiveTab('custom')}
                            className={`px-6 py-3 font-bold rounded-lg transition-all ${
                                activeTab === 'custom'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            ⚙️ Personnalisation
                        </button>
                    </div>

                    {/* Templates Section */}
                    {activeTab === 'templates' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Choisissez un design</h3>
                                <p className="text-gray-600 font-medium">6 modèles professionnels prêts à l'emploi</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(templates).map(([key, template]) => (
                                    <div
                                        key={key}
                                        className="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-400 transition-all duration-300"
                                    >
                                        {/* Gradient accent */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="p-6 relative z-10">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{template.icon}</span>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-lg">{template.name}</h4>
                                                        <p className="text-sm text-gray-600">{template.description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Color Palette */}
                                            <div className="flex gap-2 mb-6">
                                                {template.colors.map((color, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-8 h-8 rounded-lg shadow-md border-2 border-gray-200"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>

                                            {/* Preview Card */}
                                            <div
                                                className="rounded-lg p-4 mb-6 shadow-md"
                                                style={{ backgroundColor: template.background_color }}
                                            >
                                                <div
                                                    className="rounded-lg p-3 text-center"
                                                    style={{
                                                        backgroundColor: template.card_background,
                                                        color: template.text_color
                                                    }}
                                                >
                                                    <p className="font-bold text-sm mb-2">{template.custom_message}</p>
                                                    <div className="flex justify-center gap-1 mb-3">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <span key={i} className="text-lg">
                                                                {starStyles[template.star_style]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={`w-full py-2 text-white text-xs font-bold ${buttonStyles[template.button_style]}`}
                                                        style={{ backgroundColor: template.primary_color }}
                                                    >
                                                        Envoyer
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Apply Button */}
                                            <button
                                                type="button"
                                                onClick={() => applyTemplate(key)}
                                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg inline-flex items-center justify-center gap-2"
                                            >
                                                {copiedTemplate === key ? (
                                                    <>
                                                        <Check size={18} />
                                                        Appliqué!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={18} />
                                                        Appliquer ce design
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6">
                                <p className="text-sm text-gray-700 font-medium">
                                    💡 Astuce: Après avoir appliqué un modèle, vous pouvez le personnaliser davantage dans l'onglet <strong>"Personnalisation"</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Custom Settings Section */}
                    {activeTab === 'custom' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Formulaire de configuration */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <Sparkles size={24} className="text-blue-600" />
                                    Personnalisation Avancée
                                </h3>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Logo */}
                                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                                        <label className="block text-sm font-black mb-3 text-gray-900 uppercase tracking-wide">
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            Logo de l'entreprise
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-lg file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100"
                                        />
                                        {errors.logo && <p className="text-red-500 text-xs mt-2">{errors.logo}</p>}
                                        
                                        <label className="flex items-center gap-3 mt-4 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.design_settings.show_logo}
                                                onChange={(e) => updateSetting('show_logo', e.target.checked)}
                                                className="w-5 h-5 rounded cursor-pointer"
                                            />
                                            <span className="text-sm font-medium">Afficher le logo</span>
                                        </label>
                                    </div>

                                    {/* Message personnalisé */}
                                    <div>
                                        <label className="block text-sm font-black mb-2 text-gray-900 uppercase tracking-wide">
                                            Message d'accueil
                                        </label>
                                        <input
                                            type="text"
                                            value={data.design_settings.custom_message}
                                            onChange={(e) => updateSetting('custom_message', e.target.value)}
                                            className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                            placeholder="Votre message d'accueil..."
                                        />
                                    </div>

                                    {/* Style d'étoiles */}
                                    <div>
                                        <label className="block text-sm font-black mb-3 text-gray-900 uppercase tracking-wide">
                                            <Star className="w-4 h-4 inline mr-2" />
                                            Style des étoiles
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {Object.entries(starStyles).map(([key, icon]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => updateSetting('star_style', key)}
                                                    className={`p-4 text-3xl border-2 rounded-lg transition-all font-bold ${
                                                        data.design_settings.star_style === key
                                                            ? 'border-blue-600 bg-blue-50 shadow-md'
                                                            : 'border-gray-200 hover:border-blue-400'
                                                    }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Couleurs */}
                                    <div>
                                        <label className="block text-sm font-black mb-3 text-gray-900 uppercase tracking-wide">
                                            🎨 Palette de Couleurs
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2">Primaire</label>
                                                <input
                                                    type="color"
                                                    value={data.design_settings.primary_color}
                                                    onChange={(e) => updateSetting('primary_color', e.target.value)}
                                                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2">Secondaire</label>
                                                <input
                                                    type="color"
                                                    value={data.design_settings.secondary_color}
                                                    onChange={(e) => updateSetting('secondary_color', e.target.value)}
                                                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2">Étoiles</label>
                                                <input
                                                    type="color"
                                                    value={data.design_settings.star_color}
                                                    onChange={(e) => updateSetting('star_color', e.target.value)}
                                                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2">Fond</label>
                                                <input
                                                    type="color"
                                                    value={data.design_settings.background_color}
                                                    onChange={(e) => updateSetting('background_color', e.target.value)}
                                                    className="w-full h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-400 transition"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Style de bouton */}
                                    <div>
                                        <label className="block text-sm font-black mb-3 text-gray-900 uppercase tracking-wide">
                                            Style du bouton
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.entries(buttonStyles).map(([key, className]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => updateSetting('button_style', key)}
                                                    className={`p-3 border-2 transition-all font-bold ${className} ${
                                                        data.design_settings.button_style === key
                                                            ? 'border-blue-600 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-400'
                                                    }`}
                                                >
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Police */}
                                    <div>
                                        <label className="block text-sm font-black mb-2 text-gray-900 uppercase tracking-wide">
                                            Police de caractères
                                        </label>
                                        <select
                                            value={data.design_settings.font_family}
                                            onChange={(e) => updateSetting('font_family', e.target.value)}
                                            className="w-full border-2 border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                        >
                                            <option value="Inter">Inter - Moderne</option>
                                            <option value="Roboto">Roboto - Professionnel</option>
                                            <option value="Poppins">Poppins - Ludique</option>
                                            <option value="Montserrat">Montserrat - Élégant</option>
                                            <option value="Open Sans">Open Sans - Neutre</option>
                                        </select>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-black hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 uppercase tracking-wide text-lg"
                                    >
                                        {processing ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
                                    </button>

                                    {progress && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Aperçu en temps réel */}
                            <div className="sticky top-6">
                                <div 
                                    className="rounded-2xl shadow-2xl p-12 min-h-[700px] flex items-center justify-center border-4 border-gray-200"
                                    style={{ 
                                        backgroundColor: data.design_settings.background_color,
                                        fontFamily: data.design_settings.font_family 
                                    }}
                                >
                                    <div 
                                        className="w-full max-w-sm rounded-2xl shadow-2xl p-8 border-4"
                                        style={{ 
                                            backgroundColor: data.design_settings.card_background,
                                            color: data.design_settings.text_color,
                                            borderColor: data.design_settings.primary_color + '40'
                                        }}
                                    >
                                        {/* Logo */}
                                        {data.design_settings.show_logo && logoPreview && (
                                            <div className="flex justify-center mb-6">
                                                <img 
                                                    src={logoPreview} 
                                                    alt={company.name}
                                                    className="h-20 object-contain rounded-lg shadow-md"
                                                />
                                            </div>
                                        )}

                                        {/* Titre */}
                                        <h1 className="text-2xl font-black mb-2 text-center tracking-tight">
                                            {data.design_settings.custom_message}
                                        </h1>

                                        <p className="text-sm opacity-75 mb-8 text-center font-medium">
                                            {company.name}
                                        </p>

                                        {/* Étoiles */}
                                        <label className="block mb-3 font-bold text-sm uppercase tracking-wide">Votre note</label>
                                        <div className="flex gap-2 mb-8 justify-center">
                                            {[5, 4, 3, 2, 1].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    className="text-4xl transition-transform hover:scale-125 cursor-pointer"
                                                    style={{ color: data.design_settings.star_color }}
                                                >
                                                    {starStyles[data.design_settings.star_style]}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Commentaire */}
                                        <label className="block mb-2 font-bold text-sm uppercase tracking-wide">Votre avis</label>
                                        <textarea
                                            className="w-full border-2 rounded-lg p-3 mb-6 resize-none font-medium text-sm"
                                            rows="4"
                                            placeholder="Partagez votre expérience..."
                                            style={{ 
                                                borderColor: data.design_settings.primary_color + '60',
                                                fontFamily: data.design_settings.font_family 
                                            }}
                                        />

                                        {/* Bouton */}
                                        <button
                                            type="button"
                                            className={`w-full text-white py-3 font-bold transition-all text-sm uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 ${buttonStyles[data.design_settings.button_style]}`}
                                            style={{ backgroundColor: data.design_settings.primary_color }}
                                        >
                                            Envoyer mon avis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
