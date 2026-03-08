import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import LowCreditsAlert from '@/Components/LowCreditsAlert';

// Composant Skeleton Loader pour entreprise
function SkeletonLoader() {
    return (
        <div className="animate-pulse p-6 space-y-6">
            {/* Header avec actions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                    <div className="h-10 bg-gradient-to-r from-indigo-200 to-violet-200 rounded-xl w-40"></div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-xl"></div>
                            <div className="h-6 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="h-3 bg-gray-200 rounded w-28"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contenu principal avec graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique principal */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="flex gap-2">
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
                </div>

                {/* Sidebar stats */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="space-y-3">
                            {[70, 85, 60, 45].map((width, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full" style={{ width: `${width}%` }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="h-9 bg-gray-200 rounded-lg w-64"></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <th key={i} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: 'dashboard', icon: HomeIcon, current: route().current('dashboard'), enabled: true, section: 'main' },
        { name: 'Radar IA', href: 'radar', icon: ChartIcon, current: route().current('radar'), enabled: true, section: 'main', badge: 'NEW' },
        { name: 'Tâches', href: 'tasks.index', icon: ChatIcon, current: route().current('tasks.*'), enabled: true, section: 'main' },
        { name: 'Abonnement', href: 'subscription.index', icon: CreditCardIcon, current: route().current('subscription.*'), enabled: true, section: 'main', badge: 'CRÉDITS' },
        { name: 'Contacts', href: 'contacts.index', icon: UsersIcon, current: route().current('contacts.*'), enabled: true, section: 'gestion' },
        { name: 'Studio envoi', href: 'feedback-requests.studio', icon: ChatIcon, current: route().current('feedback-requests.studio'), enabled: true, section: 'gestion' },
        { name: 'Feedbacks', href: 'feedbacks.index', icon: ChatIcon, current: route().current('feedbacks.*'), enabled: true, section: 'gestion' },
        { name: 'Design Feedback', href: 'feedback.design.edit', icon: PaletteIcon, current: route().current('feedback.design.*'), enabled: true, section: 'config' },
        { name: 'Plateformes d\'avis', href: 'company.review-platforms.edit', icon: Star, current: route().current('company.review-platforms.*'), enabled: true, section: 'config' },
        { name: 'Analytics', href: 'analytics', icon: ChartIcon, current: route().current('analytics'), enabled: true, section: 'main' },
        { name: 'Paramètres', href: 'settings.index', icon: SettingsIcon, current: route().current('settings.*'), enabled: true, section: 'config' },
    ];

    const sections = {
        main: 'Principal',
        gestion: 'Gestion',
        config: 'Configuration',
        future: 'Bientôt disponible'
    };

    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            router.post(route('logout'));
        }
    };

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        const offStart = router.on('start', start);
        const offFinish = router.on('finish', finish);

        return () => {
            offStart();
            offFinish();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
                transform transition-transform duration-300 ease-in-out shadow-xl
                lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="relative border-b border-gray-100">
                        <Link href={route('dashboard')} className="relative flex items-center gap-3 px-6 py-5 hover:bg-gray-50 transition-colors group">
                            <img src="/images/logo_feedora.png" alt="Feedora Logo" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-xl font-bold text-feedora-500 tracking-tight">Feedora</h1>
                                <p className="text-xs text-gray-500 font-medium">Plateforme Restaurant</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
                        {Object.entries(sections).map(([sectionKey, sectionLabel]) => {
                            const sectionItems = navigation.filter(item => item.section === sectionKey);
                            if (sectionItems.length === 0) return null;

                            return (
                                <div key={sectionKey}>
                                    <h3 className="px-4 mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        {sectionLabel}
                                    </h3>
                                    <div className="space-y-1">
                                        {sectionItems.map((item) => {
                                            if (!item.enabled) {
                                                return (
                                                    <div
                                                        key={item.name}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed opacity-50"
                                                    >
                                                        <item.icon className="w-5 h-5" />
                                                        {item.name}
                                                        <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                            Bientôt
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={route(item.href)}
                                                    className={`
                                                        relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                                                        transition-all duration-200 group
                                                        ${item.current 
                                                            ? 'bg-feedora-500 text-white shadow-lg shadow-feedora-500/30' 
                                                            : 'text-gray-700 hover:text-feedora-600 hover:bg-feedora-50'
                                                        }
                                                    `}
                                                >
                                                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                                                    <span>{item.name}</span>
                                                    {item.badge && (
                                                        <span className="ml-auto text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </nav>

                    {/* User & Logout */}
                    <div className="relative border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                        <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 group hover:border-feedora-200 transition-colors">
                            <div className="w-11 h-11 bg-gradient-to-br from-feedora-400 to-feedora-600 rounded-full flex items-center justify-center ring-2 ring-feedora-100">
                                <span className="text-white font-bold text-base">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name || 'Utilisateur'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'email@example.com'}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all duration-200 group"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-gray-500 hover:text-feedora-600 hover:bg-feedora-50 rounded-lg transition-colors"
                            >
                                <MenuIcon className="w-6 h-6" />
                            </button>
                            <div>
                                <div className="text-xl font-bold text-gray-900">{header}</div>
                                <p className="text-xs text-gray-500 mt-0.5">Gestion intelligente de feedbacks</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button className="relative p-2.5 text-gray-400 hover:text-feedora-600 hover:bg-feedora-50 rounded-xl transition-all group">
                                <BellIcon className="w-6 h-6" />
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-feedora-500 rounded-full ring-2 ring-white animate-pulse"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="relative min-h-screen">
                    <LowCreditsAlert />
                    {/* Skeleton overlay pendant le chargement */}
                    {loading && (
                        <div className="absolute inset-0 bg-gray-50 z-20 transition-opacity duration-300">
                            <SkeletonLoader />
                        </div>
                    )}
                    
                    {/* Contenu réel avec transition */}
                    <div className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Icon Components
function HomeIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function UsersIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

function UserPlusIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );
}

function ChatIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
    );
}

function ChartIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function RadarIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function TaskIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4M2 12a10 10 0 1010-10" />
        </svg>
    );
}

function SettingsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function LogoutIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}

function BellIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );
}

function MenuIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function BuildingIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );
}

function PaletteIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
    );
}

function Star({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );
}

function CreditCardIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V5a3 3 0 00-3-3H6a3 3 0 00-3 3v11a3 3 0 003 3z" />
        </svg>
    );
}