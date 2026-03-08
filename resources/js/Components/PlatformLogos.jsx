// Logos originaux des plateformes d'avis — fichiers SVG locaux dans /images/platforms/
// Tous les logos sont stockés localement : aucune dépendance CDN externe

const PLATFORMS = {
    google:       { file: 'google.svg',       label: 'Google' },
    facebook:     { file: 'facebook.svg',     label: 'Facebook' },
    tripadvisor:  { file: 'tripadvisor.svg',  label: 'TripAdvisor' },
    lafourchette: { file: 'lafourchette.svg', label: 'LaFourchette' },
    trustpilot:   { file: 'trustpilot.svg',   label: 'Trustpilot' },
    yelp:         { file: 'yelp.svg',         label: 'Yelp' },
    zomato:       { file: 'zomato.svg',       label: 'Zomato' },
    opentable:    { file: 'opentable.svg',    label: 'OpenTable' },
    deliveroo:    { file: 'deliveroo.svg',    label: 'Deliveroo' },
    ubereats:     { file: 'ubereats.svg',     label: 'Uber Eats' },
    justeat:      { file: 'justeat.svg',      label: 'Just Eat' },
    michelin:     { file: 'michelin.svg',     label: 'Michelin' },
    booking:      { file: 'booking.svg',      label: 'Booking' },
    petitfute:    { file: 'petitfute.svg',    label: 'Petit Futé' },
    discount:     { file: 'discount.svg',     label: 'Discount' },
    restopolis:   { file: 'restopolis.svg',   label: 'Restopolis' },
    gaultmillau:  { file: 'gaultmillau.svg',  label: 'Gault&Millau' },
    other:        { file: 'other.svg',        label: 'Autre' },
};

// Fonction utilitaire pour obtenir le logo par ID
export const getPlatformLogo = (platformId, className = 'w-8 h-8') => {
    const config = PLATFORMS[platformId] || PLATFORMS.other;
    return (
        <img
            src={`/images/platforms/${config.file}`}
            alt={config.label}
            className={`${className} object-contain`}
            loading="lazy"
        />
    );
};
