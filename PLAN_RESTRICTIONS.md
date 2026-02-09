# 🔐 Système de Restrictions par Plan

## Vue d'ensemble

Ce système professionnel contrôle l'accès aux fonctionnalités premium (IA, Radar, SMS) en fonction du plan d'abonnement de l'utilisateur. Il comprend :

1. **Middlewares backend** : Bloquent les requêtes non autorisées
2. **Protection frontend** : Affiche des badges "Upgrade Required"
3. **Alertes crédits** : Notification automatique quand les crédits sont bas
4. **Tests complets** : Validation du comportement

---

## 📋 Composants

### 1. Middlewares Backend

#### `CheckPlanFeature`
**Emplacement** : `app/Http/Middleware/CheckPlanFeature.php`

**Fonction** : Vérifie si le plan de l'utilisateur possède une feature spécifique.

**Utilisation dans routes** :
```php
Route::post('/feedback/{id}/replies/ai/*')
    ->middleware('plan.feature:ai_reply_generation');

Route::get('/radar-ia')
    ->middleware('plan.feature:radar_ai');
```

**Features disponibles** :
- `ai_reply_generation` : Génération IA de réponses (BASIC, PRO)
- `radar_ai` : Accès au Radar IA (PRO uniquement)
- `auto_reply` : Réponses automatiques (PRO uniquement)
- `multi_language` : Support multilingue (BASIC, PRO)
- `intelligent_summary` : Résumé intelligent (PRO uniquement)

**Comportement** :
- ✅ Feature disponible → Requête autorisée
- ❌ Feature manquante → Redirect vers `/subscription` avec message d'erreur

---

#### `CheckCredits`
**Emplacement** : `app/Http/Middleware/CheckCredits.php`

**Fonction** : Vérifie que l'utilisateur a suffisamment de crédits pour envoyer des SMS.

**Utilisation dans routes** :
```php
Route::post('/feedback-requests')
    ->middleware('plan.credits:1');
```

**Paramètres** :
- `$minCredits` : Nombre minimum de crédits requis (défaut: 1)

**Comportement** :
- 🔄 **Auto-reset mensuel** : Réinitialise automatiquement les crédits si le mois a changé
- ✅ Crédits suffisants → Requête autorisée
- ❌ Crédits insuffisants → Redirect vers `/subscription` avec message d'erreur détaillé

**Messages d'erreur** :
```
Crédits insuffisants. Vous avez X.XX unités disponibles.
Veuillez acheter des add-ons ou upgrader votre plan.
```

---

#### `CheckPlanLimits`
**Emplacement** : `app/Http/Middleware/CheckPlanLimits.php`

**Fonction** : Vérifie que l'utilisateur n'a pas dépassé les limites de son plan.

**Utilisation dans routes** :
```php
Route::post('/feedback-requests')
    ->middleware('plan.limits:feedbacks');
```

**Limites disponibles** :
- `restaurants` : Nombre maximum de restaurants
- `users` : Nombre maximum d'utilisateurs
- `feedbacks` : Nombre maximum de feedbacks par mois

**Limites par plan** :
| Plan  | Restaurants | Users | Feedbacks/mois |
|-------|-------------|-------|----------------|
| FREE  | 1           | 1     | 20             |
| BASIC | 3           | 5     | 200            |
| PRO   | 10          | 20    | 400            |

**Comportement** :
- ✅ Limite respectée → Requête autorisée
- ❌ Limite atteinte → Redirect vers `/subscription` avec message d'erreur

---

### 2. Protection Frontend

#### `FeatureLock.jsx`
**Emplacement** : `resources/js/Components/FeatureLock.jsx`

**Composant Wrapper** :
```jsx
<FeatureLock feature="ai_reply_generation">
    <button>Générer avec IA</button>
</FeatureLock>
```

**Comportement** :
- ✅ Feature disponible → Affiche le contenu normalement
- ❌ Feature manquante → Affiche un overlay avec bouton "Upgrade Required"

**Hooks utilitaires** :
```jsx
// Vérifier si une feature est disponible
const hasAI = useHasFeature('ai_reply_generation');

// Vérifier si l'utilisateur a des crédits
const hasCredits = useHasCredits(10); // minimum 10 crédits
```

