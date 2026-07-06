<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionCredits;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PlanMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'PlansTableSeeder']);
    }

    /** @test */
    public function free_plan_cannot_access_ai_features()
    {
        $user = User::factory()->create();
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Test Restaurant',
            'sector' => 'restaurant',
        ]);

        $freePlan = Plan::where('slug', 'free')->first();
        $subscription = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $freePlan->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => (float) $freePlan->credits_monthly,
            'credits_available_monthly' => (float) $freePlan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_addon_balance' => 0,
            'credits_total_available' => (float) $freePlan->credits_monthly,
            'last_reset_date' => now(),
        ]);

        $response = $this->actingAs($user)->post('/feedback/1/replies/ai');

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    /** @test */
    public function basic_plan_can_access_ai_but_not_radar()
    {
        $user = User::factory()->create();
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Test Restaurant',
            'sector' => 'restaurant',
        ]);

        $basicPlan = Plan::where('slug', 'basic')->first();
        $subscription = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $basicPlan->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => (float) $basicPlan->credits_monthly,
            'credits_available_monthly' => (float) $basicPlan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_addon_balance' => 0,
            'credits_total_available' => (float) $basicPlan->credits_monthly,
            'last_reset_date' => now(),
        ]);

        // Radar IA should be blocked
        $response = $this->actingAs($user)->get('/radar-ia');
        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    /** @test */
    public function pro_plan_can_access_all_features()
    {
        $user = User::factory()->create();
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Test Restaurant',
            'sector' => 'restaurant',
        ]);

        $proPlan = Plan::where('slug', 'pro')->first();
        $subscription = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $proPlan->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => (float) $proPlan->credits_monthly,
            'credits_available_monthly' => (float) $proPlan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_addon_balance' => 0,
            'credits_total_available' => (float) $proPlan->credits_monthly,
            'last_reset_date' => now(),
        ]);

        // Debug: verify plan features
        $this->assertTrue($subscription->hasFeature('radar_ai'), 'PRO plan should have radar_ai feature');

        // Radar IA should NOT be blocked by plan.feature middleware
        $response = $this->actingAs($user)->get('/radar-ia');
        
        // Debug: show redirect location
        if ($response->isRedirect()) {
            dump('Redirected to: ' . $response->headers->get('Location'));
            dump('Session errors: ' . session('error'));
        }
        
        // Should not redirect to subscription.index (which would mean middleware blocked it)
        $this->assertFalse(
            $response->isRedirect(route('subscription.index')),
            'Pro plan should not be blocked by radar_ai feature middleware'
        );
    }

    /** @test */
    public function user_without_credits_cannot_send_sms()
    {
        $user = User::factory()->create();
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Test Restaurant',
            'sector' => 'restaurant',
        ]);

        // Create a customer for valid request
        $customer = \App\Models\Customer::create([
            'company_id' => $company->id,
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'phone' => '+33612345678',
        ]);

        $basicPlan = Plan::where('slug', 'basic')->first();
        $subscription = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $basicPlan->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => (float) $basicPlan->credits_monthly,
            'credits_available_monthly' => 0, // No credits left
            'credits_used_monthly' => (float) $basicPlan->credits_monthly,
            'credits_addon_balance' => 0,
            'credits_total_available' => 0,
            'last_reset_date' => now(),
        ]);

        $response = $this->actingAs($user)->post('/feedback-requests', [
            'customer_id' => $customer->id,
            'channel' => 'sms',
        ]);

        // Should be blocked by credits middleware for SMS
        $response->assertRedirect(route('subscription.index'));
        $this->assertTrue(
            session()->has('error') && 
            (str_contains(strtolower(session('error')), 'crédit') || 
             str_contains(strtolower(session('error')), 'credit'))
        );
    }

    /** @test */
    public function free_plan_can_send_email_without_sms_credits()
    {
        $user = User::factory()->create();
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Test Restaurant',
            'sector' => 'restaurant',
        ]);

        $customer = \App\Models\Customer::create([
            'company_id' => $company->id,
            'name' => 'Test Customer',
            'email' => 'test@example.com',
        ]);

        $freePlan = Plan::where('slug', 'free')->first();
        $subscription = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $freePlan->id,
            'status' => 'active',
            'starts_at' => now(),
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => 0,
            'credits_available_monthly' => 0,
            'credits_used_monthly' => 0,
            'credits_addon_balance' => 0,
            'credits_total_available' => 0,
            'last_reset_date' => now(),
        ]);

        // Email should NOT be blocked by credits middleware (emails are free)
        $response = $this->actingAs($user)->post('/feedback-requests', [
            'customer_id' => $customer->id,
            'channel' => 'email',
        ]);

        // Should not redirect to subscription page (credits check passed)
        $this->assertNotEquals(
            route('subscription.index'),
            $response->headers->get('Location'),
            'Free plan should be able to send emails without SMS credits'
        );
    }
}
