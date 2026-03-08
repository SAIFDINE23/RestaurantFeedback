<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class RadarIssue extends Model
{
    protected $fillable = [
        'company_id',
        'task_id',
        'title',
        'description',
        'category',
        'severity',
        'status',
        'detected_at',
        'resolved_at',
    ];

    protected $casts = [
        'detected_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public const STATUS_DETECTED = 'detected';
    public const STATUS_TASK_CREATED = 'task_created';
    public const STATUS_RESOLVED = 'resolved';

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function feedbacks()
    {
        return $this->belongsToMany(Feedback::class, 'radar_issue_feedback')
            ->withTimestamps();
    }

    /**
     * Get feedback IDs linked to active (non-resolved) radar issues for a company.
     * These feedbacks should be excluded from future IA analyses.
     */
    public static function excludedFeedbackIds(int $companyId): array
    {
        return DB::table('radar_issue_feedback')
            ->join('radar_issues', 'radar_issues.id', '=', 'radar_issue_feedback.radar_issue_id')
            ->where('radar_issues.company_id', $companyId)
            ->whereIn('radar_issues.status', [self::STATUS_TASK_CREATED, self::STATUS_RESOLVED])
            ->pluck('radar_issue_feedback.feedback_id')
            ->unique()
            ->values()
            ->all();
    }
}
