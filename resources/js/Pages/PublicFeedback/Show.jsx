import { useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, User, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const starIcons = {
    classic: '⭐',
    modern: '★',
    heart: '❤️',
    thumbs: '👍',
};

const buttonStylesMap = {
    rounded: 'rounded-lg',
    square: 'rounded-none',
    pill: 'rounded-full',
};

const ratingLabels = {
    1: 'Décevant 😞',
    2: 'Peut mieux faire 😐',
    3: 'Correct 🙂',
    4: 'Très bien ! 😊',
    5: 'Excellent ! 🤩',
};

const commentPrompts = {
    1: "Nous sommes désolés… Dites-nous ce qui n'a pas fonctionné, votre retour nous aide à progresser.",
    2: "Merci pour votre franchise. Qu'aurions-nous pu faire de mieux ?",
    3: "Merci ! Partagez-nous un petit mot — chaque détail compte pour nous améliorer.",
    4: "Super ! Qu'est-ce qui vous a particulièrement plu ? Votre témoignage nous motive !",
    5: "Wow, merci ! Racontez-nous votre expérience — vos mots inspirent toute notre équipe 💪",
};

const commentPlaceholders = {
    1: "Le service était lent, le plat froid…",
    2: "L'ambiance est agréable mais le plat manquait de…",
    3: "Bonne expérience globale, peut-être améliorer…",
    4: "J'ai adoré le plat du jour, le serveur était…",
    5: "Un moment incroyable ! L'accueil chaleureux, les saveurs…",
};

export default function Show({ token, postUrl, company }) {
    const { data, setData, post, processing, errors } = useForm({
        rating: 0,
        comment: '',
        name: '',
        email: '',
        phone: '',
    });

    const [step, setStep] = useState(1);
    const [animate, setAnimate] = useState(false);

    const design = company.design_settings;
    const btnClass = buttonStylesMap[design.button_style] || 'rounded-lg';

    useEffect(() => {
        setAnimate(true);
    }, []);

    const goToStep = useCallback((nextStep) => {
        setAnimate(false);
        setTimeout(() => {
            setStep(nextStep);
            setAnimate(true);
        }, 200);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(postUrl);
    };
    const inputStyle = {
        borderColor: design.primary_color + '30',
        borderRadius: design.button_style === 'square' ? '0' : '0.5rem',
        fontFamily: design.font_family,
    };

    const handleFocus = (e) => (e.target.style.borderColor = design.primary_color);
    const handleBlur = (e) => (e.target.style.borderColor = design.primary_color + '30');

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundColor: design.background_color,
                fontFamily: design.font_family,
            }}
        >
            <div
                className={`w-full max-w-md shadow-xl p-8 transition-all duration-500 ${
                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                    backgroundColor: design.card_background,
                    color: design.text_color,
                    borderRadius: design.button_style === 'square' ? '0' : '1.5rem',
                }}
            >
                {/* Logo */}
                {design.show_logo && company.logo_url && (
                    <div className="flex justify-center mb-4">
                        <img
                            src={`/storage/${company.logo_url}`}
                            alt={company.name}
                            className="h-16 object-contain"
                        />
                    </div>
                )}

                {/* Nom */}
                <h1 className="text-lg font-bold text-center mb-1 opacity-80">{company.name}</h1>
                <p className="text-center text-sm mb-6 opacity-50">{design.custom_message}</p>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: step === s ? '2rem' : '0.5rem',
                                backgroundColor: step >= s ? design.primary_color : design.primary_color + '30',
                            }}
                        />
                    ))}
                </div>

                {/* ===== STEPS ===== */}
                <form onSubmit={submit}>

                    {/* ----- STEP 1 : Rating ----- */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="mb-2">
                                <Sparkles className="inline-block w-6 h-6 mb-2" style={{ color: design.primary_color }} />
                            </div>
                            <h2 className="text-xl font-bold mb-1">Comment était votre expérience ?</h2>
                            <p className="text-sm opacity-60 mb-8">Touchez une étoile pour noter</p>

                            <div className="flex gap-3 justify-center mb-4">
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setData('rating', r)}
                                        className={`text-5xl transition-all duration-300 transform hover:scale-125 ${
                                            data.rating >= r ? 'opacity-100 scale-110' : 'opacity-25 grayscale'
                                        }`}
                                        style={{ color: data.rating >= r ? design.star_color : undefined }}
                                    >
                                        {starIcons[design.star_style] || '⭐'}
                                    </button>
                                ))}
                            </div>

                            <div className="h-8 flex items-center justify-center">
                                {data.rating > 0 && (
                                    <span className="text-lg font-semibold transition-all duration-300" style={{ color: design.primary_color }}>
                                        {ratingLabels[data.rating]}
                                    </span>
                                )}
                            </div>

                            {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}

                            <button
                                type="button"
                                disabled={data.rating === 0}
                                onClick={() => goToStep(2)}
                                className={`w-full text-white py-4 mt-8 font-semibold transition-all ${btnClass} hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                                style={{ backgroundColor: design.primary_color }}
                            >
                                Continuer
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* ----- STEP 2 : Comment ----- */}
                    {step === 2 && (
                        <div>
                            <button type="button" onClick={() => goToStep(1)} className="flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-4 transition-opacity">
                                <ChevronLeft className="w-4 h-4" /> Modifier ma note
                            </button>

                            <div className="text-center mb-6">
                                <MessageSquare className="inline-block w-8 h-8 mb-2" style={{ color: design.primary_color }} />
                                <h2 className="text-xl font-bold mb-2">Un petit mot ?</h2>
                                <p className="text-sm leading-relaxed opacity-75 max-w-xs mx-auto">
                                    {commentPrompts[data.rating] || commentPrompts[3]}
                                </p>
                            </div>

                            <textarea
                                className="w-full border-2 p-4 transition-all focus:ring-2 focus:outline-none resize-none"
                                style={{
                                    borderColor: design.primary_color + '30',
                                    borderRadius: design.button_style === 'square' ? '0' : '0.75rem',
                                    fontFamily: design.font_family,
                                }}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                rows="4"
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                placeholder={commentPlaceholders[data.rating] || 'Partagez votre expérience…'}
                            />

                            {data.comment.length > 0 && (
                                <p className="text-xs text-right mt-1 opacity-40">{data.comment.length} / 2000</p>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => goToStep(3)}
                                    className={`flex-1 py-3 font-medium border-2 transition-all ${btnClass} hover:opacity-80`}
                                    style={{ borderColor: design.primary_color + '40', color: design.primary_color }}
                                >
                                    Passer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goToStep(3)}
                                    className={`flex-1 text-white py-3 font-semibold transition-all ${btnClass} hover:opacity-90 flex items-center justify-center gap-1`}
                                    style={{ backgroundColor: design.primary_color }}
                                >
                                    Continuer <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-center mt-4 opacity-40">
                                Le commentaire est facultatif, mais chaque avis nous aide énormément 🙏
                            </p>
                        </div>
                    )}

                    {/* ----- STEP 3 : Contact + Submit ----- */}
                    {step === 3 && (
                        <div>
                            <button type="button" onClick={() => goToStep(2)} className="flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-4 transition-opacity">
                                <ChevronLeft className="w-4 h-4" /> Retour
                            </button>

                            <div className="text-center mb-6">
                                <User className="inline-block w-8 h-8 mb-2" style={{ color: design.primary_color }} />
                                <h2 className="text-xl font-bold mb-2">Laissez-nous vos coordonnées</h2>
                                <p className="text-sm opacity-60">Facultatif — pour vous recontacter ou vous remercier</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 opacity-70">Votre nom</label>
                                    <input type="text" className="w-full border-2 p-3 transition-all focus:ring-2 focus:outline-none" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Jean Dupont" />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 opacity-70">E-mail</label>
                                    <input type="email" className="w-full border-2 p-3 transition-all focus:ring-2 focus:outline-none" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="jean@exemple.com" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 opacity-70">Téléphone</label>
                                    <input type="tel" className="w-full border-2 p-3 transition-all focus:ring-2 focus:outline-none" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+33 6 12 34 56 78" />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button type="submit" disabled={processing} className={`flex-1 py-3 font-medium border-2 transition-all ${btnClass} hover:opacity-80 disabled:opacity-50`} style={{ borderColor: design.primary_color + '40', color: design.primary_color }}>
                                    {processing ? '...' : 'Envoyer sans'}
                                </button>
                                <button type="submit" disabled={processing} className={`flex-1 text-white py-4 font-semibold transition-all ${btnClass} hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1`} style={{ backgroundColor: design.primary_color }}>
                                    {processing ? 'Envoi…' : 'Envoyer mon avis ✨'}
                                </button>
                            </div>

                            <p className="text-xs text-center mt-4 opacity-40">Vos données sont protégées et ne seront jamais partagées</p>
                        </div>
                    )}

                </form>
            </div>

            {/* Branding discret */}
            <div className="fixed bottom-3 left-0 right-0 text-center">
                <span className="text-xs opacity-20">Propulsé par RestoFeedback</span>
            </div>
        </div>
    );
}
