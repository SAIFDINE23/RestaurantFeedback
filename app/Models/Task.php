<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'company_id',
        'title',
        'description',
        'status',
        'severity',
        'priority',
        'due_date',
        'source',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    // Statuts possibles
    public const STATUS_NOT_STARTED = 'not_started';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';

    // Sévérités possibles
    public const SEVERITY_CRITICAL = 'critical';
    public const SEVERITY_MODERATE = 'moderate';
    public const SEVERITY_LOW = 'low';

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function radarIssue()
    {
        return $this->hasOne(RadarIssue::class);
    }

    // Helper pour obtenir le label du statut
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            self::STATUS_NOT_STARTED => 'Pas encore',
            self::STATUS_IN_PROGRESS => 'En cours',
            self::STATUS_COMPLETED => 'Terminé',
            default => $this->status,
        };
    }

    // Helper pour obtenir le label de la sévérité
    public function getSeverityLabelAttribute()
    {
        return match($this->severity) {
            self::SEVERITY_CRITICAL => 'Critique',
            self::SEVERITY_MODERATE => 'Modéré',
            self::SEVERITY_LOW => 'Faible',
            default => $this->severity,
        };
    }
}
