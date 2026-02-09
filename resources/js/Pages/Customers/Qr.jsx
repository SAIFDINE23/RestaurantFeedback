import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Link as LinkIcon } from 'lucide-react';
import QRCode from 'qrcode';

export default function Qr({ auth, customer, qr_url }) {
    const [qrDataUrl, setQrDataUrl] = useState('');

    useEffect(() => {
        const generateQr = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(qr_url, {
                    width: 320,
                    margin: 2,
                    color: {
                        dark: '#111827',
                        light: '#FFFFFF',
                    },
                });
                setQrDataUrl(dataUrl);
            } catch (e) {
                console.error(e);
            }
        };

        generateQr();
    }, [qr_url]);

    const downloadQr = () => {
        if (!qrDataUrl) return;
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `feedora-qr-${customer.id}.png`;
        a.click();
    };

    return (
        <AuthenticatedLayout user={auth.user} header="QR Code Feedback">
            <Head title="QR Code Feedback" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">QR Code Feedback</h1>
                        <p className="text-sm text-gray-500">Client : {customer.name || customer.email}</p>
                    </div>
                    <Link
                        href={route('customers.show', customer.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Link>
                </div>

                {/* QR Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="QR Code" className="w-72 h-72 rounded-2xl border border-gray-200" />
                                ) : (
                                    <div className="w-72 h-72 rounded-2xl border border-gray-200 bg-gray-50" />
                                )}

                                {/* Logo au centre */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center">
                                        <img src="/images/logo_feedora.png" alt="Feedora" className="w-12 h-12 object-contain" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">Lien de feedback</h2>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                <LinkIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700 break-all">{qr_url}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={downloadQr}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-white bg-feedora-500 rounded-xl hover:bg-feedora-600"
                                >
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                </button>
                                <a
                                    href={qr_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-feedora-700 bg-feedora-50 rounded-xl hover:bg-feedora-100"
                                >
                                    Ouvrir le lien
                                </a>
                            </div>

                            <p className="text-sm text-gray-500">
                                Imprimez ce QR Code ou placez‑le sur une table. Les clients pourront donner leur avis en scannant.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
