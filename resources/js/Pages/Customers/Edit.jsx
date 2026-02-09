import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User, Mail, Phone } from 'lucide-react';

export default function Edit({ auth, customer }) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Modifier un client">
            <Head title="Modifier un client" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Modifier le client</h1>
                        <p className="text-sm text-gray-500">Mettez à jour les informations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('customers.show', customer.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                            errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                        placeholder="Nom du client"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                            errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                        placeholder="nom@restaurant.com"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="max-w-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${
                                        errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-feedora-500'
                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                                    placeholder="+33 6 00 00 00 00"
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Link
                                href={route('customers.show', customer.id)}
                                className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-feedora-500 rounded-xl hover:bg-feedora-600 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
