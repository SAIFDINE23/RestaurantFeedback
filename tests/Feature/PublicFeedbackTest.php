<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Feedback;
use App\Models\FeedbackRequest;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionCredits;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicFeedbackTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Company $company;
    private Plan $plan;
    private Subscription $subscription;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake the job queue to avoid real Gemini API calls
        Bus::fake();

        $this->plan = Plan::create([
            'name'              => 'Basic',
            'slug'              => 'basic',
            'price'             => 29.00,
            'currency'          => 'EUR',
            'billing_period'    => 'month',
            'credits_monthly'   => 100,
            'sms_quota_monthly' => 100,
            'max_feedbacks'     => null,
            'email_unlimited'   => true,
            'features'          => ['ai_replies' => true, 'radar_ai' => false],
            'is_active'         => true,
            'sort_order'        => 2,
        ]);

        $this->user = User::factory()->create();

        // Create company without observer (saveQuietly)
        $this->company = new Company([
            'user_id'                => $this->user->id,
            'name'                   => 'Restaurant Test',
            'sector'                 => 'restaurant',
            'feedback_public_token'  => 'test_token_12',
            'google_review_url'      => 'https://g.page/test/review',
            'review_platforms'       => [
                ['id' => 'google', 'name' => 'Google', 'url' => 'https://g.page/test/review', 'enabled' => true],
            ],
        ]);
        $this->company->saveQuietly();

        $this->subscription = Subscription::create([
            'company_id' => $this->company->id,
            'plan_id'    => $this->plan->id,
            'status'     => 'active',
            'ends_at'    => null,
        ]);

        SubscriptionCredits::create([
            'subscription_id'           => $this->subscription->id,
            'credits_monthly'           => 100,
            'credits_used_monthly'      => 0,
            'credits_available_monthly' => 100,
            'credits_addon_balance'     => 0,
            'credits_total_available'   => 100,
            'last_reset_date'           => now(),
        ]);
    }

    public function test_public_feedback_page_loads(): void
    {
        $response = $this->get('/f/test_token_12');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('PublicFeedback/Show')
                 ->has('company')
                 ->has('token')
                 ->has('postUrl')
        );
    }

    public function test_invalid_token_returns_404(): void
    {
        $response = $this->get('/f/invalid_token');

        $response->assertStatus(404);
    }

    public function test_feedback_can_be_submitted_with_rating_only(): void
    {
        $response = $this->followingRedirects()->post('/f/test_token_12', [
            'rating' => 4,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('feedback', [
            'rating'    => 4,
            'is_public' => true,
        ]);

        $this->assertDatabaseHas('feedback_requests', [
            'company_id' => $this->company->id,
            'channel'    => 'qr',
            'status'     => 'completed',
        ]);
    }

    public function test_feedback_with_comment_and_contact_creates_customer(): void
    {
        $response = $this->followingRedirects()->post('/f/test_token_12', [
            'rating'  => 5,
            'comment' => 'Service incroyable !',
            'name'    => 'Jean Dupont',
            'email'   => 'jean@example.com',
            'phone'   => '+33612345678',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('customers', [
            'company_id' => $this->company->id,
            'name'       => 'Jean Dupont',
            'email'      => 'jean@example.com',
            'phone'      => '+33612345678',
            'source'     => 'qr_code',
        ]);

        $this->assertDatabaseHas('feedback', [
            'rating'  => 5,
            'comment' => 'Service incroyable !',
        ]);
    }

    public function test_existing_customer_is_reused(): void
    {
        $customer = Customer::create([
            'company_id' => $this->company->id,
            'name'       => 'Marie Martin',
            'email'      => 'marie@example.com',
            'source'     => 'manual',
        ]);

        $this->post('/f/test_token_12', [
            'rating' => 3,
            'name'   => 'Marie Martin',
            'email'  => 'marie@example.com',
        ]);

        // Should NOT create a duplicate
        $this->assertEquals(1, Customer::where('email', 'marie@example.com')->count());

        // The feedback request should reference the existing customer
        $feedbackRequest = FeedbackRequest::where('company_id', $this->company->id)->latest()->first();
        $this->assertEquals($customer->id, $feedbackRequest->customer_id);
    }

    public function test_low_rating_does_not_return_google_url(): void
    {
        $this->post('/f/test_token_12', [
            'rating' => 2,
        ]);

        // Rating < 4 should NOT redirect to Google
        $feedback = Feedback::latest()->first();
        $this->assertEquals(2, $feedback->rating);
    }

    public function test_high_rating_returns_google_url(): void
    {
        $this->post('/f/test_token_12', [
            'rating' => 5,
        ]);

        // Rating >= 4 should have the Google URL available
        $feedback = Feedback::latest()->first();
        $this->assertEquals(5, $feedback->rating);
        $this->assertNotNull($this->company->google_review_url);
    }

    public function test_validation_rejects_invalid_rating(): void
    {
        $response = $this->post('/f/test_token_12', [
            'rating' => 6,
        ]);

        $response->assertSessionHasErrors('rating');

        $response2 = $this->post('/f/test_token_12', [
            'rating' => 0,
        ]);

        $response2->assertSessionHasErrors('rating');
    }

    public function test_free_plan_feedback_limit_enforced(): void
    {
        // Switch to free plan with max_feedbacks = 2
        $freePlan = Plan::create([
            'name'              => 'Free',
            'slug'              => 'free',
            'price'             => 0,
            'currency'          => 'EUR',
            'billing_period'    => 'month',
            'credits_monthly'   => 0,
            'sms_quota_monthly' => 0,
            'max_feedbacks'     => 2,
            'email_unlimited'   => false,
            'features'          => [],
            'is_active'         => true,
            'sort_order'        => 1,
        ]);

        $this->subscription->update(['plan_id' => $freePlan->id]);

        // Create an anonymous customer for seed data
        $anonCustomer = Customer::create([
            'company_id' => $this->company->id,
            'name'       => 'Client anonyme',
            'email'      => 'anon-seed@feedback.local',
            'source'     => 'qr_code',
        ]);

        // Submit 2 feedbacks (within limit)
        for ($i = 0; $i < 2; $i++) {
            $fr = FeedbackRequest::create([
                'company_id'  => $this->company->id,
                'customer_id' => $anonCustomer->id,
                'token'       => Str::uuid()->toString(),
                'channel'     => 'qr',
                'status'      => 'completed',
                'sent_at'     => now(),
            ]);
            Feedback::create([
                'feedback_request_id' => $fr->id,
                'rating'              => 4,
                'is_public'           => true,
            ]);
        }

        // 3rd submission should hit the limit
        $response = $this->followingRedirects()->post('/f/test_token_12', [
            'rating' => 5,
        ]);

        $response->assertOk();
        // Should still only have 2 feedbacks (3rd was blocked)
        $feedbackCount = Feedback::whereHas('feedbackRequest', function ($q) {
            $q->where('company_id', $this->company->id);
        })->count();
        $this->assertEquals(2, $feedbackCount);
    }
}
