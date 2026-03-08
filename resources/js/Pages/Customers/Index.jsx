import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { 
    Mail, Trash2, Users, Pencil, Plus, Search, 
    Phone, X, AtSign, Calendar
} from 'lucide-react';

export default function Index({ auth, customers }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate stats
    const stats = useMemo(() => {
        return {
            total: customers.length,
            withEmail: customers.filter(c => c.email).length,
            withPhone: customers.filter(c => c.phone).length,
        };
    }, [customers]);

    // Filter customers by search
    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        const term = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name?.toLowerCase().includes(term) ||
            c.email?.toLowerCase().includes(term) ||
            c.phone?.includes(term)
        );
    }, [customers, searchTerm]);

    const handleDelete = (customer) => {
        if (confirm(`Supprimer ${customer.name || customer.email} ?`)) {
            router.delete(route('customers.destroy', customer.id), { preserveScroll: true });
        }
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clients" />

            <div className="space-y-6">
                {/* Header with gradient */}
                <div className="relative overflow-hidden bg-gradient-to-br from-feedora-500 via-feedora-600 to-purple-600 rounded-2xl border border-feedora-400/20 shadow-lg p-8">
                    <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Gestion des clients</h1>
                            <p className="text-feedora-100">Créez, modifiez et gérez votre liste de clients</p>
                        </div>
                        <Link
                            href={route('customers.create')}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-feedora-600 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            Nouveau client
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-feedora-50 rounded-xl">
                                <Users className="w-6 h-6 text-feedora-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total clients</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Avec email</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.withEmail}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Avec téléphone</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.withPhone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par nom, email ou téléphone..."
                            className="w-full pl-10 pr-10 py-3 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-feedora-500 focus:bg-white transition-colors"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Customers List */}
                {filteredCustomers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
                        <div className="text-center max-w-md mx-auto">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {searchTerm ? 'Aucun résultat' : 'Aucun client'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm 
                                    ? 'Essayez avec un autre terme de recherche'
                                    : 'Commencez par ajouter votre premier client'
                                }
                            </p>
                            {!searchTerm && (
                                <Link
                                    href={route('customers.create')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-feedora-600 hover:bg-feedora-700 text-white rounded-xl text-sm font-semibold transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter un client
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCustomers.map((customer, index) => (
                                        <tr 
                                            key={customer.id} 
                                            className="hover:bg-gray-50 transition-colors group"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-feedora-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                        {getInitials(customer.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{customer.name || '—'}</p>
                                                        {customer.created_at && (
                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <Calendar className="w-3 h-3" />
                                                                Ajouté le {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <AtSign className="w-4 h-4 text-gray-400" />
                                                            <span>{customer.email}</span>
                                                        </div>
                                                    )}
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-4 h-4 text-gray-400" />
                                                            <span>{customer.phone}</span>
                                                        </div>
                                                    )}
                                                    {!customer.email && !customer.phone && (
                                                        <span className="text-sm text-gray-400">Aucun contact</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={route('customers.edit', customer.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-all hover:scale-105"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        Modifier
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(customer)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium transition-all hover:scale-105"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
