import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Users, QrCode, Upload, Plus, Search, Mail, Phone, Trash2, Send } from 'lucide-react';

export default function Index({ auth, contacts, stats, filters, qrCodeUrl }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [sourceFilter, setSourceFilter] = useState(filters.source);
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const handleFilterChange = (source) => {
        setSourceFilter(source);
        router.get(route('contacts.index'), { source, search: searchQuery }, { preserveState: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('contacts.index'), { source: sourceFilter, search: searchQuery }, { preserveState: true });
    };

    const handleDelete = (contactId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
            router.delete(route('contacts.destroy', contactId), {
                preserveScroll: true,
            });
        }
    };

    const handleSendFeedbackRequest = () => {
        if (selectedContacts.length === 0) {
            alert('Veuillez sélectionner au moins un contact');
            return;
        }

        if (confirm(`Envoyer une demande de feedback à ${selectedContacts.length} contact(s) ?`)) {
            router.post(route('contacts.send-feedback-request'), {
                contact_ids: selectedContacts,
            }, {
                preserveScroll: true,
                onSuccess: () => setSelectedContacts([]),
            });
        }
    };

    const toggleContactSelection = (contactId) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedContacts.length === contacts.data.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.data.map(c => c.id));
        }
    };

    const getSourceBadge = (source) => {
        const badges = {
            qr_code: { label: 'QR Code', color: 'bg-blue-100 text-blue-700' },
            manual: { label: 'Manuel', color: 'bg-green-100 text-green-700' },
            import: { label: 'Import', color: 'bg-purple-100 text-purple-700' },
        };
        const badge = badges[source] || badges.manual;
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Contacts Clients" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Contacts Clients</h1>
                        <p className="text-gray-600 mt-1">Gérez votre base de contacts et envoyez des demandes de feedback</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Contacts</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Via QR Code</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.qr_code}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Ajoutés Manuel</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.manual}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Cette Semaine</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.recent}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter Contact
                                </button>
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Importer CSV
                                </button>
                                <button
                                    onClick={() => setShowQrModal(true)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <QrCode className="w-4 h-4" />
                                    QR Code
                                </button>
                            </div>

                            {selectedContacts.length > 0 && (
                                <button
                                    onClick={handleSendFeedbackRequest}
                                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Envoyer Feedback ({selectedContacts.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Source Filter */}
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'qr_code', 'manual', 'import'].map((source) => (
                                    <button
                                        key={source}
                                        onClick={() => handleFilterChange(source)}
                                        className={`px-4 py-2 rounded-lg transition ${
                                            sourceFilter === source
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {source === 'all' && 'Tous'}
                                        {source === 'qr_code' && 'QR Code'}
                                        {source === 'manual' && 'Manuel'}
                                        {source === 'import' && 'Import'}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher par nom, email ou téléphone..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Contacts List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {contacts.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Aucun contact trouvé</p>
                                <p className="text-gray-400 text-sm mt-2">Ajoutez des contacts manuellement ou partagez votre QR Code</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.length === contacts.data.length}
                                                        onChange={toggleSelectAll}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Téléphone</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ajouté le</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {contacts.data.map((contact) => (
                                                <tr key={contact.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedContacts.includes(contact.id)}
                                                            onChange={() => toggleContactSelection(contact.id)}
                                                            className="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{contact.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm">{contact.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {contact.phone ? (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Phone className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm">{contact.phone}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getSourceBadge(contact.source)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(contact.id)}
                                                            className="text-red-600 hover:text-red-800 transition p-2"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {contacts.links.length > 3 && (
                                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Affichage de {contacts.from} à {contacts.to} sur {contacts.total} contacts
                                        </div>
                                        <div className="flex gap-2">
                                            {contacts.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    disabled={!link.url}
                                                    className={`px-3 py-1 rounded ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Contact Modal */}
            {showAddModal && <AddContactModal onClose={() => setShowAddModal(false)} />}

            {/* Import CSV Modal */}
            {showImportModal && <ImportCSVModal onClose={() => setShowImportModal(false)} />}

            {/* QR Code Modal */}
            {showQrModal && <QRCodeModal qrCodeUrl={qrCodeUrl} onClose={() => setShowQrModal(false)} />}
        </AuthenticatedLayout>
    );
}

// Add Contact Modal Component
function AddContactModal({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contacts.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ajouter un Contact</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Ajout...' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Import CSV Modal Component
function ImportCSVModal({ onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        file: null,
    });

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contacts.import'), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Importer des Contacts (CSV)</h2>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">Format CSV attendu :</p>
                    <code className="text-xs text-blue-700 block">
                        name,email,phone<br />
                        Jean Dupont,jean@email.com,0612345678<br />
                        Marie Martin,marie@email.com,0698765432
                    </code>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fichier CSV *</label>
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.file}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Import...' : 'Importer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// QR Code Modal Component
function QRCodeModal({ qrCodeUrl, onClose }) {
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeUrl)}`;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrCodeImageUrl;
        link.download = 'qr-code-contact-form.png';
        link.click();
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(qrCodeUrl);
        alert('URL copiée dans le presse-papier !');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre QR Code de Collecte</h2>
                
                <div className="text-center mb-6">
                    <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                        <img src={qrCodeImageUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                        Scannez ce code pour accéder au formulaire de contact
                    </p>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">URL du formulaire :</p>
                    <p className="text-sm text-gray-800 font-mono break-all">{qrCodeUrl}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleCopyUrl}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        Copier URL
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Télécharger QR
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
}
