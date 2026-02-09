import { usePage, Link } from '@inertiajs/react';
import { LockClosedIcon } from '@heroicons/react/24/solid';

export default function FeatureLock({ feature, children, className = '' }) {
    const { subscription } = usePage().props;
    const hasFeature = Boolean(subscription?.features?.[feature]);

    if (hasFeature) {
        return children;
    }

    return (
        <div className={`relative ${className}`}>
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg">
                <Link
                    href={route('subscription.index')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <LockClosedIcon className="w-5 h-5" />
                    Upgrade Required
                </Link>
            </div>
        </div>
    );
}

export function useHasFeature(feature) {
    const { subscription } = usePage().props;
    return Boolean(subscription?.features?.[feature]);
}

export function useHasCredits(minCredits = 1) {
    const { subscription } = usePage().props;
    return (subscription?.credits?.credits_total_available || 0) >= minCredits;
}