**Exemple d'utilisation (Reply.jsx)** :
```jsx
const hasAI = useHasFeature('ai_reply_generation');

<button
    disabled={!hasAI}
    className={hasAI ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}
>
    {hasAI ? 'Générer avec IA' : '🔒 Upgrade requis (BASIC+)'}
</button>
```

---

#### `LowCreditsAlert.jsx`
**Emplacement** : `resources/js/Components/LowCreditsAlert.jsx`

**Fonction** : Affiche une notification persistante quand les crédits sont bas (<20% du quota).

**Placement** : Automatiquement inclus dans `AuthenticatedLayout.jsx`

**Seuils d'alerte** :
- 🟠 **< 20% des crédits** : Alerte orange "Crédits faibles"
- 🔴 **0 crédit** : Alerte rouge "Crédits épuisés"

**Actions disponibles** :
- "Acheter add-ons" → `/subscription`
- "Upgrader" (si FREE) → `/subscription`

**Visuel** :
- Position : Coin inférieur droit (fixed)
- Style : Card moderne avec gradient et backdrop blur
- Animation : Apparition fluide

---

### 3. Partage des Données Inertia

#### `HandleInertiaRequests.php`
**Emplacement** : `app/Http/Middleware/HandleInertiaRequests.php`

**Données partagées globalement** :
```php
'subscription' => [
    'plan' => [
        'id' => 2,
        'name' => 'BASIC',
        'slug' => 'basic',
    ],
    'features' => [
        'ai_reply_generation' => 1,
        'radar_ai' => 0,
        'multi_language' => 1,
        // ...
    ],
    'credits' => [
        'credits_total_available' => 150.00,
        'credits_available_monthly' => 100.00,
        'credits_addon_balance' => 50.00,
    ],
],
```

**Accès depuis n'importe quel composant React** :
```jsx
const { subscription } = usePage().props;
const hasRadar = subscription?.features?.radar_ai === 1;
const credits = subscription?.credits?.credits_total_available || 0;
```

---

## 🧪 Tests

### `PlanMiddlewareTest.php`
**Emplacement** : `tests/Feature/PlanMiddlewareTest.php`

**Tests couverts** :
1. ✅ `free_plan_cannot_access_ai_features` : FREE bloqué sur IA
2. ✅ `basic_plan_can_access_ai_but_not_radar` : BASIC autorisé IA, bloqué Radar
3. ✅ `pro_plan_can_access_all_features` : PRO autorisé partout
4. ✅ `user_without_credits_cannot_send_feedback` : 0 crédit bloque l'envoi SMS

**Exécuter les tests** :
```bash
php artisan test --filter=PlanMiddlewareTest
```

**Résultat attendu** :
```
✓ free plan cannot access ai features
✓ basic plan can access ai but not radar
✓ pro plan can access all features
✓ user without credits cannot send feedback

Tests: 4 passed (11 assertions)
```

---

## 🔄 Flux Utilisateur

### Scénario 1 : Utilisateur FREE tente d'accéder au Radar IA

