import { useForm } from '@inertiajs/react';

export default function Create({ token, postUrl, company, customer }) {
    const { data, setData, post, processing, errors } = useForm({
        rating: 5,
        comment: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(postUrl);
    };

    const design = company.design_settings;

    // Styles d'étoiles
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

    const StarRating = ({ value, onChange }) => {
        const stars = [5, 4, 3, 2, 1];
        return (
            <div className="flex gap-2 justify-center">
                {stars.map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange(rating)}
                        className={`text-5xl transition-all transform hover:scale-110 ${
                            data.rating >= rating ? 'opacity-100' : 'opacity-30'
                        }`}
                        style={{ color: design.star_color }}
                    >
                        {starStyles[design.star_style]}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{ 
                backgroundColor: design.background_color,
                fontFamily: design.font_family 
            }}
        >
            <form 
                onSubmit={submit} 
                className="w-full max-w-md shadow-xl p-8"
                style={{ 
                    backgroundColor: design.card_background,
                    color: design.text_color,
                    borderRadius: design.button_style === 'square' ? '0' : '1rem'
                }}
            >
                {/* Logo */}
                {design.show_logo && company.logo_url && (
                    <div className="flex justify-center mb-6">
                        <img 
                            src={`/storage/${company.logo_url}`} 
                            alt={company.name}
                            className="h-20 object-contain"
                        />
                    </div>
                )}

                {/* Titre */}
                <h1 className="text-2xl font-bold mb-2 text-center">
                    {design.custom_message}
                </h1>

                <p className="text-sm opacity-75 mb-6 text-center">
                    {company.name} {customer ? `• ${customer}` : ''}
                </p>

                {/* Rating avec étoiles personnalisées */}
                <label className="block mb-3 font-medium text-center">
                    Votre note
                </label>
                <StarRating 
                    value={data.rating}
                    onChange={(rating) => setData('rating', rating)}
                />
                <p className="text-center mt-2 text-sm opacity-60">
                    {data.rating} / 5
                </p>

                {errors.rating && (
                    <p className="text-red-500 text-sm mt-2 text-center">{errors.rating}</p>
                )}

                {/* Commentaire */}
                <label className="block mt-6 mb-2 font-medium">
                    Votre commentaire (optionnel)
                </label>
                <textarea
                    className="w-full border rounded-lg p-3 transition-all focus:ring-2 focus:outline-none"
                    style={{ 
                        borderColor: design.primary_color + '40',
                        fontFamily: design.font_family,
                    }}
                    onFocus={(e) => e.target.style.borderColor = design.primary_color}
                    onBlur={(e) => e.target.style.borderColor = design.primary_color + '40'}
                    rows="4"
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    placeholder="Partagez votre expérience avec nous..."
                />

                {/* Bouton d'envoi */}
                <button
                    disabled={processing}
                    className={`w-full text-white py-4 mt-6 font-semibold transition-all ${buttonStyles[design.button_style]} hover:opacity-90 disabled:opacity-50`}
                    style={{ backgroundColor: design.primary_color }}
                >
                    {processing ? 'Envoi en cours...' : 'Envoyer mon avis'}
                </button>

                {/* Note de confidentialité */}
                <p className="text-xs text-center mt-4 opacity-50">
                    Votre avis nous aide à améliorer nos services
                </p>
            </form>
        </div>
    );
}

