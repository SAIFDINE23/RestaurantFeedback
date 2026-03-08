import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Mail, MessageCircle, QrCode, Phone, Eye, Reply, CheckCircle2, Clock, Send, BarChart3, Bell, Pin } from 'lucide-react';

export default function Index({ auth, feedbacks }) {
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPin, setFilterPin] = useState('all'); // 'all', 'pinned'
    const [searchTerm, setSearchTerm] = useState('');
    const [feedbackStates, setFeedbackStates] = useState({});

    // Filtrage des feedbacks
    const filteredFeedbacks = feedbacks.data.filter(fb => {
        const matchesStatus = filterStatus === 'all' || fb.status === filterStatus;
        const matchesPin = 
            filterPin === 'all' ? true :
            filterPin === 'pinned' ? fb.feedback?.is_pinned :
            true;
        const matchesSearch = !searchTerm || 
            fb.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPin && matchesSearch;
    });

    // Stats calculées
    const stats = {
        total: feedbacks.data.length,
        sent: feedbacks.data.filter(fb => fb.status === 'sent').length,
        pending: feedbacks.data.filter(fb => fb.status === 'pending').length,
        completed: feedbacks.data.filter(fb => fb.status === 'completed').length,
        pinned: feedbacks.data.filter(fb => fb.feedback?.is_pinned).length,
    };

    return (
        <AuthenticatedLayout user={auth.user} header="Feedbacks">
            <Head title="Feedbacks" />

            <div className="space-y-6">
                {/* Header Premium */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-white mb-2">📊 Tous les Feedbacks</h1>
                                <p className="text-blue-100 text-lg">Gérez toutes les demandes et réponses de feedback en un seul endroit</p>
                            </div>
                            <Link
                                href={route('customers.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <Send size={18} />
                                Envoyer une demande
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards Premium */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total"
                        value={stats.total}
                        icon={<BarChart3 size={28} />}
                        tone="slate"
                    />
                    <StatCard 
                        title="Envoyés"
                        value={stats.sent}
                        icon={<Send size={28} />}
                        tone="blue"
                    />
                    <StatCard 
                        title="En attente"
                        value={stats.pending}
                        icon={<Clock size={28} />}
                        tone="amber"
                    />
                    <StatCard 
                        title="Complétés"
                        value={stats.completed}
                        icon={<CheckCircle2 size={28} />}
                        tone="green"
                    />
                </div>

                {/* Filters Premium */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
                    {/* Search */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par client, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>

                    {/* Statut Filter */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Statut</h3>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                active={filterStatus === 'all'}
                                onClick={() => setFilterStatus('all')}
                                label="Tous"
                                gradient="from-blue-600 to-indigo-600"
                            />
                            <FilterButton
                                active={filterStatus === 'sent'}
                                onClick={() => setFilterStatus('sent')}
                                label="Envoyés"
                                gradient="from-blue-600 to-cyan-600"
                            />
                            <FilterButton
                                active={filterStatus === 'pending'}
                                onClick={() => setFilterStatus('pending')}
                                label="En attente"
                                gradient="from-amber-500 to-orange-600"
                            />
                            <FilterButton
                                active={filterStatus === 'completed'}
                                onClick={() => setFilterStatus('completed')}
                                label="Complétés"
                                gradient="from-green-600 to-emerald-600"
                            />
                        </div>
                    </div>

                    {/* Pin Filter */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Affichage</h3>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                active={filterPin === 'all'}
                                onClick={() => setFilterPin('all')}
                                label="Tous"
                                gradient="from-gray-600 to-gray-700"
                            />
                            <FilterButton
                                active={filterPin === 'pinned'}
                                onClick={() => setFilterPin('pinned')}
                                label={`📌 Épinglés (${stats.pinned})`}
                                gradient="from-yellow-500 to-yellow-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Feedbacks Table Premium */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {filteredFeedbacks.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 size={48} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {searchTerm || filterStatus !== 'all' ? 'Aucun feedback trouvé' : 'Aucun feedback pour le moment'}
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm || filterStatus !== 'all' 
                                    ? 'Essayez de modifier vos filtres' 
                                    : 'Les feedbacks apparaîtront ici une fois envoyés'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Grid de cartes Feedbacks */}
                            <div className="space-y-4">
                                {filteredFeedbacks.map((fb) => (
                                    <FeedbackCard key={fb.id} feedback={fb} />
                                ))}
                            </div>

                            {/* Pagination Premium */}
                            {feedbacks.links && feedbacks.links.length > 3 && (
                                <div className="px-6 py-4 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between">
                                    <div className="flex gap-2 flex-wrap">
                                        {feedbacks.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                    link.active
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                                        : link.url 
                                                            ? 'text-gray-700 hover:bg-white hover:shadow-md'
                                                            : 'text-gray-400 cursor-not-allowed'
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
        </AuthenticatedLayout>
    );
}

/* ----------- COMPONENTS ----------- */

function StatCard({ title, value, icon, tone }) {
    const tones = {
        slate: {
            gradient: 'from-slate-500 via-slate-600 to-gray-600',
            border: 'border-slate-200',
            bg: 'bg-slate-50'
        },
        blue: {
            gradient: 'from-blue-500 via-blue-600 to-cyan-600',
            border: 'border-blue-200',
            bg: 'bg-blue-50'
        },
        amber: {
            gradient: 'from-amber-500 via-amber-600 to-orange-600',
            border: 'border-amber-200',
            bg: 'bg-amber-50'
        },
        green: {
            gradient: 'from-green-500 via-green-600 to-emerald-600',
            border: 'border-green-200',
            bg: 'bg-green-50'
        }
    };

    return (
        <div className={`relative group ${tones[tone].bg} rounded-2xl shadow-sm border-2 ${tones[tone].border} p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden`}>
            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">{title}</p>
                    <p className="text-4xl font-black text-gray-900">{value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tones[tone].gradient} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label, gradient }) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                active 
                    ? `bg-gradient-to-r ${gradient} text-white shadow-lg scale-105` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
        >
            {label}
        </button>
    );
}

function StatusBadge({ status }) {
    const statusConfig = {
        sent: {
            bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
            label: 'Envoyé',
            icon: Send
        },
        pending: {
            bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
            label: 'En attente',
            icon: Clock
        },
        completed: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            label: 'Complété',
            icon: CheckCircle2
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white ${config.bg} shadow-md`}>
            <IconComponent size={14} />
            {config.label}
        </span>
    );
}

function ChannelBadge({ channel }) {
    const channelConfig = {
        email: {
            bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            label: 'Email',
            icon: Mail,
        },
        sms: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            label: 'SMS',
            icon: Phone,
        },
        whatsapp: {
            bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
            label: 'WhatsApp',
            icon: MessageCircle,
        },
        qr: {
            bg: 'bg-gradient-to-r from-purple-500 to-fuchsia-600',
            label: 'QR Code',
            icon: QrCode,
        },
    };

    const config = channelConfig[channel] || {
        bg: 'bg-gradient-to-r from-gray-400 to-slate-500',
        label: '—',
        icon: null,
    };
    
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white ${config.bg} shadow-md`}>
            {IconComponent && <IconComponent size={14} />}
            {config.label}
        </span>
    );
}

function Rating({ value }) {
    if (!value) {
        return <span className="text-sm text-gray-400 font-semibold">Pas encore noté</span>;
    }
    
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                ))}
            </div>
            <span className="text-sm font-bold text-gray-900">{value}/5</span>
        </div>
    );
}

function PinButton({ feedback }) {
    const [isPinned, setIsPinned] = useState(feedback?.feedback?.is_pinned || false);
    const [isLoadingPin, setIsLoadingPin] = useState(false);

    const handlePin = async () => {
        if (!feedback?.feedback?.id) return;
        setIsLoadingPin(true);
        try {
            const endpoint = isPinned ? 'feedback.unpin' : 'feedback.pin';
            const response = await fetch(route(endpoint, feedback.feedback.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setIsPinned(!isPinned);
            }
        } catch (error) {
            console.error('Error pinning feedback:', error);
        } finally {
            setIsLoadingPin(false);
        }
    };

    return (
        <div className="flex gap-1">
            <button
                onClick={handlePin}
                disabled={isLoadingPin}
                className={`p-2 transition-colors ${
                    isPinned 
                        ? 'text-yellow-600 hover:text-yellow-700' 
                        : 'text-gray-400 hover:text-yellow-600'
                } disabled:opacity-50`}
                title={isPinned ? 'Dépingler' : 'Épingler'}
            >
                <Pin className="w-5 h-5" fill={isPinned ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
}

function RemindButton({ feedbackRequest }) {
    const [isSending, setIsSending] = useState(false);

    // Logique d'affichage: seulement si status = sent/pending ET reminder_count < 3 ET pas de feedback
    const canSendReminder = 
        (feedbackRequest.status === 'sent' || feedbackRequest.status === 'pending') &&
        !feedbackRequest.feedback?.id && // Pas de feedback reçu
        (feedbackRequest.reminder_count || 0) < 3;

    const handleRemind = async () => {
        if (!confirm('Envoyer un reminder à ce client ?')) return;
        
        setIsSending(true);
        try {
            const response = await fetch(route('feedback-request.remind', feedbackRequest.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                alert('✅ Reminder envoyé avec succès!');
                window.location.reload();
            } else {
                const data = await response.json();
                alert('❌ ' + (data.message || 'Erreur lors de l\'envoi du reminder'));
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            alert('❌ Erreur lors de l\'envoi du reminder');
        } finally {
            setIsSending(false);
        }
    };

    if (!canSendReminder) return null;

    const reminderCount = feedbackRequest.reminder_count || 0;

    return (
        <button
            onClick={handleRemind}
            disabled={isSending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 transition-all disabled:opacity-50"
            title="Envoyer un reminder"
        >
            <Bell size={16} className={isSending ? 'animate-pulse' : ''} />
            Relancer
            {reminderCount > 0 && (
                <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                    {reminderCount}/3
                </span>
            )}
        </button>
    );
}

function DeleteFeedbackButton({ feedback }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback? Cette action est irréversible.')) {
            return;
        }

        if (!feedback?.feedback?.id) return;
        setIsDeleting(true);
        try {
            const response = await fetch(route('feedback.destroy', feedback.feedback.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                // Reload page to reflect deletion
                window.location.reload();
            } else {
                alert('Erreur lors de la suppression du feedback');
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Erreur lors de la suppression du feedback');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto"
            title="Supprimer ce feedback"
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
        </button>
    );
}

function FeedbackCard({ feedback }) {
    const getChannelIcon = (channel) => {
        const icons = {
            email: '✉️',
            sms: '📱',
            qr: '📲',
        };
        return icons[channel] || '📍';
    };

    const getInitials = (name, email) => {
        if (name) {
            return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        }
        return email?.charAt(0).toUpperCase() || '?';
    };

    const getAvatarColor = (name) => {
        const colors = [
            'bg-orange-500',
            'bg-blue-500',
            'bg-indigo-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-green-500',
            'bg-red-500',
            'bg-cyan-500',
        ];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    const customerName = feedback.customer?.name || 'Client supprimé';
    const initials = getInitials(customerName, feedback.customer?.email);
    const avatarColor = getAvatarColor(customerName);
    const rating = feedback.feedback?.rating;
    const comment = feedback.feedback?.comment;
    const createdAt = new Date(feedback.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${
            feedback.feedback?.is_pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
        }`}>
            {/* Badge épinglé */}
            {feedback.feedback?.is_pinned && (
                <div className="flex gap-2 mb-3">
                    {feedback.feedback?.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                            <Pin className="w-3 h-3" fill="currentColor" />
                            Épinglé
                        </span>
                    )}
                </div>
            )}

            {/* Header: Avatar + Nom + Rating + Date + Source */}
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-14 h-14 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                    {initials}
                </div>

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{customerName}</h3>
                    </div>

                    {/* Rating */}
                    {rating && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                        key={star}
                                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date + Source */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{createdAt}</span>
                        <span>📍</span>
                        <span className="font-semibold capitalize">{feedback.channel || 'Inconnu'}</span>
                    </div>
                </div>

                {/* Statut */}
                <StatusBadge status={feedback.status} />
            </div>

            {/* Commentaire */}
            {comment && (
                <p className="text-gray-700 text-base mb-5 leading-relaxed">
                    {comment}
                </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {feedback.status === 'completed' && feedback.feedback?.id ? (
                    <>
                        <Link
                            href={route('feedback.adminShow', feedback.feedback?.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-all"
                        >
                            <Eye size={16} />
                            Voir détails
                        </Link>
                        <Link
                            href={route('feedback.replies.index', feedback.feedback?.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all"
                        >
                            <Reply size={16} />
                            Répondre
                        </Link>
                        <PinButton feedback={feedback} />
                        <DeleteFeedbackButton feedback={feedback} />
                    </>
                ) : (
                    <>
                        <RemindButton feedbackRequest={feedback} />
                        <span className="text-sm text-gray-400">Feedback en attente de complétude...</span>
                    </>
                )}
            </div>
        </div>
    );
}

function FeedbackActions({ feedback }) {
    if (feedback.status === 'completed' && feedback.feedback?.id) {
        return (
            <div className="flex items-center justify-end gap-2">
                <Link
                    href={route('feedback.adminShow', feedback.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:scale-105"
                    title="Voir le feedback"
                >
                    <Eye size={14} />
                </Link>

                <Link
                    href={route('feedback.replies.index', feedback.feedback?.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all hover:scale-105"
                    title="Répondre au feedback"
                >
                    <Reply size={14} />
                </Link>
            </div>
        );
    }

    if (feedback.status !== 'completed') {
        return (
            <span className="text-xs text-gray-400 font-bold">
                —
            </span>
        );
    }

    return <span className="text-xs text-gray-400">—</span>;
}
