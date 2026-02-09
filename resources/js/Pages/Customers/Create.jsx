import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { UserPlus, Upload, FileText, Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        csv_file: null,
    });

    const [csvMode, setCsvMode] = useState(false);
    const [fileName, setFileName] = useState('');

    const submitManual = (e) => {
        e.preventDefault();
        post(route('customers.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    const submitCSV = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('csv_file', data.csv_file);
        
        post(route('customers.importCSV'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFileName('');
            },
            preserveScroll: true,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('csv_file', file);
            setFileName(file.name);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Ajouter un client">
            <Head title="Ajouter un client" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-feedora-100 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-feedora-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Ajouter un client</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Ajoutez manuellement ou importez via CSV</p>
                        </div>
                    </div>
                    <Link
                        href={route('customers.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Link>
                </div>

                {/* Mode Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 inline-flex gap-1.5">
                    <button
                        onClick={() => setCsvMode(false)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            !csvMode
                                ? 'bg-feedora-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Ajout Manuel
                        </span>
                    </button>
                    <button
                        onClick={() => setCsvMode(true)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            csvMode
                                ? 'bg-feedora-600 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Importer CSV
                        </span>
                    </button>
                </div>

                {/* Manual Mode */}
                {!csvMode && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <form onSubmit={submitManual} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <UserPlus className="w-4 h-4 text-feedora-600" />
                                        Nom du client
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Jean Dupont"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-feedora-500 focus:border-feedora-500 transition-all"
                                    />
                                    <InputError message={errors.name} className="mt-1 text-xs" />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 text-feedora-600" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="jean@example.com"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-feedora-500 focus:border-feedora-500 transition-all"
                                    />
                                    <InputError message={errors.email} className="mt-1 text-xs" />
                                </div>

                                {/* Phone */}
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 text-feedora-600" />
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+33 6 12 34 56 78"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-feedora-500 focus:border-feedora-500 transition-all"
                                    />
                                    <InputError message={errors.phone} className="mt-1 text-xs" />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-feedora-600 hover:bg-feedora-700 disabled:opacity-50 text-white rounded-xl transition-all font-semibold"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Ajouter le client
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={route('customers.index')}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-all font-semibold"
                                >
                                    Annuler
                                </Link>
                            </div>
                        </form>
                    </div>
                )}

                {/* CSV Mode */}
                {csvMode && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <form onSubmit={submitCSV} className="space-y-6">
                            {/* Upload Zone */}
                            <label className="block">
                                <div className="border-2 border-dashed border-feedora-300 rounded-2xl p-8 hover:border-feedora-500 hover:bg-feedora-50 transition-all cursor-pointer group">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-feedora-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-feedora-200 transition-colors">
                                            <Upload className="w-6 h-6 text-feedora-600" />
                                        </div>
                                        {fileName ? (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {fileName}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Cliquez pour changer le fichier
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Glissez-déposez votre fichier CSV
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ou cliquez pour parcourir
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {errors.csv_file && (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                                    <p className="text-sm text-rose-600 font-semibold">{errors.csv_file}</p>
                                </div>
                            )}

                            {/* CSV Format Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Format CSV attendu</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Votre fichier CSV doit contenir ces colonnes (dans cet ordre) :
                                        </p>
                                        <div className="bg-white/70 rounded-lg p-3 font-mono text-xs text-gray-700 space-y-1">
                                            <div><span className="text-feedora-600 font-bold">name</span>, email, phone</div>
                                            <div className="text-gray-400">Jean Dupont, jean@example.com, +33612345678</div>
                                            <div className="text-gray-400">Marie Martin, marie@example.com, +33687654321</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={processing || !fileName}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-feedora-600 hover:bg-feedora-700 disabled:opacity-50 text-white rounded-xl transition-all font-semibold"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Import en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Importer le fichier
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={route('customers.index')}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl transition-all font-semibold"
                                >
                                    Annuler
                                </Link>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
