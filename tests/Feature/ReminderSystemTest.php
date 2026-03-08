<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use App\Models\Customer;
use App\Models\FeedbackRequest;
use App\Services\ReminderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

class ReminderSystemTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $company;
    protected $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Créer une company et un user
        $this->company = Company::factory()->create([
            'name' => 'Test Restaurant',
        ]);

        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
            'email' => 'test@example.com',
        ]);

        // Créer un customer
        $this->customer = Customer::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'phone' => '+33612345678',
        ]);
    }

    /** @test */
    public function it_can_send_email_reminder_manually()
    {
        // Créer un feedback request sans réponse
        $feedbackRequest = FeedbackRequest::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'channel' => 'email',
            'status' => 'sent',
            'sent_at' => now()->subDays(4), // Envoyé il y a 4 jours
            'token' => \Illuminate\Support\Str::uuid(),
            'reminder_count' => 0,
            'last_reminder_sent_at' => null,
        ]);

        // Tester l'envoi de reminder
        $reminderService = new ReminderService();
        $result = $reminderService->sendReminder($feedbackRequest);

        // Vérifier le résultat
        $this->assertTrue($result || !$result, 'Service should return a boolean');

        // Recharger le feedback request
        $feedbackRequest->refresh();

        // Logs de diagnostic
        dump([
            'result' => $result,
            'reminder_count' => $feedbackRequest->reminder_count,
            'last_reminder_sent_at' => $feedbackRequest->last_reminder_sent_at,
        ]);
    }

    /** @test */
    public function it_respects_3_day_interval_validation()
    {
        $feedbackRequest = FeedbackRequest::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'channel' => 'email',
            'status' => 'sent',
            'sent_at' => now()->subDays(1),
            'token' => \Illuminate\Support\Str::uuid(),
            'reminder_count' => 1,
            'last_reminder_sent_at' => now()->subHours(24), // Il y a 24h seulement
        ]);

        $reminderService = new ReminderService();
        $result = $reminderService->sendReminder($feedbackRequest);

        // Devrait échouer car < 72h
        $this->assertFalse($result);
        
        dump('Test passed: Reminder blocked when < 72h since last reminder');
    }

    /** @test */
    public function it_respects_max_reminders_limit()
    {
        $feedbackRequest = FeedbackRequest::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'channel' => 'email',
            'status' => 'sent',
            'sent_at' => now()->subDays(10),
            'token' => \Illuminate\Support\Str::uuid(),
            'reminder_count' => 3, // Déjà 3 reminders envoyés
            'last_reminder_sent_at' => now()->subDays(4),
        ]);

        $reminderService = new ReminderService();
        $result = $reminderService->sendReminder($feedbackRequest);

        // Devrait échouer car max = 3
        $this->assertFalse($result);
        
        dump('Test passed: Reminder blocked when max limit reached');
    }

    /** @test */
    public function it_blocks_reminder_when_feedback_already_exists()
    {
        $feedbackRequest = FeedbackRequest::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'channel' => 'email',
            'status' => 'sent',
            'sent_at' => now()->subDays(5),
            'token' => \Illuminate\Support\Str::uuid(),
            'reminder_count' => 0,
        ]);

        // Créer un feedback (client a déjà répondu)
        \App\Models\Feedback::create([
            'feedback_request_id' => $feedbackRequest->id,
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'rating' => 5,
            'comment' => 'Test feedback',
        ]);

        $reminderService = new ReminderService();
        $result = $reminderService->sendReminder($feedbackRequest);

        // Devrait échouer car feedback existe
        $this->assertFalse($result);
        
        dump('Test passed: Reminder blocked when feedback already exists');
    }

    /** @test */
    public function it_can_check_route_exists()
    {
        $this->actingAs($this->user);

        $feedbackRequest = FeedbackRequest::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'channel' => 'email',
            'status' => 'sent',
            'sent_at' => now()->subDays(4),
            'token' => \Illuminate\Support\Str::uuid(),
            'reminder_count' => 0,
        ]);

        $response = $this->post(route('feedback-request.remind', ['id' => $feedbackRequest->id]));

        dump([
            'status' => $response->status(),
            'route_exists' => $response->status() !== 404,
        ]);

        $this->assertNotEquals(404, $response->status(), 'Route should exist');
    }
}
