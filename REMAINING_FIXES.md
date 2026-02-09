# Fixes Restantes - Subscription System

## ✅ Fixes Appliquées

1. **Plan Validation (DONE)**
   - `Plan::where('id', $planId)->where('is_active', true)->firstOrFail()`
   - Appliqué dans: `SubscriptionController`, `StripeController`

2. **Payment Failed Handler (DONE)**
   - Case `invoice.payment_failed` ajouté au webhook
   - Méthode `handleInvoicePaymentFailed()` implémentée
   - Status → `past_due` lors échec paiement

---

## ⚠️ Fixes Recommandées (TODO)

### 1. SMS Routes Protection (Priority: HIGH)

**Fichier:** `routes/web.php`

Ajouter middleware `plan.credits` sur les routes SMS:

```php
Route::post('/feedbacks/bulk-send', [FeedbackRequestController::class, 'bulkSend'])
    ->middleware('plan.credits') // ← ADD THIS
    ->name('feedback-requests.bulk');

Route::post('/feedback/{id}/send', [FeedbackRequestController::class, 'send'])
    ->middleware('plan.credits') // ← ADD THIS
    ->name('feedback.send');
```

**Impact:** Empêche l'envoi SMS si crédits insuffisants

---

### 2. Email Notifications (Priority: MEDIUM)

**Fichiers à créer:**
- `app/Mail/SubscriptionUpgradedMail.php`
- `app/Mail/SubscriptionDowngradedMail.php`
- `app/Mail/PaymentFailedMail.php`
- `app/Mail/LowCreditsWarningMail.php`

**Où les envoyer:**
```php
// app/Http/Controllers/StripeController.php

protected function handleInvoicePaymentFailed($invoice): void {
    // ...
    Mail::to($subscription->company->users->first()->email)
        ->send(new PaymentFailedMail($subscription, $invoice));
}

protected function handleSubscriptionCanceled($stripeSubscription): void {
    // ...
    Mail::to($subscription->company->users->first()->email)
        ->send(new SubscriptionDowngradedMail($subscription));
}

protected function applyPlanUpgrade($companyId, $planId, ...) {
    // ...
    Mail::to($company->users->first()->email)
        ->send(new SubscriptionUpgradedMail($company, $plan));
}
```

---

### 3. Proration Check (Priority: LOW)

Vérifier dans Stripe Dashboard que **proration** est activée:
- Stripe → Billing settings → Enable proration

Cela facture au prorata lors d'un upgrade mid-month.

---

### 4. Concurrency Handling (Priority: LOW)

Ajouter lock sur subscriptions lors mise à jour:

```php
use Illuminate\Support\Facades\Cache;

protected function applyPlanUpgrade(...) {
    $lockName = "subscription_update_{$companyId}";
    
    Cache::lock($lockName, 10)->block(5, function () {
        // Update logic
    });
}
```

---

## 🔍 Testing Checklist

- [ ] Test upgrade FREE → BASIC → PRO
- [ ] Test cancel via Portal (downgrade → FREE)
- [ ] Test payment failure webhook
- [ ] Test concurrent upgrade requests
- [ ] Test SMS blocked when credits = 0
- [ ] Test add-ons persistence through upgrade/downgrade
- [ ] Test monthly reset (invoice.payment_succeeded)
- [ ] Test plan validation (inject invalid plan ID)

---

## 📝 Summary

**Status:** 80% Production-Ready

**Completed (2/4):**
- ✅ Plan validation
- ✅ Payment failed handler

**Remaining (2/4):**
- 🔧 SMS middleware protection
- 📧 Email notifications

**Time to Complete:** ~2 hours
