<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'feedback_request_id',
        'rating',
        'comment',
        'is_public',
        'resolved_at',
        'resolved_by',
        'resolution_note',
        'is_pinned',
        'is_favorited',
        'pinned_at',
        'favorited_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_public' => 'boolean',
        'is_pinned' => 'boolean',
        'is_favorited' => 'boolean',
        'resolved_at' => 'datetime',
        'pinned_at' => 'datetime',
        'favorited_at' => 'datetime',
    ];

    public function feedbackRequest()
    {
        return $this->belongsTo(FeedbackRequest::class);
    }

    public function radarIssues()
    {
        return $this->belongsToMany(RadarIssue::class, 'radar_issue_feedback')
            ->withTimestamps();
    }

    public function replies()
    {
        return $this->hasMany(FeedbackReply::class);
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Marquer le feedback comme résolu
     */
    public function markResolved(int $userId, ?string $note = null): void
    {
        $this->update([
            'resolved_at' => now(),
            'resolved_by' => $userId,
            'resolution_note' => $note,
        ]);
    }

    /**
     * Marquer le feedback comme non résolu
     */
    public function markUnresolved(): void
    {
        $this->update([
            'resolved_at' => null,
            'resolved_by' => null,
            'resolution_note' => null,
        ]);
    }

    /**
     * Vérifier si le feedback est résolu
     */
    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    /**
     * Épingler le feedback
     */
    public function pin(): void
    {
        $this->update([
            'is_pinned' => true,
            'pinned_at' => now(),
        ]);
    }

    /**
     * Dépingler le feedback
     */
    public function unpin(): void
    {
        $this->update([
            'is_pinned' => false,
            'pinned_at' => null,
        ]);
    }

    /**
     * Ajouter le feedback aux favoris
     */
    public function favorite(): void
    {
        $this->update([
            'is_favorited' => true,
            'favorited_at' => now(),
        ]);
    }

    /**
     * Retirer le feedback des favoris
     */
    public function unfavorite(): void
    {
        $this->update([
            'is_favorited' => false,
            'favorited_at' => null,
        ]);
    }

    /**
     * Vérifier si le feedback est épinglé
     */
    public function isPinned(): bool
    {
        return $this->is_pinned === true;
    }

    /**
     * Vérifier si le feedback est en favoris
     */
    public function isFavorited(): bool
    {
        return $this->is_favorited === true;
    }
}
