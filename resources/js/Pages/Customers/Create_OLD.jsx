import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { UserPlus, Upload, FileText, Mail, Phone, CheckCircle2, ArrowLeft, Loader2, Info } from 'lucide-react';

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
            onSuccess: () => {
                reset();
            },
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

            <div className="space-y-8">
                {/* Premium Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-2xl">
                    {/* Blur Blobs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
                    
                    <div className="relative px-8 py-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                                    <UserPlus className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
                                        Ajouter un Client
                                    </h1>
                                    <p className="text-emerald-100 text-base font-medium">
                                        📝 Ajoutez manuellement ou importez via CSV
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('customers.index')}
                                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Retour
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mode Switch */}
                <div className="flex justify-center">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-2 inline-flex gap-2">
                        <button
                            onClick={() => setCsvMode(false)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                                !csvMode
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <UserPlus className="w-6 h-6" />
                            Ajout Manuel
                        </button>
                        <button
                            onClick={() => setCsvMode(true)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 ${
                                csvMode
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Upload className="w-6 h-6" />
                            Import CSV
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-100 overflow-hidden">
                    {!csvMode ? (
                        <>
                            {/* Manual Form Header */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b-2 border-emerald-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <UserPlus className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Nouveau Client</h3>
                                        <p className="text-emerald-700 text-base font-medium">Remplissez les informations du client</p>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Form Body */}
                            <form onSubmit={submitManual} className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-base font-bold text-gray-700 mb-3">
                                            Nom du client
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <UserPlus className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-base"
                                                placeholder="Ex: Jean Dupont"
                                            />
                                        </div>
                                        {errors.name && <InputError message={errors.name} className="mt-2" />}
                                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                            <Info className="w-4 h-4" />
                                            Le nom est optionnel
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-base font-bold text-gray-700 mb-3">
                                            Adresse email <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-base"
                                                placeholder="client@example.com"
                                            />
                                        </div>
                                        {errors.email && <InputError message={errors.email} className="mt-2" />}
                                    </div>

                                    <div>
                                        <label className="block text-base font-bold text-gray-700 mb-3">
                                            Numéro de téléphone
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-base"
                                                placeholder="+33 6 XX XX XX XX"
                                            />
                                        </div>
                                        {errors.phone && <InputError message={errors.phone} className="mt-2" />}
                                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                            <Info className="w-4 h-4" />
                                            Requis pour les envois par SMS ou WhatsApp
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                                    <Link
                                        href={route('customers.index')}
                                        className="text-base text-gray-600 hover:text-gray-900 font-bold transition-colors"
                                    >
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Ajout en cours...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Ajouter le client
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* CSV Import Header */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b-2 border-emerald-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <FileText className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Import CSV</h3>
                                        <p className="text-emerald-700 text-base font-medium">Importez plusieurs clients en une seule fois</p>
                                    </div>
                                </div>
                            </div>

                            {/* CSV Import Body */}
                            <form onSubmit={submitCSV} className="p-8 space-y-8">
                                {/* Info Banner */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Info className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-blue-900 mb-2">Format CSV requis</h4>
                                            <p className="text-sm text-blue-700">
                                                Votre fichier CSV doit contenir les colonnes suivantes : 
                                                <code className="inline-block mx-1 px-2 py-1 bg-blue-100 rounded font-mono text-xs">name</code>, 
                                                <code className="inline-block mx-1 px-2 py-1 bg-blue-100 rounded font-mono text-xs">email</code>, 
                                                <code className="inline-block mx-1 px-2 py-1 bg-blue-100 rounded font-mono text-xs">phone</code> (optionnel)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-3">
                                        Fichier CSV <span className="text-rose-500">*</span>
                                    </label>
                                    <label
                                        htmlFor="csv_file"
                                        className="group flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-white hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-400 transition-all duration-300"
                                    >
                                        <div className="flex flex-col items-center justify-center py-8">
                                            {fileName ? (
                                                <>
                                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
                                                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                                    </div>
                                                    <p className="mb-2 text-base font-bold text-gray-700">{fileName}</p>
                                                    <p className="text-sm text-gray-500">Cliquez pour changer de fichier</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300">
                                                        <Upload className="w-10 h-10 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                                    </div>
                                                    <p className="mb-2 text-base font-bold text-gray-700">
                                                        Cliquez pour télécharger ou glissez-déposez
                                                    </p>
                                                    <p className="text-sm text-gray-500">Fichier CSV uniquement</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="csv_file"
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {errors.csv_file && <InputError message={errors.csv_file} className="mt-2" />}
                                </div>

                                {/* Example CSV */}
                                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200">
                                    <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                        Exemple de fichier CSV :
                                    </h4>
                                    <pre className="text-sm bg-white p-4 rounded-xl border-2 border-gray-200 overflow-x-auto font-mono">
                                        <code>name,email,phone{'\n'}Jean Dupont,jean@example.com,+33 6 12 34 56 78{'\n'}Marie Martin,marie@example.com,+33 6 98 76 54 32</code>
                                    </pre>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                                    <Link
                                        href={route('customers.index')}
                                        className="text-base text-gray-600 hover:text-gray-900 font-bold transition-colors"
                                    >
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.csv_file}
                                        className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Import en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                                Importer les clients
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                {/* Help Section */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-8">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                            <Info className="w-6 h-6 text-emerald-600" />
                        </div>
                        Informations importantes
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">L'email est obligatoire pour tous les clients</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">Le numéro de téléphone est requis uniquement pour les envois par SMS ou WhatsApp</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">Vous pouvez importer plusieurs clients simultanément via un fichier CSV</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mt-0.5">
                                <Info className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base text-gray-700">Le canal d'envoi sera choisi lors de l'envoi de la demande de feedback</span>
                        </li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
