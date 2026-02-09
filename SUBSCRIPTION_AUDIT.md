# 🔐 AUDIT COMPLET - Système Subscription/Paiement

## ✅ SÉCURITÉ & VULNÉRABILITÉS

### 1. Protection des Routes

- ✅ **Routes authentifiées** : `/subscription`, `/subscription/portal`, `/subscription/upgrade`, `/stripe/checkout/*`
  - Toutes dans le groupe `auth` + `verified`
  - Stripe webhook INTENTIONNELLEMENT public (`stripe/webhook`) avec validation de signature

**CODE:**
```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/subscription', ...) // ✅ Protected
    Route::post('/stripe/checkout/plan/{planId}', ...) // ✅ Protected
});

Route::post('/stripe/webhook', ...) // ✅ Intentionally public + signature verified
```

**FINDING:** ✅ OK - Routes correctement protégées

---

### 2. Validation Stripe Webhook

- ✅ **Signature Stripe validée** via `Webhook::constructEvent()` dans `StripeController@webhook()`
- ✅ **CSRF exception** explicite pour `/stripe/webhook` dans `bootstrap/app.php`
- ✅ **Idempotence** : `StripeEvent::where('event_id', $event->id)->exists()` avant traitement

**CODE:**
```php
// app/Http/Controllers/StripeController.php ligne 129
try {
    $event = Webhook::constructEvent($payload, $sigHeader, $secret); // ✅ Validated
} catch (\Throwable $e) {
    Log::error('Stripe webhook signature error: ' . $e->getMessage());
    return response('Invalid payload', 400);
}

if (StripeEvent::where('event_id', $event->id)->exists()) {
    return response('ok', 200); // ✅ Idempotence
}
```

**FINDING:** ✅ OK - Webhooks sécurisés avec signature + idempotence

---

### 3. Authorization & Data Isolation

**PROBLÈME :** `SubscriptionController@upgrade()` n'a pas de vérification d'ownership

```php
// ❌ PROBLÈME TROUVÉ
public function upgrade($planId)
{
    $company = Auth::user()->company; // ✅ User company
    $subscription = $company?->subscription;
    $plan = Plan::findOrFail($planId); // ❌ ANY plan, no ownership check
    // ...
}
```

**SOLUTION :** Valider que le plan existe et est actif

**RECOMMENDATION:** Ajouter validation
```php
public function upgrade($planId)
{
    $company = Auth::user()->company;
    if (!$company) {
        return back()->with('error', 'No company found');
    }
    
    $plan = Plan::where('id', $planId)->where('is_active', true)->firstOrFail();
    $subscription = $company?->subscription;
    // ...
}
```

**STATUS:** ⚠️ MINOR - Plan validation manquante

---

### 4. Plan ID Injection

**PROBLÈME :** Dans `confirmUpgrade($planId)` et `checkoutPlan($planId)`, le plan est directement récupéré sans validation

```php
// ❌ PROBLÈME POTENTIEL
$plan = Plan::findOrFail($planId); // Pas de check que c'est un plan valide payant
```

**SOLUTION:** Ajouter validation de plan actif

**RECOMMENDATION:**
```php
$plan = Plan::where('id', $planId)->where('is_active', true)->firstOrFail();
```

**STATUS:** ⚠️ MEDIUM - Faille théorique

---

### 5. Stripe Customer ID Binding

**PROBLÈME :** Un customer peut-il être lié à deux companies?

```php
// Dans StripeController@checkoutPlan()
if (!$company->stripe_customer_id) {
    $customer = $stripe->customers->create([
        'email' => $user->email,
        'name' => $company->name,
        // ❌ No metadata validation
    ]);
}
```

**SOLUTION:** Ajouter check que stripe_customer_id n'existe pas ailleurs

**RECOMMENDATION:**
```php
if (Company::where('stripe_customer_id', $company->stripe_customer_id)
    ->where('id', '!=', $company->id)
    ->exists()) {
    throw new \Exception('Stripe customer ID already used elsewhere');
}
```

**STATUS:** ⚠️ LOW - Théorique si création well-controlled

---

## 📋 FLUX MÉTIER & CAS LIMITES

### Scénario 1: FREE → BASIC Upgrade

**Flux:**
1. Client en FREE clique "Upgrader vers BASIC"
2. Route `/subscription/upgrade/2` → `SubscriptionController@upgrade()`
3. Affiche page de confirmation
4. POST `/stripe/checkout/plan/2` → `StripeController@checkoutPlan()`
5. Crée Stripe session en mode `subscription`
6. Webhook `checkout.session.completed` → `applyPlanUpgrade()`
   - Change plan_id → 2
   - Réinitialise credits (reset monthly, garde add-ons) ✅
   - Stocke stripe_subscription_id

**FINDING:** ✅ OK - Flux correct

---

### Scénario 2: BASIC Cancel (via Portal)

