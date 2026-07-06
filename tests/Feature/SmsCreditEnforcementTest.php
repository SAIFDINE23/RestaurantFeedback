<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionCredits;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * RF-00 — Le contrôle de crédits SMS doit réellement bloquer les envois
 * quand le solde est insuffisant (le bug : canSendSms() renvoyait un tableau
 * testé comme booléen, donc le contrôle ne bloquait jamais → fuite de revenus).
 */
class SmsCreditEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private function makeSubscription(float $availableCredits): Subscription
    {
        $user = User::factory()->create();
        $company = Company::create(['user_id' => $user->id, 'name' => 'Resto Test']);

        $plan = Plan::create([
            'name' => 'Basic',
            'slug' => 'basic',
            'price' => 19.99,
            'currency' => 'EUR',
            'billing_period' => 'month',
            'sms_quota_monthly' => 100,
            'email_unlimited' => true,
            'credits_monthly' => 100,
            'max_restaurants' => 1,
            'max_users' => 3,
            'max_feedbacks' => null,
            'features' => [],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $subscription = Subscription::create([
            'company_id' => $company->id,
            'plan_id' => $plan->id,
            'status' => 'active',
        ]);

        SubscriptionCredits::create([
            'subscription_id' => $subscription->id,
            'credits_monthly' => 100,
            'credits_used_monthly' => 100 - $availableCredits,
            'credits_available_monthly' => $availableCredits,
            'credits_addon_balance' => 0,
            'credits_total_available' => $availableCredits,
            'last_reset_date' => now()->toDateString(), // évite un reset auto
        ]);

        return $subscription->fresh('credits');
    }

    public function test_sms_is_blocked_and_brevo_not_called_when_credits_insufficient(): void
    {
        Http::fake(); // Toute requête sortante serait interceptée
        config(['services.brevo.api_key' => 'test-key', 'services.brevo.sms_sender' => 'Test']);

        $subscription = $this->makeSubscription(availableCredits: 0);

        $this->expectException(\RuntimeException::class);

        try {
            app(SmsService::class)->sendWithCredits('+33612345678', 'Bonjour', $subscription);
        } finally {
            // Le SMS ne doit JAMAIS avoir été envoyé à Brevo
            Http::assertNothingSent();
        }
    }

    public function test_sms_is_sent_and_credits_consumed_when_sufficient(): void
    {
        Http::fake([
            'api.brevo.com/*' => Http::response(['messageId' => 'msg_123'], 201),
        ]);
        config(['services.brevo.api_key' => 'test-key', 'services.brevo.sms_sender' => 'Test']);

        $subscription = $this->makeSubscription(availableCredits: 10);

        $result = app(SmsService::class)->sendWithCredits('+33612345678', 'Bonjour', $subscription);

        $this->assertSame('msg_123', $result['messageId']);
        Http::assertSentCount(1);

        // Coût par défaut = 1 unité (pays non tarifé) → solde 10 → 9
        $this->assertEqualsWithDelta(
            9.0,
            (float) $subscription->credits->fresh()->credits_total_available,
            0.001
        );
    }
}
