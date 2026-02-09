import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Mail, MessageSquare, QrCode, Smartphone, Send, Trash2, Users, Eye, Pencil, Plus, Search, Filter } from 'lucide-react';

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
        }, { preserveScroll: true });
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

    return (
        <AuthenticatedLayout user={auth.user} header="Clients">
            <Head title="Clients" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Title Card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-feedora-600 to-indigo-700 rounded-2xl shadow-lg p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">Clients</h1>
                                </div>
                                <p className="text-indigo-100 text-sm">
                                    {filteredCustomers.length} client{filteredCustomers.length !== 1 ? 's' : ''} • Gérez vos contacts et envoyez des feedbacks
                                </p>
                            </div>
                            <div className="text-4xl opacity-10">👥</div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="text-center">
                            <p className="text-gray-500 text-sm font-medium mb-1">Base clients totale</p>
                            <p className="text-4xl font-bold text-feedora-600">{customers.length}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400 group-hover:text-feedora-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-feedora-500 focus:border-feedora-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedCustomers.length > 0 && (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-feedora-50 to-indigo-50 px-4 py-3 rounded-xl border-2 border-feedora-200">
                                <span className="text-sm font-semibold text-feedora-700">
                                    {selectedCustomers.length} sélectionné{selectedCustomers.length > 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={() => setBulkChannelMenuVisible(true)}
                                    className="px-4 py-2 bg-feedora-600 hover:bg-feedora-700 text-white rounded-lg transition-colors font-semibold text-sm"
                                >
                                    Envoyer
                                </button>
                            </div>
                        )}

                        {/* Add Button */}
                        <Link
                            href={route('customers.create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-feedora-600 hover:bg-feedora-700 text-white rounded-xl transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter un client
                        </Link>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {filteredCustomers.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Aucun client trouvé</p>
                            <Link href={route('customers.create')} className="text-feedora-600 hover:text-feedora-700 font-semibold text-sm mt-2">
                                Ajouter votre premier client
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-5 h-5 text-feedora-600 rounded-lg cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nom</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Téléphone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Dernier envoi</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCustomers.map(customer => {
                                        const last = customer.feedback_requests?.[0];
                                        return (
                                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCustomers.includes(customer.id)}
                                                        onChange={() => toggleCustomerSelection(customer.id)}
                                                        className="w-5 h-5 text-feedora-600 rounded-lg cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-feedora-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {(customer.name || customer.email)?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">{customer.name || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {last ? new Date(last.created_at).toLocaleDateString('fr-FR') : 'Jamais'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openChannelMenu(customer)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-feedora-600 hover:bg-feedora-700 text-white rounded-lg transition-all text-sm font-semibold"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            Envoyer
                                                        </button>
                                                        <Link
                                                            href={route('customers.edit', customer.id)}
                                                            className="inline-flex items-center px-2.5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteCustomer(customer.id, customer.name || customer.email)}
                                                            className="inline-flex items-center px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
                    )}
                </div>

                {/* Channel Menu Modals */}
                {channelMenuVisible && selectedCustomer && (
                    <ChannelModal
                        customer={selectedCustomer}
                        onSelect={sendFeedback}
                        onClose={() => setChannelMenuVisible(false)}
                    />
                )}

                {bulkChannelMenuVisible && (
                    <ChannelModal
                        bulk
                        onSelect={sendBulkFeedback}
                        onClose={() => setBulkChannelMenuVisible(false)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function ChannelModal({ customer, bulk, onSelect, onClose }) {
    const channels = [
        { id: 'email', name: 'Email', icon: Mail, color: 'bg-blue-500' },
        { id: 'sms', name: 'SMS', icon: Smartphone, color: 'bg-green-500' },
        { id: 'qr', name: 'QR Code', icon: QrCode, color: 'bg-purple-500' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {bulk ? 'Choisir le canal' : `Envoyer à ${customer.name || customer.email}`}
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 gap-3">
                    {channels.map(channel => {
                        const Icon = channel.icon;
                        return (
                            <button
                                key={channel.id}
                                onClick={() => {
                                    onSelect(channel.id);
                                    onClose();
                                }}
                                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-feedora-500 hover:bg-feedora-50 transition-all group"
                            >
                                <div className={`w-10 h-10 ${channel.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-gray-900">{channel.name}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}