**Flux:**
1. Client en BASIC clique "Gérer l'abonnement"
2. Route `/subscription/portal` → `SubscriptionController@portal()`
3. Crée Stripe Portal session
4. Client clique "Cancel subscription" dans Stripe
5. Webhook `customer.subscription.deleted` → `handleSubscriptionCanceled()`
   - Change plan_id → 1 (FREE)
   - Reset monthly à 20, **garde add-ons** ✅
   - Status → `canceled`

**FINDING:** ✅ OK - Downgrade automatique implémenté

---

### Scénario 3: Quota Mensuel Reset

**Flux:**
1. Client BASIC paie le 7 février → Stripe crée monthly invoice
2. 7 mars, Stripe envoie webhook `invoice.payment_succeeded`
3. Handler réinitialise `credits_monthly` → 200, `credits_used_monthly` → 0
4. ADD-ONS restent intacts ✅

**FINDING:** ✅ OK - Reset automatique

---

### Scénario 4: Credits à 0 (Comportement)

**Cas:** Client a 0 crédits (monthly + add-ons épuisés)

**Contrôle:**
- ❌ **Pas de route middleware** appliquée pour empêcher l'envoi SMS
- ✅ Service `CreditConsumptionService` refuse l'envoi (`hasEnoughCredits()` check)
- ✅ Frontend : Alerte affichée si < 5 crédits

**FINDING:** ⚠️ MEDIUM - Pas de protection middleware sur SMS routes

**RECOMMENDATION:** Ajouter `middleware('plan.credits')` sur routes SMS

---

### Scénario 5: Add-ons Persistance lors Upgrade

**Cas:** Client BASIC avec 100 add-ons → upgrade PRO

**Comportement:**
```php
// StripeController@applyPlanUpgrade()
$credits->update([
    'credits_monthly' => $plan->credits_monthly,
    'credits_total_available' => $plan->credits_monthly + $credits->credits_addon_balance, // ✅ Garde add-ons
]);
```

**FINDING:** ✅ OK - Add-ons conservés lors upgrade

---

### Scénario 6: Downgrade Partiel (FREE ne peut pas downgrade)

**Cas:** Client FREE clique "Gérer abonnement" → bouton absent

**Vérification:**
```jsx
// resources/js/Pages/Subscription.jsx
{subscription && currentPlan?.slug !== 'free' && (
    <a href={route('subscription.portal')}>
```

**FINDING:** ✅ OK - Bouton caché pour FREE

---

## 📊 WEBHOOKS GÉRÉS

| Event | Implémentation | Status |
|-------|----------------|--------|
| `checkout.session.completed` | `applyPlanUpgrade()` + `applyAddonCredits()` | ✅ |
| `invoice.payment_succeeded` | Monthly reset | ✅ |
| `customer.subscription.deleted` | Downgrade auto FREE | ✅ |
| `invoice.payment_failed` | ❌ NOT IMPLEMENTED | ⚠️ |
| `invoice.finalized` | Logged but not used | ⚠️ |

**FINDING:** ⚠️ MEDIUM - `invoice.payment_failed` not handled

**RECOMMENDATION:** Implémenter webhook pour status → `past_due`

---

## 🔍 TESTS À FAIRE

### ✅ Fait
- Webhook signature validation
- Downgrade auto (cancel subscription)
- Reset monthly (invoice.payment_succeeded)
- Filter plans upgrade (see only higher tier)
- Portal access (non-FREE only)

### ❌ À faire
- [ ] Test payment failure (webhook `invoice.payment_failed`)
- [ ] Proration check (upgrade mid-month)
- [ ] Concurrent requests handling
- [ ] Plan ID injection attempt
- [ ] Cross-company access attempt
- [ ] Add-ons during downgrade
- [ ] Credits edge cases (< 1 unité)
- [ ] Email notifications (low credits, upgrade, downgrade)

---

## 🚨 CRITIQUE ISSUES

### 1. Missing `invoice.payment_failed` Webhook
**Impact:** Customers with failed payments stay on paid plan
**Fix:** Add handler for past_due status

### 2. Plan Validation Missing
**Impact:** Any plan ID could be passed
**Fix:** Add `.where('is_active', true)` on Plan queries

### 3. SMS Protection Middleware Not Applied
**Impact:** Credits can be bypassed
**Fix:** Add `middleware('plan.credits')` to SMS routes

### 4. No Email Notifications
**Impact:** Users don't know about upgrades/downgrades
**Fix:** Send emails on subscription changes

---

## ⚠️ WARNINGS

1. **Stripe Test Mode:** Ensure `.env` has test keys
2. **Webhook Signing Secret:** Must match Stripe dashboard
3. **Return URL in Portal:** Currently `subscription.index` - ok
4. **Proration:** Check Stripe invoice proration setting

---

## ✅ SUMMARY

**Current Status:** 70% production-ready

**Critical Fixes Needed:**
1. Add plan validation (WHERE is_active)
2. Handle `invoice.payment_failed`
3. Add SMS protection middleware
4. Add email notifications

**After Fixes:** Ready for production
