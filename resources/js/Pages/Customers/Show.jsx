import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Mail, Phone, User, Calendar, Hash, Activity, QrCode } from 'lucide-react';

export default function Show({ auth, customer }) {
    const feedbacks = customer.feedback_requests || customer.feedbackRequests || [];
    const lastFeedback = feedbacks[0];

    return (
        <AuthenticatedLayout user={auth.user} header="Détails du client">
            <Head title={`Détails du client - ${customer.name || customer.email}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.name || 'Sans nom'}</h1>
                        <p className="text-sm text-gray-500">Client #{customer.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('customers.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </Link>
                        <Link
                            href={route('customers.qr', customer.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-feedora-700 bg-feedora-50 rounded-xl hover:bg-feedora-100"
                        >
                            <QrCode className="w-4 h-4" />
                            QR Code
                        </Link>
                        <Link
                            href={route('customers.edit', customer.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-white bg-feedora-500 rounded-xl hover:bg-feedora-600"
                        >
                            <Pencil className="w-4 h-4" />
                            Modifier
                        </Link>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Nom</p>
                                <p className="text-sm font-semibold text-gray-900">{customer.name || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                <Hash className="w-5 h-5 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Identifiant</p>
                                <p className="text-sm font-semibold text-gray-900">#{customer.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                <Phone className="w-5 h-5 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Téléphone</p>
                                <p className="text-sm font-semibold text-gray-900">{customer.phone || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Créé le</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString('fr-FR') : '—'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-feedora-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Dernier envoi</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {lastFeedback?.created_at ? new Date(lastFeedback.created_at).toLocaleDateString('fr-FR') : 'Jamais'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Requests */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Dernières demandes de feedback</h2>
                        <span className="text-xs text-gray-500">{feedbacks.length} au total</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {feedbacks.length === 0 ? (
                            <div className="px-6 py-6 text-sm text-gray-500">Aucune demande pour ce client.</div>
                        ) : (
                            feedbacks.map((item) => (
                                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                            <p className="text-xs text-gray-500">Canal: {item.channel || '—'}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        {item.status || 'Aucun'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
