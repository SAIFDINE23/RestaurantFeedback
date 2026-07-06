# 🧪 Plan de Tests Locaux - Déboggage Production

## Problèmes Identifiés
1. ❌ Emails ne sont pas envoyés (FeedbackRequest)
2. ❌ Erreur 505 lors de la page 2FA admin

## 📋 Checklist de Tests

### 1️⃣ Configuration Email (PRIORITÉ)

**Vérifier .env local:**
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votreapp.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Test email simple:**
```bash
php artisan tinker
Mail::raw('Test email', function($msg) { 
    $msg->to('votre_email@gmail.com')->subject('Test'); 
});
```

### 2️⃣ Test 2FA Admin

**Reproduire l'erreur:**
1. Se connecter avec `saifdineelkhantache@gmail.com`
2. Observer si erreur 505 ou 500
3. Vérifier les logs: `tail -f storage/logs/laravel.log`

**Points de vérification:**
- [ ] Vue `Admin/Admin2FA.jsx` compilée ?
- [ ] Route `admin.2fa.show` accessible ?
- [ ] Email 2FA envoyé ?
- [ ] Cache disponible (Redis ou file) ?

### 3️⃣ Test FeedbackRequest Email

**Scénario:**
1. Créer un customer
2. Envoyer feedback request
3. Vérifier email reçu
4. Vérifier logs d'erreur

---

## 🔧 Corrections Potentielles

### Problème Email
- Configuration MAIL en production (Render)
- Job queue non démarré ?
- Vérifier SendFeedbackRequestEmail.php

### Problème 2FA
- Vue Inertia non buildée
- Erreur dans le controller
- Cache non configuré en prod
