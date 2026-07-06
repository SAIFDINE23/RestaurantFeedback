# Guide de déploiement sur Render

## Variables d'environnement à configurer sur Render

### 1. Variables obligatoires

Dans l'interface Render → Environment, ajoutez ces variables :

```bash
# Application
APP_NAME=Laravel
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-app.onrender.com
APP_KEY=base64:cHBU5+uBWazSt4FoATAKvhe9HkZzwUeaoc5V9LC74AQ=

# Database (Supabase)
DB_CONNECTION=pgsql
DB_HOST=db.ctxpnhiwwzwycouyficj.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SUPABASE
DB_SSLMODE=require

# Alternative: URL de connexion unique
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@db.ctxpnhiwwzwycouyficj.supabase.co:5432/postgres?sslmode=require
```

### 2. Variables optionnelles (services externes)

```bash
# Gemini AI (régénérez une nouvelle clé)
GEMINI_API_KEY=votre_nouvelle_cle_gemini
GEMINI_MODEL=models/gemini-2.5-flash:generateContent

# Twilio SMS (régénérez de nouvelles clés)
TWILIO_SID=votre_nouveau_sid
TWILIO_AUTH_TOKEN=votre_nouveau_token
TWILIO_FROM=+votre_numero

# Queue Processing (IMPORTANT: utiliser SYNC sur Render gratuit)
QUEUE_CONNECTION=sync

# Mail - Solution PRO & FIABLE
# ⭐ RECOMMANDÉ: SendGrid (le standard de l'industrie)
MAIL_MAILER=sendgrid
SENDGRID_API_KEY=SG.votre_cle_complète_ici
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME="Luminea"

# Alternative 1: Mailgun
# MAIL_MAILER=mailgun
# MAILGUN_SECRET=mg_votre_cle
# MAILGUN_DOMAIN=votre-domaine.mailgun.org

# Alternative 2: AWS SES
# MAIL_MAILER=smtp
# MAIL_HOST=email-smtp.eu-west-1.amazonaws.com
# MAIL_PORT=587
# MAIL_USERNAME=votre_username
# MAIL_PASSWORD=votre_password
# MAIL_ENCRYPTION=tls
```

## Étapes de déploiement

1. **Connecter votre dépôt GitHub à Render**
   - Allez sur render.com
   - Créez un nouveau Web Service
   - Connectez votre dépôt GitHub

2. **Configurer le build**
   - Build Command: `docker build -t app .`
   - Start Command: (laissez vide, défini dans le Dockerfile)

3. **Ajouter les variables d'environnement**
   - Copiez-collez les variables ci-dessus dans l'onglet "Environment"
   - ⚠️ Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs

4. **Déployer**
   - Cliquez sur "Manual Deploy" → "Deploy latest commit"
   - Surveillez les logs pour voir si tout fonctionne

## Résolution des problèmes courants

### "could not translate host name postgres"
- ✅ Vérifiez que `DB_HOST` pointe vers votre base Supabase
- ❌ N'utilisez pas `postgres.railway.internal` ou `127.0.0.1`

### "No open ports detected"
- ✅ Render définit automatiquement la variable `PORT`
- ✅ Le script entrypoint.sh adapte automatiquement nginx

### "Unable to set application key"
- ✅ Ajoutez `APP_KEY` dans les variables d'environnement Render
- ✅ Ou laissez le script le générer automatiquement

### Erreurs de connexion base de données
- Vérifiez le mot de passe (pas de caractères spéciaux comme `@`)
- Essayez le port `6543` au lieu de `5432` si nécessaire
- Assurez-vous que `DB_SSLMODE=require` est défini

## Sécurité

⚠️ **IMPORTANT**: Après le déploiement, régénérez ces clés API :
- GEMINI_API_KEY (sur Google AI Studio)
- TWILIO_SID et TWILIO_AUTH_TOKEN (sur Twilio Console)
- APP_KEY (avec `php artisan key:generate`)

Ces clés ont été exposées publiquement et doivent être remplacées.
