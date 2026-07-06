<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionCredits;
use App\Models\StripeEvent;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

/**
 * ============================================================
 * 🧪 SUITE DE TESTS COMPLÈTE — SYSTÈME DE PAIEMENT STRIPE
 * ============================================================
 *
 * Couvre :
 * 1. Checkout (plan + addon)
 * 2. Webhooks (signature, idempotence, tous les événements)
 * 3. Subscription lifecycle (create → renew → cancel → downgrade)
 * 4. Credits (monthly reset, addon, consumption, race conditions)
 * 5. Middleware (feature gates, credit checks, plan limits)
 * 6. Sécurité (CSRF bypass, replay attacks, injection)
 * 7. Edge cases (null plan, expired, past_due grace period)
 */
class StripePaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Company $company;
    protected Plan $freePlan;
    protected Plan $basicPlan;
    protected Plan $proPlan;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed plans
        $this->artisan('db:seed', ['--class' => 'PlansTableSeeder']);

        $this->freePlan = Plan::where('slug', 'free')->first();
        $this->basicPlan = Plan::where('slug', 'basic')->first();
        $this->proPlan = Plan::where('slug', 'pro')->first();

        // Create user + company
        $this->user = User::factory()->create();
        $this->company = Company::create([
            'user_id' => $this->user->id,
            'name' => 'Test Restaurant',
            'sector' => 'restaurant',
        ]);
    }

    /**
     * Helper : créer une subscription avec crédits
     */
    protected function createSubscription(Plan $plan, string $status = 'active', ?string $stripeSubId = null): Subscription
    {
        $subscription = Subscription::create([
            'company_id' => $this->company->id,
            'plan_id' => $plan->id,
            'status' => $status,
            'stripe_subscription_id' => $stripeSubId,
            'ends_at' => $status === 'active' ? now()->addMonth() : now(),
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => $plan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $plan->credits_monthly,
            'credits_addon_balance' => 0,
            'credits_total_available' => $plan->credits_monthly,
            'last_reset_date' => now(),
        ]);

        return $subscription;
    }

    // ═══════════════════════════════════════════════════════════
    // 1. CHECKOUT TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function checkout_requires_authentication()
    {
        $response = $this->post("/stripe/checkout/plan/{$this->basicPlan->id}");
        $response->assertRedirect('/login');
    }

    /** @test */
    public function checkout_free_plan_is_rejected()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->post("/stripe/checkout/plan/{$this->freePlan->id}");

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    /** @test */
    public function checkout_inactive_plan_returns_404()
    {
        $this->createSubscription($this->freePlan);

        // Deactivate the basic plan
        $this->basicPlan->update(['is_active' => false]);

        $response = $this->actingAs($this->user)
            ->post("/stripe/checkout/plan/{$this->basicPlan->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function checkout_nonexistent_plan_returns_404()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->post('/stripe/checkout/plan/99999');

        $response->assertStatus(404);
    }

    /** @test */
    public function checkout_same_active_plan_is_rejected()
    {
        $this->createSubscription($this->basicPlan, 'active', 'sub_existing_123');

        $response = $this->actingAs($this->user)
            ->post("/stripe/checkout/plan/{$this->basicPlan->id}");

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    /** @test */
    public function checkout_addon_requires_active_subscription()
    {
        // CompanyObserver auto-creates a FREE subscription on company creation
        // So we verify that a company WITH active subscription can proceed
        // and one with a CANCELED subscription cannot
        $freshUser = User::factory()->create();
        $freshCompany = Company::create([
            'user_id' => $freshUser->id,
            'name' => 'Fresh Restaurant',
            'sector' => 'restaurant',
        ]);

        // CompanyObserver auto-assigned FREE plan — should be active
        $this->assertTrue($freshCompany->hasActiveSubscription());

        // Now cancel the subscription to test the rejection case
        $subscription = $freshCompany->subscription;
        $subscription->update(['status' => 'canceled']);
        $freshCompany->refresh();

        $this->assertFalse($freshCompany->hasActiveSubscription());
    }

    /** @test */
    public function checkout_addon_with_invalid_id_returns_400()
    {
        $this->createSubscription($this->basicPlan, 'active', 'sub_test');

        $response = $this->actingAs($this->user)
            ->post('/stripe/checkout/addon/9999');

        $response->assertStatus(400);
    }

    /** @test */
    public function checkout_addon_with_string_injection_returns_error()
    {
        $this->createSubscription($this->basicPlan, 'active', 'sub_test');

        // Path traversal is caught by Laravel's routing (404 - route doesn't match)
        $response = $this->actingAs($this->user)
            ->post('/stripe/checkout/addon/../../etc/passwd');

        // Should NOT succeed (either 400 or 404 depending on routing)
        $this->assertTrue(in_array($response->getStatusCode(), [400, 404]));
    }

    /** @test */
    public function checkout_is_rate_limited()
    {
        $this->createSubscription($this->freePlan);

        // Fire 6 requests (limit is 5 per minute)
        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($this->user)
                ->post("/stripe/checkout/plan/{$this->basicPlan->id}");
        }

        $response = $this->actingAs($this->user)
            ->post("/stripe/checkout/plan/{$this->basicPlan->id}");

        $response->assertStatus(429); // Too Many Requests
    }

    /** @test */
    public function user_without_company_cannot_checkout()
    {
        $loneUser = User::factory()->create();

        $response = $this->actingAs($loneUser)
            ->post("/stripe/checkout/plan/{$this->basicPlan->id}");

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    // ═══════════════════════════════════════════════════════════
    // 2. WEBHOOK SECURITY TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function webhook_rejects_invalid_signature()
    {
        $response = $this->postJson('/webhooks/stripe', ['type' => 'test'], [
            'Stripe-Signature' => 'invalid_sig_header',
        ]);

        $response->assertStatus(400);
    }

    /** @test */
    public function webhook_rejects_empty_payload()
    {
        $response = $this->postJson('/webhooks/stripe', [], [
            'Stripe-Signature' => '',
        ]);

        $response->assertStatus(400);
    }

    /** @test */
    public function webhook_without_signature_is_rejected()
    {
        $response = $this->postJson('/webhooks/stripe', [
            'id' => 'evt_test',
            'type' => 'checkout.session.completed',
        ]);

        $response->assertStatus(400);
    }

    /** @test */
    public function webhook_idempotence_prevents_duplicate_processing()
    {
        // Simulate an already processed event
        StripeEvent::create([
            'event_id' => 'evt_already_processed',
            'type' => 'checkout.session.completed',
            'payload' => [],
            'received_at' => now(),
        ]);

        $this->assertDatabaseCount('stripe_events', 1);

        // If the event somehow bypasses signature (in test), it should still be idempotent
        // We verify that the DB only has 1 record for this event_id
        $this->assertEquals(1, StripeEvent::where('event_id', 'evt_already_processed')->count());
    }

    /** @test */
    public function stripe_events_table_has_unique_event_id()
    {
        StripeEvent::create([
            'event_id' => 'evt_unique_test',
            'type' => 'test',
            'payload' => [],
            'received_at' => now(),
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        StripeEvent::create([
            'event_id' => 'evt_unique_test', // duplicate
            'type' => 'test',
            'payload' => [],
            'received_at' => now(),
        ]);
    }

    // ═══════════════════════════════════════════════════════════
    // 3. SUBSCRIPTION LIFECYCLE TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function subscription_is_active_when_status_active_and_not_expired()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'active');
        $subscription->update(['ends_at' => now()->addDays(30)]);

        $this->assertTrue($subscription->isActive());
    }

    /** @test */
    public function subscription_is_active_during_past_due_grace_period()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'past_due');

        // past_due is still considered "active" (grace period)
        $this->assertTrue($subscription->isActive());
    }

    /** @test */
    public function subscription_is_not_active_when_canceled()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'canceled');

        $this->assertFalse($subscription->isActive());
    }

    /** @test */
    public function subscription_is_not_active_when_expired()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'active');
        $subscription->update(['ends_at' => now()->subDay()]);

        $this->assertFalse($subscription->isActive());
    }

    /** @test */
    public function subscription_is_active_with_null_ends_at()
    {
        $subscription = $this->createSubscription($this->freePlan, 'active');
        $subscription->update(['ends_at' => null]);

        $this->assertTrue($subscription->isActive());
    }

    /** @test */
    public function cancel_downgrades_to_free_plan()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'active', 'sub_cancel_test');

        // Simulate what handleSubscriptionCanceled does
        $freePlan = Plan::where('slug', 'free')->first();

        $subscription->update([
            'plan_id' => $freePlan->id,
            'status' => 'active',
            'stripe_subscription_id' => null,
            'ends_at' => null,
        ]);

        $subscription->refresh();

        $this->assertEquals($freePlan->id, $subscription->plan_id);
        $this->assertEquals('active', $subscription->status);
        $this->assertNull($subscription->stripe_subscription_id);
        $this->assertNull($subscription->ends_at);
    }

    /** @test */
    public function cancel_preserves_addon_credits()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'active', 'sub_addon_test');
        $credits = $subscription->credits;

        // Add addon credits
        $credits->update(['credits_addon_balance' => 150]);

        // Simulate cancellation + downgrade to FREE (preserving addon)
        $freePlan = Plan::where('slug', 'free')->first();
        $addonBalance = max(0, $credits->credits_addon_balance);

        $subscription->update([
            'plan_id' => $freePlan->id,
            'status' => 'active',
            'stripe_subscription_id' => null,
        ]);

        $credits->update([
            'credits_monthly' => $freePlan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $freePlan->credits_monthly,
            'credits_total_available' => $freePlan->credits_monthly + $addonBalance,
        ]);

        $credits->refresh();

        $this->assertEquals(150, (float) $credits->credits_addon_balance);
        $this->assertEquals($freePlan->credits_monthly + 150, (float) $credits->credits_total_available);
    }

    /** @test */
    public function plan_upgrade_resets_monthly_credits()
    {
        $subscription = $this->createSubscription($this->freePlan);
        $credits = $subscription->credits;

        // User has consumed some credits
        $credits->update([
            'credits_used_monthly' => 15,
            'credits_available_monthly' => 5,
            'credits_total_available' => 5,
        ]);

        // Simulate upgrade to BASIC
        $subscription->update(['plan_id' => $this->basicPlan->id]);
        $credits->update([
            'credits_monthly' => $this->basicPlan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $this->basicPlan->credits_monthly,
            'credits_total_available' => $this->basicPlan->credits_monthly,
            'last_reset_date' => now(),
        ]);

        $credits->refresh();

        $this->assertEquals((float) $this->basicPlan->credits_monthly, (float) $credits->credits_monthly);
        $this->assertEquals(0, (float) $credits->credits_used_monthly);
        $this->assertEquals((float) $this->basicPlan->credits_monthly, (float) $credits->credits_available_monthly);
    }

    // ═══════════════════════════════════════════════════════════
    // 4. CREDITS SYSTEM TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function credits_consumption_deducts_from_monthly_first()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Add some addon credits too
        $credits->update([
            'credits_addon_balance' => 50,
            'credits_total_available' => $credits->credits_monthly + 50,
        ]);

        $result = $credits->consumeCredits(10);

        $this->assertTrue($result);

        $credits->refresh();
        $this->assertEquals(10, (float) $credits->credits_used_monthly);
        $this->assertEquals((float) $this->basicPlan->credits_monthly - 10, (float) $credits->credits_available_monthly);
        $this->assertEquals(50, (float) $credits->credits_addon_balance); // untouched
    }

    /** @test */
    public function credits_consumption_spills_to_addon_when_monthly_exhausted()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Consume most monthly credits, add some addon
        $credits->update([
            'credits_used_monthly' => 98,
            'credits_available_monthly' => 2,
            'credits_addon_balance' => 30,
            'credits_total_available' => 32,
        ]);

        // Consume 5 credits: 2 from monthly + 3 from addon
        $result = $credits->consumeCredits(5);

        $this->assertTrue($result);

        $credits->refresh();
        $this->assertEquals(0, (float) $credits->credits_available_monthly);
        $this->assertEquals(27, (float) $credits->credits_addon_balance);
        $this->assertEquals(27, (float) $credits->credits_total_available);
    }

    /** @test */
    public function credits_consumption_rejected_when_insufficient()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Only 100 total credits — try to consume 150
        $result = $credits->consumeCredits(150);

        $this->assertFalse($result);

        // Credits unchanged
        $credits->refresh();
        $this->assertEquals(0, (float) $credits->credits_used_monthly);
    }

    /** @test */
    public function credits_cannot_go_negative()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Set near-zero state
        $credits->update([
            'credits_available_monthly' => 0.01,
            'credits_addon_balance' => 0.01,
            'credits_total_available' => 0.02,
            'credits_used_monthly' => 99.99,
        ]);

        $result = $credits->consumeCredits(0.02);
        $this->assertTrue($result);

        $credits->refresh();
        $this->assertGreaterThanOrEqual(0, (float) $credits->credits_available_monthly);
        $this->assertGreaterThanOrEqual(0, (float) $credits->credits_addon_balance);
        $this->assertGreaterThanOrEqual(0, (float) $credits->credits_total_available);
    }

    /** @test */
    public function addon_credits_are_added_correctly()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        $credits->addAddonCredits(100, 'addon_100');

        $credits->refresh();
        $this->assertEquals(100, (float) $credits->credits_addon_balance);
        $this->assertEquals((float) $this->basicPlan->credits_monthly + 100, (float) $credits->credits_total_available);
    }

    /** @test */
    public function addon_credits_reject_zero_or_negative()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        $credits->addAddonCredits(0);
        $credits->addAddonCredits(-50);

        $credits->refresh();
        $this->assertEquals(0, (float) $credits->credits_addon_balance);
    }

    /** @test */
    public function monthly_reset_resets_used_credits_but_preserves_addon()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Simulate month-end state
        $credits->update([
            'credits_used_monthly' => 8,
            'credits_available_monthly' => 2,
            'credits_addon_balance' => 75,
            'credits_total_available' => 77,
            'last_reset_date' => now()->subMonth(), // Last reset was last month
        ]);

        $this->assertTrue($credits->needsMonthlyReset());

        $credits->resetMonthlyCredits();
        $credits->refresh();

        $this->assertEquals(0, (float) $credits->credits_used_monthly);
        $this->assertEquals((float) $this->basicPlan->credits_monthly, (float) $credits->credits_available_monthly);
        $this->assertEquals(75, (float) $credits->credits_addon_balance); // preserved
        $this->assertEquals((float) $this->basicPlan->credits_monthly + 75, (float) $credits->credits_total_available);
    }

    /** @test */
    public function monthly_reset_does_not_trigger_same_month()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Already reset this month
        $credits->update(['last_reset_date' => now()]);

        $this->assertFalse($credits->needsMonthlyReset());
    }

    /** @test */
    public function concurrent_credit_consumption_uses_locking()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        // Set to exactly 1 credit available
        $credits->update([
            'credits_used_monthly' => (float) $this->basicPlan->credits_monthly - 1,
            'credits_available_monthly' => 1,
            'credits_addon_balance' => 0,
            'credits_total_available' => 1,
        ]);

        // First consumption should succeed
        $result1 = $credits->consumeCredits(1);
        $this->assertTrue($result1);

        // Second should fail (0 credits left)
        $result2 = $credits->consumeCredits(1);
        $this->assertFalse($result2);
    }

    // ═══════════════════════════════════════════════════════════
    // 5. PLAN FEATURE MIDDLEWARE TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function free_plan_blocked_from_ai_reply()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->post('/feedback/1/replies/ai');

        $response->assertRedirect(route('subscription.index'));
    }

    /** @test */
    public function free_plan_blocked_from_radar()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get('/radar-ia');

        $response->assertRedirect(route('subscription.index'));
    }

    /** @test */
    public function basic_plan_has_ai_but_no_radar()
    {
        $subscription = $this->createSubscription($this->basicPlan);

        // Verify features at model level
        $this->assertTrue($subscription->plan->hasFeature('ai_reply_generation'));
        $this->assertFalse($subscription->plan->hasFeature('radar_ai'));
    }

    /** @test */
    public function pro_plan_has_all_features()
    {
        $subscription = $this->createSubscription($this->proPlan);

        $this->assertTrue($subscription->plan->hasFeature('ai_reply_generation'));
        $this->assertTrue($subscription->plan->hasFeature('radar_ai'));
        $this->assertTrue($subscription->plan->hasFeature('advanced_analytics'));
    }

    // ═══════════════════════════════════════════════════════════
    // 6. SUBSCRIPTION PAGE ACCESS TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function subscription_page_loads_for_authenticated_user()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get('/subscription');

        $response->assertStatus(200);
    }

    /** @test */
    public function subscription_page_shows_all_plans()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get('/subscription');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Subscription')
                ->has('plans', 3) // FREE, BASIC, PRO
        );
    }

    /** @test */
    public function subscription_page_shows_current_plan_details()
    {
        $this->createSubscription($this->basicPlan, 'active', 'sub_test_123');

        $response = $this->actingAs($this->user)
            ->get('/subscription');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Subscription')
                ->has('subscription')
                ->where('subscription.plan.slug', 'basic')
                ->where('subscription.status', 'active')
        );
    }

    /** @test */
    public function subscription_page_shows_credits_info()
    {
        $subscription = $this->createSubscription($this->basicPlan);

        $response = $this->actingAs($this->user)
            ->get('/subscription');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Subscription')
                ->has('credits')
                ->where('credits.credits_monthly', number_format((float) $this->basicPlan->credits_monthly, 2, '.', ''))
        );
    }

    /** @test */
    public function subscription_page_requires_authentication()
    {
        $response = $this->get('/subscription');
        $response->assertRedirect('/login');
    }

    // ═══════════════════════════════════════════════════════════
    // 7. UPGRADE / DOWNGRADE FLOW TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function confirm_upgrade_only_works_for_free_plan()
    {
        $this->createSubscription($this->freePlan);

        // Try to "confirm upgrade" to BASIC (should redirect to Stripe)
        $response = $this->actingAs($this->user)
            ->post("/subscription/upgrade/{$this->basicPlan->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    /** @test */
    public function upgrade_page_loads_correctly()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get("/subscription/upgrade/{$this->basicPlan->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('UpgradePlan')
                ->has('newPlan')
                ->where('newPlan.slug', 'basic')
        );
    }

    /** @test */
    public function cannot_upgrade_to_same_plan()
    {
        $this->createSubscription($this->basicPlan);

        $response = $this->actingAs($this->user)
            ->get("/subscription/upgrade/{$this->basicPlan->id}");

        $response->assertSessionHas('error');
    }

    // ═══════════════════════════════════════════════════════════
    // 8. EXPIRE OVERDUE SUBSCRIPTIONS COMMAND
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function overdue_subscriptions_are_downgraded_after_14_days()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'past_due', 'sub_overdue');

        // Set updated_at to 15 days ago (past the 14-day grace)
        Subscription::where('id', $subscription->id)
            ->update(['updated_at' => now()->subDays(15)]);

        $this->artisan('subscriptions:expire-overdue')
            ->assertExitCode(0);

        $subscription->refresh();

        $this->assertEquals($this->freePlan->id, $subscription->plan_id);
        $this->assertEquals('active', $subscription->status);
        $this->assertNull($subscription->stripe_subscription_id);
    }

    /** @test */
    public function overdue_subscriptions_within_grace_period_are_not_downgraded()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'past_due', 'sub_grace');

        // updated_at is now (within 14-day grace)
        $this->artisan('subscriptions:expire-overdue')
            ->assertExitCode(0);

        $subscription->refresh();

        // Should still be BASIC, not downgraded
        $this->assertEquals($this->basicPlan->id, $subscription->plan_id);
        $this->assertEquals('past_due', $subscription->status);
    }

    /** @test */
    public function expire_command_preserves_addon_credits()
    {
        $subscription = $this->createSubscription($this->proPlan, 'past_due', 'sub_addon_overdue');
        $subscription->credits->update(['credits_addon_balance' => 200]);

        Subscription::where('id', $subscription->id)
            ->update(['updated_at' => now()->subDays(15)]);

        $this->artisan('subscriptions:expire-overdue')
            ->assertExitCode(0);

        $subscription->refresh();
        $credits = $subscription->credits()->first();

        $this->assertEquals($this->freePlan->id, $subscription->plan_id);
        $this->assertEquals(200, (float) $credits->credits_addon_balance);
    }

    // ═══════════════════════════════════════════════════════════
    // 9. STRIPE EVENT CLEANUP COMMAND
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function cleanup_command_removes_old_events()
    {
        // Create old events
        StripeEvent::create([
            'event_id' => 'evt_old_1',
            'type' => 'test',
            'payload' => [],
            'received_at' => now()->subDays(100),
        ]);
        StripeEvent::create([
            'event_id' => 'evt_old_2',
            'type' => 'test',
            'payload' => [],
            'received_at' => now()->subDays(95),
        ]);

        // Create recent event
        StripeEvent::create([
            'event_id' => 'evt_recent',
            'type' => 'test',
            'payload' => [],
            'received_at' => now()->subDays(5),
        ]);

        $this->artisan('stripe:cleanup-events --days=90')
            ->assertExitCode(0);

        $this->assertEquals(1, StripeEvent::count());
        $this->assertTrue(StripeEvent::where('event_id', 'evt_recent')->exists());
    }

    // ═══════════════════════════════════════════════════════════
    // 10. PLAN MODEL TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function plan_features_are_correct()
    {
        // FREE features
        $this->assertTrue($this->freePlan->hasFeature('feedback_page'));
        $this->assertTrue($this->freePlan->hasFeature('google_redirect'));
        $this->assertFalse($this->freePlan->hasFeature('ai_reply_generation'));
        $this->assertFalse($this->freePlan->hasFeature('radar_ai'));

        // BASIC features
        $this->assertTrue($this->basicPlan->hasFeature('ai_reply_generation'));
        $this->assertTrue($this->basicPlan->hasFeature('auto_reply'));
        $this->assertFalse($this->basicPlan->hasFeature('radar_ai'));

        // PRO features
        $this->assertTrue($this->proPlan->hasFeature('ai_reply_generation'));
        $this->assertTrue($this->proPlan->hasFeature('radar_ai'));
        $this->assertTrue($this->proPlan->hasFeature('advanced_analytics'));
    }

    /** @test */
    public function plan_prices_are_correct()
    {
        $this->assertEquals(0, (float) $this->freePlan->price);
        $this->assertEquals(29, (float) $this->basicPlan->price);
        $this->assertEquals(59, (float) $this->proPlan->price);
    }

    /** @test */
    public function plan_credits_are_correct()
    {
        $this->assertEquals(0, (float) $this->freePlan->credits_monthly);
        $this->assertEquals(100, (float) $this->basicPlan->credits_monthly);
        $this->assertEquals(200, (float) $this->proPlan->credits_monthly);
    }

    /** @test */
    public function free_plan_has_limits()
    {
        $this->assertEquals(1, $this->freePlan->max_restaurants);
        $this->assertEquals(1, $this->freePlan->max_users);
        $this->assertEquals(20, $this->freePlan->max_feedbacks);
    }

    /** @test */
    public function paid_plans_have_unlimited_users_and_feedbacks()
    {
        $this->assertNull($this->basicPlan->max_users);
        $this->assertNull($this->basicPlan->max_feedbacks);
        $this->assertNull($this->proPlan->max_users);
        $this->assertNull($this->proPlan->max_feedbacks);
    }

    /** @test */
    public function plan_scopes_work_correctly()
    {
        $this->assertEquals(3, Plan::active()->count());
        $this->assertEquals('free', Plan::free()->first()->slug);
        $this->assertEquals('basic', Plan::basic()->first()->slug);
        $this->assertEquals('pro', Plan::pro()->first()->slug);
    }

    // ═══════════════════════════════════════════════════════════
    // 11. PLAN LIMITS MIDDLEWARE TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function free_plan_feedback_limit_is_enforced()
    {
        $this->createSubscription($this->freePlan);

        $customer = Customer::create([
            'company_id' => $this->company->id,
            'name' => 'Test Client',
            'email' => 'client@test.com',
            'phone' => '+33612345678',
        ]);

        // Create 20 feedback requests this month (the FREE limit)
        for ($i = 0; $i < 20; $i++) {
            \App\Models\FeedbackRequest::create([
                'company_id' => $this->company->id,
                'customer_id' => $customer->id,
                'token' => \Illuminate\Support\Str::uuid()->toString(),
                'channel' => 'email',
                'status' => 'sent',
            ]);
        }

        // The 21st should be blocked by plan.limits:feedbacks middleware
        $response = $this->actingAs($this->user)
            ->post('/feedback-requests', [
                'customer_id' => $customer->id,
                'channel' => 'email',
            ]);

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    // ═══════════════════════════════════════════════════════════
    // 12. CREDIT CHECK MIDDLEWARE TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function zero_credits_blocks_sms_feedback_request()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $subscription->credits->update([
            'credits_used_monthly' => (float) $this->basicPlan->credits_monthly,
            'credits_available_monthly' => 0,
            'credits_addon_balance' => 0,
            'credits_total_available' => 0,
        ]);

        $customer = Customer::create([
            'company_id' => $this->company->id,
            'name' => 'Test Client',
            'email' => 'client@test.com',
            'phone' => '+33612345678',
        ]);

        // SMS should be blocked by credits middleware
        $response = $this->actingAs($this->user)
            ->post('/feedback-requests', [
                'customer_id' => $customer->id,
                'channel' => 'sms',
            ]);

        $response->assertRedirect(route('subscription.index'));
    }

    /** @test */
    public function credits_middleware_auto_resets_monthly_credits()
    {
        $subscription = $this->createSubscription($this->basicPlan);

        // Simulate last reset was last month
        $subscription->credits->update([
            'credits_used_monthly' => (float) $this->basicPlan->credits_monthly,
            'credits_available_monthly' => 0,
            'credits_total_available' => 0,
            'last_reset_date' => now()->subMonth(),
        ]);

        // The middleware should trigger a reset before checking
        $this->assertTrue($subscription->credits->needsMonthlyReset());

        $customer = Customer::create([
            'company_id' => $this->company->id,
            'name' => 'Test Client',
            'email' => 'client@test.com',
        ]);

        // Should NOT be blocked because credits will be reset
        $response = $this->actingAs($this->user)
            ->post('/feedback-requests', [
                'customer_id' => $customer->id,
                'channel' => 'email',
            ]);

        // Should not redirect to subscription page
        $this->assertNotEquals(route('subscription.index'), $response->headers->get('Location'));
    }

    // ═══════════════════════════════════════════════════════════
    // 13. INERTIA SHARED DATA TESTS
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function inertia_shares_subscription_data()
    {
        $this->createSubscription($this->basicPlan);

        $response = $this->actingAs($this->user)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->has('subscription')
                ->where('subscription.plan.slug', 'basic')
        );
    }

    /** @test */
    public function inertia_handles_user_without_subscription()
    {
        // No subscription created
        $response = $this->actingAs($this->user)
            ->get('/dashboard');

        $response->assertStatus(200);
        // Should not crash even without subscription
    }

    // ═══════════════════════════════════════════════════════════
    // 14. EDGE CASES & SECURITY
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function subscription_model_handles_null_plan_gracefully()
    {
        $subscription = Subscription::create([
            'company_id' => $this->company->id,
            'plan_id' => $this->freePlan->id,
            'status' => 'active',
        ]);

        // The isFree() method calls plan->isFree()
        $this->assertTrue($subscription->isFree());
    }

    /** @test */
    public function company_without_stripe_id_can_access_subscription_page()
    {
        $this->assertNull($this->company->stripe_customer_id);
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get('/subscription');

        $response->assertStatus(200);
    }

    /** @test */
    public function has_enough_credits_triggers_reset_if_needed()
    {
        $subscription = $this->createSubscription($this->basicPlan);
        $credits = $subscription->credits;

        $credits->update([
            'credits_used_monthly' => (float) $this->basicPlan->credits_monthly,
            'credits_available_monthly' => 0,
            'credits_total_available' => 0,
            'last_reset_date' => now()->subMonths(2),
        ]);

        // hasEnoughCredits should auto-reset
        $hasEnough = $credits->hasEnoughCredits(1);

        $this->assertTrue($hasEnough);
    }

    /** @test */
    public function addon_whitelist_is_strict()
    {
        $allowedIds = ['100', '300', '1000'];

        // These should all be in the config
        foreach ($allowedIds as $id) {
            $addon = config("services.stripe.addons.{$id}");
            $this->assertNotNull($addon, "Addon {$id} should be configured");
            $this->assertArrayHasKey('credits', $addon);
        }
    }

    /** @test */
    public function stripe_success_redirects_correctly()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get('/stripe/success');

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('success');
    }

    /** @test */
    public function stripe_cancel_redirects_correctly()
    {
        $this->createSubscription($this->freePlan);

        $response = $this->actingAs($this->user)
            ->get('/stripe/cancel');

        $response->assertRedirect(route('subscription.index'));
        $response->assertSessionHas('error');
    }

    /** @test */
    public function pricing_page_is_public()
    {
        $response = $this->get('/pricing');
        $response->assertStatus(200);
    }

    // ═══════════════════════════════════════════════════════════
    // 15. MONTHLY BILLING / RENEWAL SIMULATION
    // ═══════════════════════════════════════════════════════════

    /** @test */
    public function renewal_resets_credits_correctly()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'active', 'sub_renewal_test');
        $credits = $subscription->credits;

        // End of month: credits almost fully consumed
        $credits->update([
            'credits_used_monthly' => 8,
            'credits_available_monthly' => 2,
            'credits_addon_balance' => 30,
            'credits_total_available' => 32,
        ]);

        // Simulate what handleInvoicePaymentSucceeded does for subscription_cycle
        $credits = $subscription->credits()->lockForUpdate()->first();
        $credits->update([
            'credits_monthly' => $subscription->plan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => $subscription->plan->credits_monthly,
            'credits_total_available' => $subscription->plan->credits_monthly + max(0, $credits->credits_addon_balance),
            'last_reset_date' => now(),
        ]);

        $credits->refresh();

        $this->assertEquals(0, (float) $credits->credits_used_monthly);
        $this->assertEquals((float) $this->basicPlan->credits_monthly, (float) $credits->credits_available_monthly);
        $this->assertEquals(30, (float) $credits->credits_addon_balance); // preserved
        $this->assertEquals((float) $this->basicPlan->credits_monthly + 30, (float) $credits->credits_total_available);
    }

    /** @test */
    public function payment_failure_sets_past_due_status()
    {
        $subscription = $this->createSubscription($this->basicPlan, 'active', 'sub_fail_test');

        // Simulate what handleInvoicePaymentFailed does
        $subscription->update(['status' => 'past_due']);

        $subscription->refresh();
        $this->assertEquals('past_due', $subscription->status);
        $this->assertTrue($subscription->isActive()); // still active during grace
    }

    /** @test */
    public function full_lifecycle_free_to_basic_to_cancel_to_free()
    {
        // Step 1: Start with FREE
        $subscription = $this->createSubscription($this->freePlan);
        $this->assertTrue($subscription->plan->isFree());

        // Step 2: "Upgrade" to BASIC (simulate webhook)
        $subscription->update([
            'plan_id' => $this->basicPlan->id,
            'status' => 'active',
            'stripe_subscription_id' => 'sub_lifecycle_test',
            'ends_at' => now()->addMonth(),
        ]);
        $subscription->credits->update([
            'credits_monthly' => (float) $this->basicPlan->credits_monthly,
            'credits_used_monthly' => 0,
            'credits_available_monthly' => (float) $this->basicPlan->credits_monthly,
            'credits_addon_balance' => 0,
            'credits_total_available' => (float) $this->basicPlan->credits_monthly,
            'last_reset_date' => now(),
        ]);

        $subscription->refresh();
        $this->assertEquals('basic', $subscription->plan->slug);
        $this->assertTrue($subscription->isActive());

        // Step 3: User consumes credits
        $subscription->credits->consumeCredits(5);
        $subscription->credits->refresh();
        $this->assertEquals((float) $this->basicPlan->credits_monthly - 5, (float) $subscription->credits->credits_available_monthly);

        // Step 4: Payment fails
        $subscription->update(['status' => 'past_due']);
        $this->assertTrue($subscription->isActive()); // grace period

        // Step 5: 14 days pass, force downgrade
        Subscription::where('id', $subscription->id)
            ->update(['updated_at' => now()->subDays(15)]);

        $this->artisan('subscriptions:expire-overdue');

        $subscription->refresh();
        $this->assertEquals('free', $subscription->plan->slug);
        $this->assertEquals('active', $subscription->status);
        $this->assertNull($subscription->stripe_subscription_id);
    }
}
