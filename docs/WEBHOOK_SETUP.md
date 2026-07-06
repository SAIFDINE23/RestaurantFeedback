# Configuration des Webhooks Stripe

## 📋 Instructions de configuration

### 1. Obtenir le Secret du Webhook

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Accédez à **Developers** → **Webhooks**
3. Créez un nouveau webhook ou utilisez un existant
4. URL du webhook: `https://votredomaine.com/webhooks/stripe`
5. Sélectionnez les événements:
   - `invoice.payment_succeeded` (Renouvellement)
   - `customer.subscription.updated` (Mise à jour)
   - `customer.subscription.deleted` (Annulation)
6. Cliquez sur **Reveal** pour afficher le secret du webhook (commence par `whsec_`)

### 2. Ajouter la variable d'environnement

Dans votre fichier `.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Tester le webhook (développement)

Utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) pour tester localement:

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Authentifier
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:8000/webhooks/stripe

# Dans un autre terminal, déclencher un test
stripe trigger invoice.payment_succeeded
```

## 🔄 Événements gérés

### 1. `invoice.payment_succeeded`
- **Déclencheur:** Paiement réussi d'une facture
- **Action:** Met à jour `ends_at` avec la date de fin de la période
- **Cas d'usage:** Renouvellement automatique de l'abonnement

### 2. `customer.subscription.updated`
- **Déclencheur:** Modification de l'abonnement (changement de plan, etc.)
- **Action:** Synchronise le statut et les dates avec Stripe
- **Cas d'usage:** Upgrades/downgrades de plan

### 3. `customer.subscription.deleted`
- **Déclencheur:** Annulation de l'abonnement
- **Action:** Marque l'abonnement comme `canceled`, met `ends_at` à maintenant
- **Cas d'usage:** Client annule son abonnement

## 📊 Flux complet

```
Paiement Stripe → Événement Webhook → StripeWebhookController
                                           ↓
                            Mise à jour Subscription.ends_at
                            Logs dans storage/logs/laravel.log
```

## 🔒 Sécurité

- Vérification de signature obligatoire (protège contre les webhooks falsifiés)
- Tous les événements sont loggés dans `storage/logs/laravel.log`
- La route est publique mais protégée par la signature Stripe

## 🐛 Dépannage

### Les webhooks ne sont pas reçus

1. Vérifiez `STRIPE_WEBHOOK_SECRET` dans `.env`
2. Vérifiez que l'URL du webhook est correcte dans Stripe Dashboard
3. Vérifiez les logs: `tail -f storage/logs/laravel.log`

### Erreur "Invalid signature"

- Assurez-vous que `STRIPE_WEBHOOK_SECRET` est exact (commencer par `whsec_`)
- Ne confondez pas avec `STRIPE_SECRET`

### Vérifier les logs

```bash
# Afficher les derniers logs
tail -f storage/logs/laravel.log | grep webhook

# Ou chercher les erreurs Stripe
tail -f storage/logs/laravel.log | grep Stripe
```

## ✅ Vérification du fonctionnement

Après un paiement Stripe:

1. Vérifiez que `Subscription.ends_at` est mis à jour
2. Vérifiez les logs pour voir "Subscription renewed"
3. Vérifiez que le badge "Jours restants" affiche 30 jours

## 📝 Données mises à jour

Après `invoice.payment_succeeded`:
- `Subscription.ends_at` → Date de fin de la période de facturation
- `Subscription.status` → `active`

Après `customer.subscription.updated`:
- `Subscription.status` → Nouveau statut Stripe
- `Subscription.ends_at` → Nouvelle date de fin
- `Subscription.trial_ends_at` → (Si applicable)

Après `customer.subscription.deleted`:
- `Subscription.status` → `canceled`
- `Subscription.ends_at` → Maintenant
