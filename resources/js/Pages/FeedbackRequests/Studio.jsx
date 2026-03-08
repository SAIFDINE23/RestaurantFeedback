import { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Mail, Smartphone, QrCode, Save, Send, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function Studio({ auth, customers, templates }) {
    const [activeChannel, setActiveChannel] = useState('sms');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [remindingIds, setRemindingIds] = useState([]);

    const { data, setData, put, processing, errors } = useForm({
        sms_template: templates.sms_template,
        email_subject_template: templates.email_subject_template,
        email_body_template: templates.email_body_template,
        qr_template: templates.qr_template || '',
    });

    const filteredCustomers = useMemo(() => {
        const q = search.toLowerCase();
        return customers.filter((c) => {
            if (activeChannel === 'sms' && !c.phone) return false;
            if (activeChannel === 'email' && !c.email) return false;
            return (
                (c.name || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q) ||
                (c.phone || '').toLowerCase().includes(q)
            );
        });
    }, [customers, search, activeChannel]);

    const toggleAll = () => {
        if (selectedIds.length === filteredCustomers.length) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(filteredCustomers.map((c) => c.id));
    };

    const toggleOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const sendBulk = () => {
        if (selectedIds.length === 0) return;

        if (activeChannel === 'qr') {
            const first = selectedIds[0];
            router.visit(route('customers.qr', first));
            return;
        }

        router.post(route('feedback-requests.bulk'), {
            customer_ids: selectedIds,
            channel: activeChannel,
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedIds([]),
        });
    };

    const sendSingle = (customerId) => {
        if (activeChannel === 'qr') {
            router.visit(route('customers.qr', customerId));
            return;
        }

        router.post(route('feedback-requests.store'), {
            customer_id: customerId,
            channel: activeChannel,
        }, { preserveScroll: true });
    };

    const canRemind = (customer) => {
        const last = customer.feedback_requests?.[0];
        if (!last) return false;
        if (last.channel !== activeChannel) return false;
        if (!['sent', 'pending'].includes(last.status)) return false;
        return (last.reminder_count || 0) < 3;
    };

    const sendReminder = async (customer, reloadAfter = true) => {
        const last = customer.feedback_requests?.[0];
        if (!last) return;

        setRemindingIds((prev) => [...prev, customer.id]);

        try {
            const { data } = await axios.post(route('feedback-request.remind', last.id), {}, {
                headers: { Accept: 'application/json' },
            });

            if (data?.success === false) {
                alert('❌ ' + (data?.message || 'Impossible d\'envoyer le rappel'));
                return;
            }

            if (reloadAfter) {
                router.reload({ preserveScroll: true });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur réseau pendant l\'envoi du rappel';
            alert('❌ ' + message);
        } finally {
            setRemindingIds((prev) => prev.filter((id) => id !== customer.id));
        }
    };

    const sendBulkReminders = async () => {
        const selectedCustomers = filteredCustomers.filter((c) => selectedIds.includes(c.id));
        const eligible = selectedCustomers.filter((c) => canRemind(c));

        if (eligible.length === 0) {
            alert('Aucun client sélectionné n\'est éligible à une relance.');
            return;
        }

        for (const customer of eligible) {
            // Envoi séquentiel pour rester fiable et éviter de saturer l'API
            // eslint-disable-next-line no-await-in-loop
            await sendReminder(customer, false);
        }

        router.reload({ preserveScroll: true });
    };

    const saveTemplates = (e) => {
        e.preventDefault();
        put(route('feedback-requests.templates.update'), { preserveScroll: true });
    };

    const templatePreview = useMemo(() => {
        const sample = {
            '{{customer_name}}': 'Sophie',
            '{{company_name}}': auth?.user?.company?.name || 'Mon Restaurant',
            '{{feedback_link}}': 'https://feedora.app/feedback/abc123',
        };

        const render = (value) => {
            let output = value || '';
            Object.entries(sample).forEach(([token, replacement]) => {
                output = output.split(token).join(replacement);
            });
            return output;
        };

        return {
            sms: render(data.sms_template),
            emailSubject: render(data.email_subject_template),
            emailBody: render(data.email_body_template),
            qr: render(data.qr_template),
        };
    }, [data, auth?.user?.company?.name]);

    return (
        <AuthenticatedLayout user={auth.user} header="Studio feedback">
            <Head title="Studio feedback" />

            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-2 flex gap-2">
                    <ChannelTab id="sms" active={activeChannel} setActive={setActiveChannel} icon={Smartphone} label="SMS" />
                    <ChannelTab id="email" active={activeChannel} setActive={setActiveChannel} icon={Mail} label="E-mail" />
                    <ChannelTab id="qr" active={activeChannel} setActive={setActiveChannel} icon={QrCode} label="QR Code" />
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Invitez vos clients</h2>
                            <span className="text-sm text-gray-500">{filteredCustomers.length} résultats</span>
                        </div>

                        <div className="relative mb-4">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nom, email ou téléphone"
                                className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-feedora-500 focus:border-feedora-500"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-3 text-sm">
                            <label className="flex items-center gap-2 text-gray-600 font-medium">
                                <input type="checkbox" checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length} onChange={toggleAll} className="rounded" />
                                Tout sélectionner
                            </label>
                            <div className="flex items-center gap-2">
                                {(activeChannel === 'sms' || activeChannel === 'email') && (
                                    <button
                                        onClick={sendBulkReminders}
                                        disabled={selectedIds.length === 0}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-500 text-white rounded-xl text-sm font-semibold"
                                    >
                                        Relancer sélection
                                    </button>
                                )}
                                <button
                                    onClick={sendBulk}
                                    disabled={selectedIds.length === 0}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-feedora-600 hover:bg-feedora-700 disabled:bg-gray-200 disabled:text-gray-500 text-white rounded-xl text-sm font-semibold"
                                >
                                    <Send className="w-4 h-4" />
                                    {activeChannel === 'qr' ? 'Générer QR' : `Envoyer (${selectedIds.length})`}
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 max-h-[460px] overflow-auto">
                            {filteredCustomers.map((customer) => (
                                <div key={customer.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <label className="flex items-center gap-3 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(customer.id)}
                                            onChange={() => toggleOne(customer.id)}
                                            className="rounded"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{customer.name || 'Sans nom'}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {activeChannel === 'sms' ? customer.phone : activeChannel === 'email' ? customer.email : (customer.email || customer.phone || '—')}
                                            </p>
                                        </div>
                                    </label>

                                    <button
                                        onClick={() => sendSingle(customer.id)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    >
                                        {activeChannel === 'qr' ? 'QR' : 'Envoyer'}
                                    </button>
                                    {(activeChannel === 'sms' || activeChannel === 'email') && canRemind(customer) && (
                                        <button
                                            onClick={() => sendReminder(customer)}
                                            disabled={remindingIds.includes(customer.id)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-700 disabled:opacity-50"
                                        >
                                            {remindingIds.includes(customer.id)
                                                ? 'Relance...'
                                                : `Relancer (${customer.feedback_requests?.[0]?.reminder_count || 0}/3)`}
                                        </button>
                                    )}
                                </div>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <div className="p-10 text-center text-sm text-gray-500">Aucun client compatible avec ce canal.</div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <form onSubmit={saveTemplates} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Personnaliser le contenu</h3>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                                >
                                    <Save className="w-3.5 h-3.5" /> Enregistrer
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {templates.tokens.map((token) => (
                                    <span key={token} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{token}</span>
                                ))}
                            </div>

                            {activeChannel === 'sms' && (
                                <>
                                    <textarea
                                        rows={8}
                                        value={data.sms_template}
                                        onChange={(e) => setData('sms_template', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-feedora-500 focus:border-feedora-500"
                                    />
                                    {errors.sms_template && <p className="text-xs text-red-500">{errors.sms_template}</p>}
                                </>
                            )}

                            {activeChannel === 'email' && (
                                <>
                                    <input
                                        value={data.email_subject_template}
                                        onChange={(e) => setData('email_subject_template', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-feedora-500 focus:border-feedora-500"
                                    />
                                    {errors.email_subject_template && <p className="text-xs text-red-500">{errors.email_subject_template}</p>}
                                    <textarea
                                        rows={10}
                                        value={data.email_body_template}
                                        onChange={(e) => setData('email_body_template', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-feedora-500 focus:border-feedora-500"
                                    />
                                    {errors.email_body_template && <p className="text-xs text-red-500">{errors.email_body_template}</p>}
                                </>
                            )}

                            {activeChannel === 'qr' && (
                                <>
                                    <textarea
                                        rows={4}
                                        value={data.qr_template}
                                        onChange={(e) => setData('qr_template', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-feedora-500 focus:border-feedora-500"
                                    />
                                    <p className="text-xs text-gray-500">Texte affiché dans le studio QR (optionnel).</p>
                                </>
                            )}

                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                Les placeholders sont obligatoires pour garder les données fixes: client, entreprise, lien.
                            </div>
                        </form>

                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <h3 className="font-bold text-gray-900 mb-3">Aperçu</h3>

                            {activeChannel === 'sms' && (
                                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50 text-sm whitespace-pre-line">
                                    {templatePreview.sms}
                                </div>
                            )}

                            {activeChannel === 'email' && (
                                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50 text-sm space-y-2">
                                    <p><span className="font-semibold">Objet:</span> {templatePreview.emailSubject}</p>
                                    <div className="whitespace-pre-line">{templatePreview.emailBody}</div>
                                </div>
                            )}

                            {activeChannel === 'qr' && (
                                <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50 text-sm">
                                    <p>{templatePreview.qr || 'Scannez ce QR Code pour laisser un avis.'}</p>
                                    <p className="mt-2 text-gray-500">Lien: https://feedora.app/feedback/abc123</p>
                                </div>
                            )}

                            <div className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Les templates sont enregistrés par entreprise.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    Astuce: vous pouvez continuer à envoyer depuis la page clients. Ce studio applique vos templates automatiquement.
                    <Link href={route('customers.index')} className="ml-2 text-feedora-600 font-semibold hover:text-feedora-700">Aller aux clients</Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ChannelTab({ id, active, setActive, icon: Icon, label }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => setActive(id)}
            className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition ${
                isActive ? 'bg-feedora-600 text-white shadow' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}
