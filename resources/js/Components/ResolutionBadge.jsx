import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ResolutionBadge({ feedback, onMarkResolved, onMarkUnresolved }) {
    if (!feedback) {
        return null;
    }

    if (feedback.resolved_at) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Résolu le {new Date(feedback.resolved_at).toLocaleDateString('fr-FR')}
                </div>
                <button
                    onClick={() => onMarkUnresolved?.(feedback.id)}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium"
                >
                    Annuler
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => onMarkResolved?.(feedback)}
            className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold hover:bg-amber-200 transition-colors"
        >
            <AlertCircle className="w-3 h-3" />
            À résoudre
        </button>
    );
}
