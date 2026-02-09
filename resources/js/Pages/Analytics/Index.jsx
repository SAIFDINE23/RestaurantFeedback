import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Analytics({ auth, stats, trend, channels, responseBuckets, ratingDistribution, channelPerformance, responseTimeByChannel, weekdayDistribution, hourDistribution }) {
    const totalRequests = stats?.requests_total ?? 0;
    const completedTotal = stats?.completed_total ?? 0;
    const completionRate = totalRequests > 0 ? Math.round((completedTotal / totalRequests) * 100) : 0;
    const responseDelta = (stats?.response_rate_last_30 ?? 0) - (stats?.response_rate_prev_30 ?? 0);
    const requestsDelta = (stats?.requests_last_30 ?? 0) - (stats?.requests_prev_30 ?? 0);

    const buckets = Object.entries(responseBuckets || {});

    return (
        <AuthenticatedLayout user={auth?.user} header="Analytics">
            <Head title="Analytics" />

            <div className="space-y-8">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-8 text-white shadow-2xl">
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative flex flex-col gap-4">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                            Insights avancés
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Analytics Business</h1>
                        <p className="max-w-2xl text-indigo-100/90">
                            Analysez la performance commerciale, la qualité de service et l’efficacité opérationnelle de vos campagnes.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('feedbacks.index')}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-lg hover:shadow-xl"
                            >
                                Voir les feedbacks
                            </Link>
                            <Link
                                href={route('radar')}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl"
                            >
                                Radar IA
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title="Taux de réponse" value={`${stats?.response_rate ?? 0}%`} helper="global" tone="emerald" delta={responseDelta} />
                    <KpiCard title="Demandes (30j)" value={stats?.requests_last_30 ?? 0} helper="vs 30j" tone="indigo" delta={requestsDelta} />
                    <KpiCard title="Temps moyen" value={stats?.avg_response_hours ? `${stats.avg_response_hours}h` : '—'} helper="réponse" tone="blue" />
                    <KpiCard title="Note moyenne" value={stats?.avg_rating ?? '—'} helper="qualité" tone="amber" />
                </div>

                {/* Operational Summary */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Conversion opérationnelle</h2>
                                <p className="text-sm text-gray-500">Demandes → Réponses</p>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                                {completionRate}% complété
                            </span>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <ProgressStat label="Demandes" value={totalRequests} total={totalRequests} tone="indigo" />
                            <ProgressStat label="Réponses" value={completedTotal} total={totalRequests} tone="emerald" />
                            <ProgressStat label="Échecs" value={stats?.failed_total ?? 0} total={totalRequests} tone="rose" />
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <MiniStat label="Positifs" value={stats?.positive_count ?? 0} sub={`${stats?.positive_rate ?? 0}%`} />
                            <MiniStat label="Neutres" value={stats?.neutral_count ?? 0} sub="3★" />
                            <MiniStat label="Négatifs" value={stats?.negative_count ?? 0} sub="1-2★" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Performance par canal</h4>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                {['email', 'sms', 'qr'].map((channel) => (
                                    <ChannelPerformanceCard
                                        key={channel}
                                        label={channel.toUpperCase()}
                                        data={channelPerformance?.[channel]}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900">Réponses par délai</h3>
                        <p className="text-sm text-gray-500">Temps moyen de traitement</p>
                        <div className="mt-6 space-y-4">
                            {buckets.map(([label, value]) => (
                                <BucketBar key={label} label={label} value={value} total={stats?.completed_total ?? 0} />
                            ))}
                        </div>
                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Temps moyen / canal</h4>
                            <div className="mt-3 space-y-2">
                                {['email', 'sms', 'qr'].map((channel) => (
                                    <ResponseTimeRow
                                        key={channel}
                                        label={channel.toUpperCase()}
                                        value={responseTimeByChannel?.[channel]}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trends */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-900">Tendance des demandes</h3>
                        <p className="text-sm text-gray-500">30 derniers jours</p>
                        <div className="mt-6">
                            <TrendBars data={trend} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900">Canaux</h3>
                        <p className="text-sm text-gray-500">Répartition par canal</p>
                        <div className="mt-6 space-y-4">
                            <ChannelRow label="Email" value={channels?.email ?? 0} total={totalRequests} color="from-blue-500 to-indigo-500" />
                            <ChannelRow label="SMS" value={channels?.sms ?? 0} total={totalRequests} color="from-emerald-500 to-teal-500" />
                            <ChannelRow label="QR" value={channels?.qr ?? 0} total={totalRequests} color="from-purple-500 to-fuchsia-500" />
                        </div>
                    </div>
                </div>

                {/* Rating + Activity Heatmaps */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg lg:col-span-2">
                        <h3 className="text-xl font-bold text-gray-900">Répartition des notes</h3>
                        <p className="text-sm text-gray-500">Qualité perçue par les clients</p>
                        <div className="mt-6">
                            <RatingBars data={ratingDistribution} />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900">Heatmap activité</h3>
                        <p className="text-sm text-gray-500">Jours x heures</p>
                        <div className="mt-6">
                            <HeatmapGrid weekday={weekdayDistribution} hours={hourDistribution} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function KpiCard({ title, value, helper, tone, delta }) {
    const tones = {
        emerald: 'from-emerald-500 to-teal-500',
        blue: 'from-blue-500 to-indigo-500',
        purple: 'from-purple-500 to-fuchsia-500',
        amber: 'from-amber-500 to-orange-500',
        indigo: 'from-indigo-500 to-violet-500',
    };

    const deltaLabel = typeof delta === 'number'
        ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`
        : null;
    const deltaTone = delta > 0 ? 'text-emerald-700 bg-emerald-50' : delta < 0 ? 'text-rose-700 bg-rose-50' : 'text-gray-600 bg-gray-50';

    return (
        <div className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-black text-gray-900">{value}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs text-gray-500">{helper}</p>
                        {deltaLabel && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${deltaTone}`}>
                                {deltaLabel}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tones[tone]} shadow-lg`} />
            </div>
        </div>
    );
}

function ProgressStat({ label, value, total, tone }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const tones = {
        indigo: 'from-indigo-500 to-violet-500',
        emerald: 'from-emerald-500 to-teal-500',
        rose: 'from-rose-500 to-pink-500',
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <span className="text-xs font-semibold text-gray-400">{percentage}%</span>
            </div>
            <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${tones[tone]} transition-all`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function MiniStat({ label, value, sub }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
        </div>
    );
}

function BucketBar({ label, value, total }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">{label}</span>
                <span className="text-gray-500">{value}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function ChannelPerformanceCard({ label, data }) {
    const rate = data?.rate ?? 0;
    const total = data?.total ?? 0;

    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
                <span className="text-xs font-semibold text-gray-500">{rate}%</span>
            </div>
            <p className="mt-2 text-2xl font-black text-gray-900">{total}</p>
            <div className="mt-3 h-2 rounded-full bg-white overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${rate}%` }} />
            </div>
        </div>
    );
}

function ResponseTimeRow({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">{label}</span>
            <span className="text-gray-500">{value ? `${value}h` : '—'}</span>
        </div>
    );
}

function TrendBars({ data }) {
    if (!data?.length) return <p className="text-sm text-gray-500">Aucune donnée disponible.</p>;

    const max = Math.max(...data.map((d) => d.requests), 1);

    return (
        <div className="flex items-end gap-2 h-44">
            {data.map((point) => {
                const height = Math.round((point.requests / max) * 100);
                return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-50 rounded-t-xl h-32 flex items-end">
                            <div
                                className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg"
                                style={{ height: `${height}%` }}
                                title={`${point.requests} demandes`}
                            />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-400">{point.date.slice(5)}</span>
                    </div>
                );
            })}
        </div>
    );
}

function ChannelRow({ label, value, total, color }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">{label}</span>
                <span className="text-gray-500">{percentage}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function RatingBars({ data }) {
    if (!data) return <p className="text-sm text-gray-500">Aucune donnée.</p>;

    const total = Object.values(data).reduce((sum, v) => sum + v, 0) || 1;
    const entries = [5, 4, 3, 2, 1].map((star) => [star, data[star] ?? 0]);

    return (
        <div className="space-y-4">
            {entries.map(([star, value]) => {
                const percentage = Math.round((value / total) * 100);
                return (
                    <div key={star} className="flex items-center gap-4">
                        <div className="w-16 text-sm font-semibold text-gray-700">{star}★</div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="w-12 text-right text-sm font-semibold text-gray-600">{value}</div>
                    </div>
                );
            })}
        </div>
    );
}

function HeatmapGrid({ weekday = [], hours = [] }) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const maxDay = Math.max(...weekday, 1);
    const maxHour = Math.max(...hours, 1);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
                {weekday.map((value, idx) => (
                    <div key={`day-${idx}`} className="text-center">
                        <div
                            className="h-8 rounded-lg"
                            style={{
                                background: `rgba(79, 70, 229, ${0.15 + (value / maxDay) * 0.85})`,
                            }}
                            title={`${value} demandes`}
                        />
                        <span className="text-[10px] text-gray-500">{days[idx]}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-12 gap-2">
                {hours.map((value, idx) => (
                    <div key={`hour-${idx}`} className="text-center">
                        <div
                            className="h-6 rounded-md"
                            style={{
                                background: `rgba(16, 185, 129, ${0.12 + (value / maxHour) * 0.88})`,
                            }}
                            title={`${value} demandes à ${idx}h`}
                        />
                        {idx % 4 === 0 && (
                            <span className="text-[10px] text-gray-400">{idx}h</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