1. **Frontend** : Bouton "Radar IA" visible dans le menu
2. **Clic** : Requête GET `/radar-ia`
3. **Middleware `plan.feature:radar_ai`** :
   - Vérifie : `$subscription->hasFeature('radar_ai')`
   - Résultat : `false` (FREE n'a pas radar_ai)
4. **Redirect** : `/subscription` avec message :
   ```
   La fonctionnalité "Radar IA" n'est pas disponible dans votre plan FREE.
   Veuillez upgrader votre abonnement.
   ```
5. **Page Abonnement** : Utilisateur voit les plans BASIC et PRO avec radar_ai activé

---

### Scénario 2 : Utilisateur BASIC sans crédits tente d'envoyer un SMS

1. **Frontend** : Formulaire "Envoyer demande feedback"
2. **Soumission** : POST `/feedback-requests`
3. **Middleware `plan.credits:1`** :
   - Vérifie : `$credits->credits_total_available >= 1`
   - Résultat : `0.00 < 1` → Insuffisant
4. **Redirect** : `/subscription` avec message :
   ```
   Crédits insuffisants. Vous avez 0.00 unités disponibles.
   Veuillez acheter des add-ons ou upgrader votre plan.
   ```
5. **Page Abonnement** : Section "Add-ons" affichée pour acheter des crédits

---

### Scénario 3 : Alerte crédits bas

1. **Utilisateur connecté** : Quota BASIC = 200 unités
2. **Consommation** : 185 unités utilisées → Reste 15 unités (7.5%)
3. **LowCreditsAlert** :
   - Vérifie : `(15 / 200) * 100 = 7.5% < 20%`
   - **Affichage automatique** : Notification orange en bas à droite
4. **Message** :
   ```
   ⚡ Crédits faibles
   Il vous reste seulement 15.00 unités. Pensez à recharger !
   [Acheter add-ons] [Upgrader]
   ```

---

## 📊 Comparaison Plans

| Feature                     | FREE | BASIC | PRO |
|-----------------------------|------|-------|-----|
| Crédits mensuels            | 20   | 200   | 400 |
| IA réponses                 | ❌   | ✅    | ✅  |
| Radar IA                    | ❌   | ❌    | ✅  |
| Réponses auto               | ❌   | ❌    | ✅  |
| Support multilingue         | ❌   | ✅    | ✅  |
| Résumé intelligent          | ❌   | ❌    | ✅  |
| Max restaurants             | 1    | 3     | 10  |
| Max utilisateurs            | 1    | 5     | 20  |
| Max feedbacks/mois          | 20   | 200   | 400 |

---

## 🛠️ Configuration

### Enregistrement des Middlewares
**Fichier** : `bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'plan.feature' => \App\Http\Middleware\CheckPlanFeature::class,
        'plan.credits' => \App\Http\Middleware\CheckCredits::class,
        'plan.limits' => \App\Http\Middleware\CheckPlanLimits::class,
    ]);
})
```

---

### Routes Protégées
**Fichier** : `routes/web.php`

```php
// AI Features - BASIC+
Route::post('/feedback/{id}/replies/ai', [...])
    ->middleware('plan.feature:ai_reply_generation');

// Radar IA - PRO only
Route::get('/radar-ia', [...])
    ->middleware('plan.feature:radar_ai');

// Feedback Requests - Crédits + Limites
Route::post('/feedback-requests', [...])
    ->middleware(['plan.credits:1', 'plan.limits:feedbacks']);
```

---

## 🐛 Debugging

### Problème : Middleware ne bloque pas correctement

**Vérifier la relation `subscription()`** :
```php
// Company.php
public function subscription() {
    return $this->hasOne(Subscription::class)->latestOfMany();
}
```

**Vérifier les features du plan** :
```bash
php artisan tinker
>>> $user = User::find(1);
>>> $sub = $user->company->subscription;
>>> $sub->plan->features
=> [
     "ai_reply_generation" => 1,
     "radar_ai" => 0,
     ...
   ]
```

---

### Problème : Frontend affiche toujours "Upgrade Required"

**Vérifier les props Inertia** :
```jsx
// Dans n'importe quel composant
const { subscription } = usePage().props;
console.log('Features:', subscription?.features);
console.log('Has AI:', subscription?.features?.ai_reply_generation);
```

**Vérifier HandleInertiaRequests.php** :
```php
// Doit partager 'subscription'
'subscription' => [
    'plan' => $subscription?->plan->only(['id', 'name', 'slug']),
    'features' => $subscription?->plan->features ?? [],
    ...
],
```

---

## 🚀 Prochaines Étapes

### Fonctionnalités à implémenter

1. **Notifications par Email** :
   - Alerte à 20% des crédits restants
   - Alerte à 0 crédit
   - Confirmation upgrade

2. **Admin Panel** :
   - Gestion manuelle des subscriptions
   - Ajustement manuel des crédits
   - Logs des changements de plan

3. **Analytics** :
   - Tracking consommation crédits
   - Taux de conversion FREE → BASIC
   - Features les plus utilisées

4. **Optimisations** :
   - Cache des features (éviter requêtes DB)
   - Webhook retry strategy
   - Rate limiting par plan

---

## 📖 Références

- [Laravel Middleware](https://laravel.com/docs/11.x/middleware)
- [Inertia Shared Data](https://inertiajs.com/shared-data)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Tests Feature Laravel](https://laravel.com/docs/11.x/testing)

---

**Créé le** : 7 février 2026  
**Version** : 1.0  
**Auteur** : GitHub Copilot  
**Projet** : Resto Feedback - SaaS
