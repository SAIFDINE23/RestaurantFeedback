import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const PLAN_COLORS = {
    free: 'border-gray-200 bg-gray-50',
    basic: 'border-blue-200 bg-blue-50',
    pro: 'border-purple-200 bg-purple-50',
    enterprise: 'border-amber-200 bg-amber-50',
};

const PLAN_BADGE = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    pro: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700',
};

export default function AdminSettings({ platformInfo, emailConfig, smsConfig, stripeConfig, aiConfig, googleConfig, plans, stats }) {
    const fmt = (n) => (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return (
        <AdminLayout header="Paramètres">
            <Head title="Admin - Paramètres" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ═══ Header Stats ═══ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MiniStat label="Utilisateurs" value={fmt(stats?.total_users)} icon={<UsersIcon />} />
                        <MiniStat label="Entreprises" value={fmt(stats?.total_companies)} icon={<BuildingIcon />} />
                        <MiniStat label="Abonnements actifs" value={fmt(stats?.total_subscriptions)} icon={<CreditCardIcon />} />
                        <MiniStat label="Feedbacks collectés" value={fmt(stats?.total_feedbacks)} icon={<ChatIcon />} />
                    </div>

                    {/* ═══ Plateforme + Environnement ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SettingsCard title="Plateforme" subtitle="Informations système et environnement" icon={<ServerIcon />}>
                            <SettingsRow label="Nom de l'app" value={platformInfo?.app_name} />
                            <SettingsRow label="Environnement" value={
                                <EnvBadge env={platformInfo?.app_env} />
                            } />
                            <SettingsRow label="URL" value={platformInfo?.app_url} mono />
                            <SettingsRow label="PHP" value={platformInfo?.php_version} mono />
                            <SettingsRow label="Laravel" value={platformInfo?.laravel_version} mono />
                            <SettingsRow label="Timezone" value={platformInfo?.timezone} />
                        </SettingsCard>

                        <SettingsCard title="Administrateurs" subtitle="Comptes avec accès admin global" icon={<ShieldIcon />}>
                            <div className="space-y-3">
                                {(stats?.admin_emails || []).map((email, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-feedora-400 to-feedora-600 flex items-center justify-center text-white font-bold text-sm">
                                            {email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
                                            <p className="text-xs text-gray-500">Super Admin</p>
                                        </div>
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">Actif</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                Géré via <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">AdminHelper::ADMIN_EMAILS</code>
                            </p>
                        </SettingsCard>
                    </div>

                    {/* ═══ Intégrations ═══ */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Intégrations & Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <IntegrationCard
                                name="Email (Brevo)"
                                configured={emailConfig?.brevo_configured}
                                details={[
                                    { label: 'Driver', value: emailConfig?.driver },
                                    { label: 'From', value: emailConfig?.from_address },
                                    { label: 'Nom', value: emailConfig?.from_name },
                                ]}
                                icon={<MailIcon />}
                                color="blue"
                            />
                            <IntegrationCard
                                name="SMS (Brevo)"
                                configured={smsConfig?.brevo_sms_configured}
                                details={[
                                    { label: 'Sender', value: smsConfig?.sms_sender },
                                ]}
                                icon={<PhoneIcon />}
                                color="green"
                            />
                            <IntegrationCard
                                name="Stripe"
                                configured={stripeConfig?.configured}
                                details={[
                                    { label: 'Mode', value: stripeConfig?.mode === 'live' ? '🟢 Live' : '🟡 Test' },
                                    { label: 'Webhook', value: stripeConfig?.webhook_configured ? 'Configuré' : 'Non configuré' },
                                ]}
                                icon={<StripeIcon />}
                                color="purple"
                            />
                            <IntegrationCard
                                name="IA (Gemini)"
                                configured={aiConfig?.configured}
                                details={[
                                    { label: 'Provider', value: aiConfig?.provider },
                                ]}
                                icon={<SparklesIcon />}
                                color="amber"
                            />
                        </div>

                        {/* Google OAuth */}
                        <div className="mt-4">
                            <IntegrationCard
                                name="Google OAuth"
                                configured={googleConfig?.configured}
                                details={[
                                    { label: 'Client ID', value: googleConfig?.configured ? 'Configuré' : 'Non configuré' },
                                ]}
                                icon={<GoogleIcon />}
                                color="red"
                                wide
                            />
                        </div>
                    </div>

                    {/* ═══ Plans ═══ */}
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Plans & Tarification</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {(plans || []).map((plan) => {
                                const cardStyle = PLAN_COLORS[plan.slug] || 'border-gray-200 bg-white';
                                const badge = PLAN_BADGE[plan.slug] || 'bg-gray-100 text-gray-700';
                                return (
                                    <div key={plan.id} className={`rounded-2xl border-2 p-5 ${cardStyle} transition-shadow hover:shadow-md`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${badge}`}>{plan.name}</span>
                                            <span className="text-xs text-gray-500">{plan.billing_period === 'year' ? 'Annuel' : 'Mensuel'}</span>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-3xl font-bold text-gray-900">{plan.price > 0 ? `${plan.price}€` : 'Gratuit'}</span>
                                            {plan.price > 0 && <span className="text-sm text-gray-500">/{plan.billing_period === 'year' ? 'an' : 'mois'}</span>}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <PlanDetail label="Crédits/mois" value={plan.credits_monthly > 0 ? fmt(plan.credits_monthly) : '—'} />
                                            <PlanDetail label="SMS/mois" value={plan.sms_quota_monthly > 0 ? fmt(plan.sms_quota_monthly) : '—'} />
                                            <PlanDetail label="Feedbacks max" value={plan.max_feedbacks > 0 ? fmt(plan.max_feedbacks) : '∞'} />
                                            <PlanDetail label="Features" value={Array.isArray(plan.features) ? plan.features.length : 0} />
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Abonnés actifs</span>
                                                <span className="text-lg font-bold text-gray-900">{plan.subscribers_count}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ═══ Features par plan ═══ */}
                    {(plans || []).some(p => Array.isArray(p.features) && p.features.length > 0) && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-base font-semibold text-gray-900">Matrice des features</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Comparaison détaillée des fonctionnalités par plan</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Feature</th>
                                            {(plans || []).map(p => (
                                                <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{p.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {getAllFeatures(plans).map((feature, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-2.5 text-sm text-gray-700 font-medium">{formatFeatureName(feature)}</td>
                                                {(plans || []).map(p => (
                                                    <td key={p.id} className="px-4 py-2.5 text-center">
                                                        {Array.isArray(p.features) && p.features.includes(feature)
                                                            ? <span className="text-emerald-500">✓</span>
                                                            : <span className="text-gray-300">—</span>
                                                        }
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}

/* ═══ Helper functions ═══ */

function getAllFeatures(plans) {
    const all = new Set();
    (plans || []).forEach(p => {
        if (Array.isArray(p.features)) p.features.forEach(f => all.add(f));
    });
    return [...all].sort();
}

function formatFeatureName(slug) {
    return slug
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

/* ═══ Sub-components ═══ */

function MiniStat({ label, value, icon }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

function SettingsCard({ title, subtitle, icon, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-feedora-100 text-feedora-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function SettingsRow({ label, value, mono }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-b-0">
            <span className="text-sm text-gray-600">{label}</span>
            <span className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono text-xs bg-gray-100 px-2 py-0.5 rounded' : ''}`}>
                {value || '—'}
            </span>
        </div>
    );
}

function EnvBadge({ env }) {
    const colors = {
        production: 'bg-emerald-100 text-emerald-700',
        staging: 'bg-amber-100 text-amber-700',
        local: 'bg-blue-100 text-blue-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${colors[env] || 'bg-gray-100 text-gray-700'}`}>
            {env || 'unknown'}
        </span>
    );
}

function IntegrationCard({ name, configured, details, icon, color, wide }) {
    const colorMap = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600' },
        green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600' },
        purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600' },
        red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={`rounded-2xl border ${c.border} ${c.bg} p-4 ${wide ? 'max-w-md' : ''}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${configured ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {configured ? '✓ Actif' : '✕ Inactif'}
                </span>
            </div>
            <div className="space-y-1.5">
                {(details || []).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{d.label}</span>
                        <span className="font-medium text-gray-700">{d.value || '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlanDetail({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </div>
    );
}

/* ═══ Icons ═══ */

function UsersIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function BuildingIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>;
}
function CreditCardIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
}
function ChatIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>;
}
function ServerIcon() {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
}
function ShieldIcon() {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function MailIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
function PhoneIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
}
function StripeIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
}
function SparklesIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
}
function GoogleIcon() {
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" /></svg>;
}
