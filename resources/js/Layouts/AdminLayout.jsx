import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Composant Skeleton Loader
function SkeletonLoader() {
    return (
        <div className="animate-pulse p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                ))}
            </div>

            {/* Table/Content Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                    <div className="space-y-3">
                        {[60, 80, 45, 90, 55].map((width, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-8 bg-gray-200 rounded" style={{ width: `${width}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Détection des transitions de page Inertia
    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        const removeStart = router.on('start', handleStart);
        const removeFinish = router.on('finish', handleFinish);

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const navigation = [
        { name: 'Dashboard', href: 'admin.dashboard', icon: HomeIcon, current: route().current('admin.dashboard'), enabled: true },
        { name: 'Entreprises', href: 'admin.companies', icon: BuildingIcon, current: route().current('admin.companies'), enabled: true },
        { name: 'Utilisateurs', href: 'admin.users', icon: UsersIcon, current: route().current('admin.users'), enabled: true },
        { name: 'Abonnements', href: 'admin.subscriptions', icon: CreditCardIcon, current: route().current('admin.subscriptions'), enabled: true },
        { name: 'Radar IA', href: 'admin.radar', icon: RadarIcon, current: route().current('admin.radar'), enabled: true },
        { name: 'Analytique', href: 'admin.analytics', icon: ChartIcon, current: route().current('admin.analytics'), enabled: true },
        { name: 'Paramètres', href: 'admin.settings', icon: SettingsIcon, current: route().current('admin.settings'), enabled: true },
    ];

    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            router.post(route('logout'));
        }
    };

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
                        <Link href={route('admin.dashboard')} className="relative flex items-center gap-3 px-6 py-5 hover:bg-gray-50 transition-colors group">
                            <img src="/images/logo_feedora.png" alt="Feedora" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-xl font-bold text-feedora-500 tracking-tight">Feedora</h1>
                                <p className="text-xs text-gray-500 font-medium">Console Admin</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            if (!item.enabled) {
                                return null;
                            }
                            
                            return (
                                <Link
                                    key={item.name}
                                    href={route(item.href)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                                        transition-all duration-200 group
                                        ${item.current 
                                            ? 'bg-feedora-500 text-white shadow-lg shadow-feedora-500/30' 
                                            : 'text-gray-700 hover:text-feedora-600 hover:bg-feedora-50'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User & Logout */}
                    <div className="relative border-t border-gray-100 p-4 space-y-3 bg-gray-50">
                        <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 group hover:border-feedora-200 transition-colors">
                            <div className="w-11 h-11 bg-gradient-to-br from-feedora-400 to-feedora-600 rounded-full flex items-center justify-center ring-2 ring-feedora-100">
                                <span className="text-white font-bold text-base">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'admin@example.com'}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all duration-200 group"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            Déconnexion
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
                            <h2 className="text-xl font-bold text-gray-900">{header}</h2>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-feedora-100 text-feedora-700 text-xs font-semibold rounded-full">
                                FEEDORA ADMIN
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="relative min-h-screen">
                    {/* Skeleton overlay pendant le chargement */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-50 z-20 transition-opacity duration-300">
                            <SkeletonLoader />
                        </div>
                    )}
                    
                    {/* Contenu réel avec transition */}
                    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
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

function RadarIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l6-2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function BuildingIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M9 8h6M9 12h6M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14" />
        </svg>
    );
}

function UsersIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function ChatIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 8l-4-4V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H7z" />
        </svg>
    );
}

function SendIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l14-7-7 14-2-5-5-2z" />
        </svg>
    );
}

function ReplyIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h9l-1-2 8 4-8 4 1-2H3v-4z" />
        </svg>
    );
}

function ChartIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 13v4m4-8v8m4-12v12" />
        </svg>
    );
}

function CreditCardIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 7h20M2 11h20M4 15h6M14 15h6M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
    );
}

function ChannelsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v6H4zM4 14h7v6H4zM13 14h7v6h-7z" />
        </svg>
    );
}

function SettingsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8a4 4 0 100 8 4 4 0 000-8zm-7.5 4a7.5 7.5 0 0115 0m-3-9l1.5 2.598M6 3l-1.5 2.598M3 12l-3 0m24 0l-3 0M6 21l-1.5-2.598M18 21l1.5-2.598" />
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

function MenuIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}
