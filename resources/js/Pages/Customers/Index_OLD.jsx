import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Mail, MessageSquare, QrCode, Smartphone, Send, Trash2, Users, CheckSquare, Eye, Pencil } from 'lucide-react';

export default function Index({ auth, customers }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [channelMenuVisible, setChannelMenuVisible] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [bulkChannelMenuVisible, setBulkChannelMenuVisible] = useState(false);

    const openChannelMenu = (customer) => {
        setSelectedCustomer(customer);
        setChannelMenuVisible(true);
    };

    const sendFeedback = (channel) => {
        router.post(route('feedback-requests.store'), {
            customer_id: selectedCustomer.id,
            channel,
        }, {
            preserveScroll: true,
        });

        setChannelMenuVisible(false);
        setSelectedCustomer(null);
    };

    const sendBulkFeedback = (channel) => {
        router.post(route('feedback-requests.bulk'), {
            customer_ids: selectedCustomers,
            channel,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedCustomers([]);
                setBulkChannelMenuVisible(false);
            },
        });
    };

    const toggleCustomerSelection = (customerId) => {
        setSelectedCustomers(prev => 
            prev.includes(customerId) 
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedCustomers.length === filteredCustomers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(filteredCustomers.map(c => c.id));
        }
    };

    const deleteCustomer = (id, name) => {
        if (!confirm(`Supprimer ${name} ?`)) return;
        router.delete(route('customers.destroy', id), { preserveScroll: true });
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusBadge = (status) => {
        const styles = {
            sent: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
            delivered: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
            failed: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
        };
        return (
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {status || 'Aucun'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Clients">
            <Head title="Clients" />

            <div className="space-y-6">
                {/* Header Premium */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1">Clients</h1>
                                    <p className="text-teal-100 text-lg">Gérez votre base de clients et envoyez des feedbacks</p>
                                </div>
                            </div>
                            <Link
                                href={route('customers.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <span className="text-xl">＋</span>
                                Ajouter un client
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search & Bulk Actions */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher un client..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                                />
                            </div>
                        </div>
                        
                        {selectedCustomers.length > 0 && (
                            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 rounded-xl border-2 border-emerald-200">
                                <span className="text-sm font-black text-emerald-700">
                                    {selectedCustomers.length} client{selectedCustomers.length > 1 ? 's' : ''} sélectionné{selectedCustomers.length > 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={() => setBulkChannelMenuVisible(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm hover:scale-105"
                                >
                                    <Send className="w-4 h-4" />
                                    Envoyer feedbacks
                                </button>
                                <button
                                    onClick={() => setSelectedCustomers([])}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-bold text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Premium */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 border-2 border-gray-300"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Dernier envoi</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCustomers.map(customer => {
                                    const last = customer.feedback_requests?.[0];
                                    return (
                                        <tr key={customer.id} className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all group">
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(customer.id)}
                                                    onChange={() => toggleCustomerSelection(customer.id)}
                                                    className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-emerald-500 border-2 border-gray-300"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                                                        <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                                            {customer.name?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {customer.name || 'Sans nom'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-600">
                                                {customer.email || customer.phone}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-gray-700">
                                                {last ? new Date(last.created_at).toLocaleDateString('fr-FR') : 'Jamais'}
                                            </td>
                                            <td className="px-6 py-5">
                                                {statusBadge(last?.status)}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('customers.show', customer.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all text-sm font-semibold"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Voir</span>
                                                    </Link>
                                                    <Link
                                                        href={route('customers.edit', customer.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all text-sm font-semibold"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Modifier</span>
                                                    </Link>
                                                    <Link
                                                        href={route('customers.qr', customer.id)}
                                                        className="inline-flex items-center gap-2 px-3 py-2 text-feedora-700 hover:bg-feedora-50 rounded-xl transition-all text-sm font-semibold"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                        <span className="hidden sm:inline">QR</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => openChannelMenu(customer)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm hover:scale-105"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        Envoyer
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCustomer(customer.id, customer.name || customer.email)}
                                                        className="inline-flex items-center px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal choix canal - envoi individuel */}
            {channelMenuVisible && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-gray-200">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            Envoyer un feedback
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 font-medium">
                            Choisissez le canal pour <span className="font-black text-emerald-600">{selectedCustomer.name || selectedCustomer.email}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <ChannelButton icon={<Mail />} label="Email" onClick={() => sendFeedback('email')} />
                            <ChannelButton icon={<MessageSquare />} label="SMS" onClick={() => sendFeedback('sms')} />
                            <ChannelButton icon={<QrCode />} label="QR Code" onClick={() => sendFeedback('qr')} />
                            <ChannelButton icon={<Smartphone />} label="WhatsApp" onClick={() => sendFeedback('whatsapp')} />
                        </div>

                        <button
                            onClick={() => setChannelMenuVisible(false)}
                            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Modal choix canal - envoi en masse */}
            {bulkChannelMenuVisible && selectedCustomers.length > 0 && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-gray-200">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            Envoyer des feedbacks en masse
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 font-medium">
                            Choisissez le canal pour envoyer à <span className="font-black text-emerald-600">{selectedCustomers.length} client{selectedCustomers.length > 1 ? 's' : ''}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <ChannelButton icon={<Mail />} label="Email" onClick={() => sendBulkFeedback('email')} />
                            <ChannelButton icon={<MessageSquare />} label="SMS" onClick={() => sendBulkFeedback('sms')} />
                        </div>

                        <button
                            onClick={() => setBulkChannelMenuVisible(false)}
                            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function ChannelButton({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 transition-all group hover:scale-105"
        >
            <div className="text-emerald-600 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-bold text-gray-900">{label}</span>
        </button>
    );
}
