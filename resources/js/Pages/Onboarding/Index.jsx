import { Head, useForm, router } from '@inertiajs/react';
import {
    ChevronRight,
    CheckCircle2,
    ArrowRight,
    Link as LinkIcon,
    UserPlus,
    Rocket,
    Utensils,
    Hotel,
    Coffee,
    ShoppingBag,
    Scissors,
    Stethoscope,
    Dumbbell,
    Car,
    Briefcase,
    GraduationCap,
    Home,
    Sparkles,
    Mail,
    Phone,
    ExternalLink,
    SkipForward,
} from 'lucide-react';
import feedoraLogo from '../../../images/logo_feedora.png';

/* ============================================================
   SECTOR OPTIONS
   ============================================================ */
const SECTORS = [
    { value: 'Restaurant',        label: 'Restaurant',        icon: Utensils,     color: 'from-orange-500 to-red-500' },
    { value: 'Hôtel',             label: 'Hôtel',             icon: Hotel,        color: 'from-blue-500 to-indigo-500' },
    { value: 'Bar / Café',        label: 'Bar / Café',        icon: Coffee,       color: 'from-amber-500 to-orange-500' },
    { value: 'Commerce',          label: 'Commerce',          icon: ShoppingBag,  color: 'from-pink-500 to-rose-500' },
    { value: 'Beauté / Spa',      label: 'Beauté / Spa',      icon: Scissors,     color: 'from-purple-500 to-pink-500' },
    { value: 'Santé',             label: 'Santé / Médical',   icon: Stethoscope,  color: 'from-teal-500 to-cyan-500' },
    { value: 'Sport / Fitness',   label: 'Sport / Fitness',   icon: Dumbbell,     color: 'from-green-500 to-emerald-500' },
    { value: 'Automobile',        label: 'Automobile',        icon: Car,          color: 'from-slate-500 to-gray-600' },
    { value: 'Services',          label: 'Services B2B',      icon: Briefcase,    color: 'from-violet-500 to-purple-500' },
    { value: 'Éducation',         label: 'Éducation',         icon: GraduationCap,color: 'from-sky-500 to-blue-500' },
    { value: 'Immobilier',        label: 'Immobilier',        icon: Home,         color: 'from-yellow-500 to-amber-500' },
    { value: 'Autre',             label: 'Autre',             icon: Sparkles,     color: 'from-gray-400 to-gray-500' },
];

/* ============================================================
   PROGRESS BAR
   ============================================================ */
