<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\RadarIssue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    private const IMPORTANCE_MAP = [
        'high' => Task::SEVERITY_CRITICAL,
        'medium' => Task::SEVERITY_MODERATE,
        'low' => Task::SEVERITY_LOW,
    ];

    public function index()
    {
        $company = Auth::user()->company;

        if (! $company) {
            abort(403);
        }

        $tasks = Task::where('company_id', $company->id)
            ->latest()
            ->get()
            ->map(function (Task $task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'status' => $task->status,
                    'status_label' => $task->status_label,
                    'severity' => $task->severity,
                    'importance' => $this->severityToImportance($task->severity),
                    'created_at' => optional($task->created_at)->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'statusOptions' => [
                ['value' => Task::STATUS_NOT_STARTED, 'label' => 'À faire'],
                ['value' => Task::STATUS_IN_PROGRESS, 'label' => 'En cours'],
                ['value' => Task::STATUS_COMPLETED, 'label' => 'Terminé'],
            ],
            'importanceOptions' => [
                ['value' => 'high', 'label' => 'High'],
                ['value' => 'medium', 'label' => 'Medium'],
                ['value' => 'low', 'label' => 'Low'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $company = Auth::user()->company;

        if (! $company) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:not_started,in_progress,completed'],
            'importance' => ['nullable', 'in:high,medium,low'],
            'feedback_ids' => ['nullable', 'array'],
            'feedback_ids.*' => ['integer', 'exists:feedback,id'],
            'radar_category' => ['nullable', 'string', 'max:50'],
        ]);

        $task = Task::create([
            'company_id' => $company->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? Task::STATUS_NOT_STARTED,
            'severity' => $this->importanceToSeverity($validated['importance'] ?? 'medium'),
            'source' => !empty($validated['feedback_ids']) ? 'radar_ia' : null,
        ]);

        // Si des feedback_ids sont fournis, créer un RadarIssue et lier les feedbacks
        if (!empty($validated['feedback_ids'])) {
            $radarIssue = RadarIssue::create([
                'company_id' => $company->id,
                'task_id' => $task->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'category' => $validated['radar_category'] ?? null,
                'severity' => $this->importanceToSeverityLabel($validated['importance'] ?? 'medium'),
                'status' => RadarIssue::STATUS_TASK_CREATED,
                'detected_at' => now(),
            ]);

            $radarIssue->feedbacks()->attach($validated['feedback_ids']);
        }

        return back();
    }

    public function updateStatus(Request $request, Task $task)
    {
        $company = Auth::user()->company;

        if (! $company || $task->company_id !== $company->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:not_started,in_progress,completed'],
        ]);

        $task->update([
            'status' => $validated['status'],
        ]);

        // Auto-résoudre le radar issue si la tâche est complétée
        if ($validated['status'] === Task::STATUS_COMPLETED && $task->radarIssue) {
            $task->radarIssue->update([
                'status' => RadarIssue::STATUS_RESOLVED,
                'resolved_at' => now(),
            ]);
        }

        // Si la tâche est réouverte, réouvrir aussi le radar issue
        if ($validated['status'] !== Task::STATUS_COMPLETED && $task->radarIssue?->status === RadarIssue::STATUS_RESOLVED) {
            $task->radarIssue->update([
                'status' => RadarIssue::STATUS_TASK_CREATED,
                'resolved_at' => null,
            ]);
        }

        return back();
    }

    private function importanceToSeverity(string $importance): string
    {
        return self::IMPORTANCE_MAP[$importance] ?? Task::SEVERITY_MODERATE;
    }

    private function importanceToSeverityLabel(string $importance): string
    {
        return match ($importance) {
            'high' => 'P0',
            'medium' => 'P1',
            'low' => 'P2',
            default => 'P1',
        };
    }

    private function severityToImportance(?string $severity): string
    {
        $reverse = array_flip(self::IMPORTANCE_MAP);
        return $reverse[$severity] ?? 'medium';
    }
}