function ProgressBar({ steps, currentStep }) {
    return (
        <div className="flex items-center gap-0 w-full max-w-md mx-auto">
            {steps.map((step, idx) => {
                const isCompleted = step.done || currentStep > step.id;
                const isCurrent   = currentStep === step.id;
                const isLast      = idx === steps.length - 1;
                return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                        {/* Circle */}
                        <div className={`
                            relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 flex-shrink-0
                            ${isCompleted
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white shadow-lg shadow-indigo-200'
                                : isCurrent
                                    ? 'bg-white border-indigo-500 text-indigo-600 shadow-md'
                                    : 'bg-white border-gray-200 text-gray-400'
                            }
                        `}>
                            {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <span className="text-sm font-bold">{step.id}</span>
                            )}
                            {isCurrent && (
                                <span className="absolute -bottom-6 text-xs font-semibold text-indigo-600 whitespace-nowrap">
                                    {step.title}
                                </span>
                            )}
                        </div>
                        {/* Connector line */}
                        {!isLast && (
                            <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                                isCompleted ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ============================================================
   STEP 1 — Choose Sector
   ============================================================ */
function Step1({ company }) {
    const { data, setData, post, processing, errors } = useForm({
        sector: company.sector || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('onboarding.step', { step: 1 }));
    };

    return (
        <form onSubmit={submit}>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Quel est votre secteur d'activité ?
                </h2>
                <p className="text-gray-500 text-sm">
                    Cela nous permet de personnaliser l'analyse IA et les benchmarks.
                </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {SECTORS.map((sector) => {
                    const Icon = sector.icon;
                    const selected = data.sector === sector.value;
                    return (
                        <button
                            key={sector.value}
                            type="button"
                            onClick={() => setData('sector', sector.value)}
                            className={`
                                relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 text-center
                                ${selected
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                                    : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                                }
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-xl bg-gradient-to-br ${sector.color} flex items-center justify-center shadow-sm
                            `}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-semibold leading-tight ${selected ? 'text-indigo-700' : 'text-gray-600'}`}>
                                {sector.label}
                            </span>
                            {selected && (
                                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-indigo-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {errors.sector && (
                <p className="text-red-500 text-sm mb-4">{errors.sector}</p>
            )}

            <button
                type="submit"
                disabled={!data.sector || processing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
            >
                Continuer <ChevronRight className="w-5 h-5" />
            </button>
        </form>
    );
}

/* ============================================================
   STEP 2 — Google Review URL
   ============================================================ */
function Step2({ company }) {
    const { data, setData, post, processing, errors } = useForm({
        google_review_url: company.google_review_url || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('onboarding.step', { step: 2 }));
    };

    const handleSkip = () => {
        setData('google_review_url', '');
        router.post(route('onboarding.step', { step: 2 }), {
            google_review_url: '',
        }, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit}>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Votre lien Google Reviews
                </h2>
                <p className="text-gray-500 text-sm">
                    Ce lien permet de rediriger automatiquement vos clients satisfaits vers votre fiche Google.
                    C'est la clé pour multiplier vos avis 5 étoiles.
                </p>
            </div>

            {/* Visual illustration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    {/* Google "G" logo */}
                    <svg viewBox="0 0 24 24" className="w-7 h-7">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Comment trouver ce lien ?</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Cherchez votre entreprise sur <strong>Google Maps</strong></li>
                        <li>Cliquez sur votre fiche → <strong>Écrire un avis</strong></li>
                        <li>Copiez l'URL dans la barre d'adresse</li>
                    </ol>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lien Google Reviews
                </label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <LinkIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="url"
                        value={data.google_review_url}
                        onChange={(e) => setData('google_review_url', e.target.value)}
                        placeholder="https://search.google.com/local/writereview?placeid=..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
                    />
                </div>
                {errors.google_review_url && (
                    <p className="text-red-500 text-xs mt-1">{errors.google_review_url}</p>
                )}
                {data.google_review_url && (
                    <a
                        href={data.google_review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 mt-1 hover:underline"
                    >
                        Tester le lien <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleSkip}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
                >
                    Passer pour l'instant
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                >
                    Continuer <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}

/* ============================================================
   STEP 3 — Add First Customer
   ============================================================ */
function Step3() {
    const { data, setData, post, processing, errors } = useForm({
        name:  '',
        email: '',
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('onboarding.step', { step: 3 }));
    };

    const handleSkip = () => {
        router.post(route('onboarding.step', { step: 3 }), {
            skip_customer: true,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit}>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Ajoutez votre premier client
                </h2>
                <p className="text-gray-500 text-sm">
                    Cette étape est optionnelle. Vous pourrez ajouter vos clients plus tard depuis votre tableau de bord.
                </p>
            </div>

            {/* Illustration */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <UserPlus className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-gray-700">
                    💡 <strong>Conseil :</strong> Si vous avez déjà un contact sous la main, ajoutez-le maintenant. Sinon, vous pourrez le faire plus tard sans problème.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex : Marie Dupont"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
                        required
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email <span className="text-gray-400 font-normal">(ou téléphone)</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="marie@exemple.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Téléphone <span className="text-gray-400 font-normal">(ou email)</span>
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+33 6 12 34 56 78"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-sm transition-colors"
                        />
                    </div>
                </div>

                {errors.contact && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                        {errors.contact}
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleSkip}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all text-sm"
                >
                    Je le ferai plus tard
                </button>
                <button
                    type="submit"
                    disabled={!data.name || (!data.email && !data.phone) || processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                >
                    Ajouter ce client <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}

/* ============================================================
   STEP 4 — Celebration / Launch
   ============================================================ */
function Step4({ lastCustomer, companyName }) {
    const { post: postComplete, processing: completing } = useForm({});
    const { post: postSkip,    processing: skipping    } = useForm({});

    const handleGoToDashboard = () => {
        postComplete(route('onboarding.step', { step: 4 }));
    };

    return (
        <div className="text-center">
            {/* Confetti / celebration */}
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
                Tout est prêt, {companyName} !
            </h2>
            <p className="text-gray-500 text-sm mb-8">
                Vous avez configuré les bases. Voici un résumé de ce qui vous attend.
            </p>

            {/* What's set up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
                    <div className="text-2xl mb-2">🏢</div>
                    <p className="text-xs font-bold text-gray-700 mb-1">Profil configuré</p>
                    <p className="text-xs text-gray-500">Secteur et entreprise enregistrés.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                    <div className="text-2xl mb-2">⭐</div>
                    <p className="text-xs font-bold text-gray-700 mb-1">Google Reviews</p>
                    <p className="text-xs text-gray-500">Redirection automatique des clients satisfaits.</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                    <div className="text-2xl mb-2">👤</div>
                    <p className="text-xs font-bold text-gray-700 mb-1">Contacts clients</p>
                    <p className="text-xs text-gray-500">
                        {lastCustomer ? lastCustomer.name : 'Vous pourrez les ajouter plus tard.'}
                    </p>
                </div>
            </div>

            {/* What to do next */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
                <p className="text-sm font-bold text-gray-800 mb-2">🚀 Votre prochaine action</p>
                <p className="text-sm text-gray-600">
                    Sur votre tableau de bord, allez dans <strong className="text-amber-700">Contacts</strong>
                    {lastCustomer ? (
                        <>
                            {' '}et envoyez votre première demande d'avis à <strong>{lastCustomer.name}</strong>.
                        </>
                    ) : (
                        <>
                            {' '}pour importer vos premiers clients quand vous serez prêt.
                        </>
                    )}
                    {' '}Ça prend 30 secondes !
                </p>
            </div>

            <button
                onClick={handleGoToDashboard}
                disabled={completing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-200 mb-3"
            >
                <Rocket className="w-5 h-5" />
                Accéder à mon tableau de bord
            </button>
        </div>
    );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function OnboardingIndex({ company, steps, currentStep, lastCustomer }) {
    const { post: postSkip, processing: skipping } = useForm({});

    const handleSkip = () => {
        postSkip(route('onboarding.skip'));
    };

    return (
        <>
            <Head title="Bienvenue sur Feedora" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex flex-col">

                {/* Top bar */}
                <div className="w-full py-5 px-6 flex items-center justify-between border-b border-white/60 bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <img
                            src={feedoraLogo}
                            alt="Feedora"
                            className="h-9 w-auto object-contain"
                        />
                    </div>
                    <button
                        onClick={handleSkip}
                        disabled={skipping}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                        Passer la configuration
                    </button>
                </div>

                {/* Main content */}
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-lg">

                        {/* Header */}
                        <div className="text-center mb-10">
                            <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider">
                                Configuration initiale
                            </p>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Bienvenue sur Feedora !
                            </h1>
                            <p className="text-gray-500 text-sm">
                                4 étapes rapides pour démarrer votre collecte d'avis clients.
                            </p>
                        </div>

                        {/* Progress stepper */}
                        <div className="mb-12 px-4">
                            <ProgressBar steps={steps} currentStep={currentStep} />
                        </div>

                        {/* Step card */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-8">
                            {currentStep === 1 && (
                                <Step1 company={company} />
                            )}
                            {currentStep === 2 && (
                                <Step2 company={company} />
                            )}
                            {currentStep === 3 && (
                                <Step3 />
                            )}
                            {currentStep === 4 && (
                                <Step4
                                    lastCustomer={lastCustomer}
                                    companyName={company.name}
                                />
                            )}
                        </div>

                        {/* Step counter */}
                        <p className="text-center text-xs text-gray-400 mt-6">
                            Étape {Math.min(currentStep, 4)} sur 4
                        </p>

                    </div>
                </div>
            </div>
        </>
    );
}
