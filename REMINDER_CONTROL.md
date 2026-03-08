# 📊 Contrôle des Reminders - Diagramme Complet

## Vue d'ensemble des 2 modes

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SYSTÈME DE REMINDERS                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│   MODE 1: MANUEL         │         │  MODE 2: AUTOMATIQUE     │
│   (Utilisateur décide)   │         │  (Cron/Scheduler)        │
├──────────────────────────┤         ├──────────────────────────┤
│                          │         │                          │
│ 1. Admin ouvre page      │         │ 1. Cron job déclenché    │
│    feedbacks             │         │    (chaque jour 09:00)   │
│                          │         │                          │
│ 2. Voit feedbackRequest  │         │ 2. Lance commande:       │
│    non répondu           │         │    reminders:send        │
│                          │         │                          │
│ 3. Clique "Envoyer       │         │ 3. Récupère tous les     │
│    rappel"               │         │    feedbacks non répondus │
│                          │         │                          │
│ 4. POST /feedback-       │         │ 4. Pour chacun:          │
│    request/{id}/remind   │         │    - Vérifie conditions  │
│                          │         │    - Envoie reminder     │
│ 5. ReminderService       │         │    - Update counts       │
│    envoyé immédiatement  │         │                          │
│                          │         │ 5. Affiche statistiques  │
│ ✅ Succès/Erreur affiché │         │    (sent, failed)        │
│                          │         │                          │
└──────────────────────────┘         └──────────────────────────┘
        ↓                                      ↓
    Email/SMS                            Email/SMS
    au client                            au client
```

## Timeline d'un Reminder

```
Day 1:
┌─────────────────────────────────────────────────────────┐
│ Admin envoie FeedbackRequest                            │
│ → status: 'sent'                                        │
│ → reminder_count: 0                                     │
│ → sent_at: 2026-02-24 10:00                             │
└─────────────────────────────────────────────────────────┘
                     ↓
            Client ne répond pas

Day 2 - Mode MANUEL:
┌─────────────────────────────────────────────────────────┐
│ Admin clique "Envoyer rappel"                           │
│ → Appelle ReminderService::sendReminder()              │
│ → Envoie email/SMS                                      │
│ → reminder_count: 1                                     │
│ → last_reminder_sent_at: 2026-02-25 14:30              │
└─────────────────────────────────────────────────────────┘

Day 3 - Mode AUTOMATIQUE:
┌─────────────────────────────────────────────────────────┐
│ Cron Job déclenché (09:00)                             │
│ $ php artisan reminders:send                           │
│ → ReminderService::sendAllReminders()                  │
│ → Envoie email/SMS pour tous les éligibles             │
│ → reminder_count: 2                                     │
│ → last_reminder_sent_at: 2026-02-26 09:00              │
└─────────────────────────────────────────────────────────┘

Day 4:
┌─────────────────────────────────────────────────────────┐
│ Client ne peut plus recevoir de reminders               │
│ (reminder_count >= 3, max atteint)                     │
└─────────────────────────────────────────────────────────┘
```

## Conditions pour Envoyer un Reminder

```
✅ AVANT d'envoyer, le système vérifie:

1. Status check
   - FeedbackRequest status: 'pending' OU 'sent' ✓
   
2. Feedback check
   - Pas de feedback reçu ✓
   
3. Reminder count check
   - reminder_count < max (défaut: 3) ✓
   
4. Time delay check
   - Si last_reminder_sent_at existe:
     → (now - last_reminder_sent_at) >= 24h ✓
   
5. Customer check
   - Customer existe ✓
   - Email/Phone valide ✓

❌ Si UNE condition échoue → Reminder ne sera PAS envoyé
```

## Code: Comment ça fonctionne

### 1️⃣ MANUEL - Route & Contrôleur

```php
// routes/web.php
Route::post('/feedback-request/{id}/remind', 
    [FeedbackRequestController::class, 'sendReminder'])
    ->name('feedback-request.remind');

// app/Http/Controllers/FeedbackRequestController.php
public function sendReminder(Request $request, int $feedbackRequestId)
{
    $feedbackRequest = FeedbackRequest::findOrFail($feedbackRequestId);
    
    // Vérifications
    $company = Auth::user()->company;
    if ($feedbackRequest->company_id !== $company->id) {
        return back()->withErrors(['error' => 'Unauthorized']);
    }
    
    // Envoyer le reminder
    $reminderService = new ReminderService();
    $success = $reminderService->sendReminder($feedbackRequest);
    
    if ($success) {
        return back()->with('success', 
            'Rappel envoyé via ' . strtoupper($feedbackRequest->channel));
    } else {
        return back()->withErrors(['error' => 'Impossible d\'envoyer le rappel...']);
    }
}
```

### 2️⃣ AUTOMATIQUE - Scheduler & Commande

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Tous les jours à 09:00
    $schedule->command('reminders:send')
        ->dailyAt('09:00')
        ->name('send-feedback-reminders');
}

// app/Console/Commands/SendFeedbackReminders.php
public function handle()
{
    $reminderService = new ReminderService();
    $stats = $reminderService->sendAllReminders(maxReminders: 3);
    
    $this->info('✅ Reminders envoyés: ' . $stats['sent']);
    $this->warn('❌ Reminders échoués: ' . $stats['failed']);
    
    return $stats['failed'] > 0 ? 1 : 0;
}
```

### 3️⃣ SERVICE - La logique commune

```php
// app/Services/ReminderService.php
public function sendReminder(FeedbackRequest $feedbackRequest): bool
{
    // ✅ Validations
    if (!in_array($feedbackRequest->status, ['pending', 'sent'])) {
        return false; // Status invalide
    }
    
    if ($feedbackRequest->feedback()->exists()) {
        return false; // Feedback déjà reçu
    }
    
    if ($feedbackRequest->reminder_count >= 3) {
        return false; // Max reminders atteint
    }
    
    if ($feedbackRequest->last_reminder_sent_at) {
        $hours = now()->diffInHours($feedbackRequest->last_reminder_sent_at);
        if ($hours < 24) {
            return false; // Trop rapide
        }
    }
    
    // 📧 Envoi
    $success = false;
    if ($feedbackRequest->channel === 'email') {
        $success = $this->sendEmailReminder($feedbackRequest);
    } elseif ($feedbackRequest->channel === 'sms') {
        $success = $this->sendSmsReminder($feedbackRequest);
    }
    
    // 💾 Update si succès
    if ($success) {
        $feedbackRequest->update([
            'reminder_count' => $feedbackRequest->reminder_count + 1,
            'last_reminder_sent_at' => now(),
            'first_reminder_sent_at' => $feedbackRequest->first_reminder_sent_at ?? now(),
        ]);
    }
    
    return $success;
}
```

## Cas d'usage: Scénarios réels

### Scénario 1: Boutique avec Mode Manuel

```
Lundi 10:00 → Admin envoie demande feedback à 50 clients
              (email/sms)

Mercredi → Admin regarde tableau de bord, voit:
           - 30 ont répondu ✅
           - 20 n'ont pas répondu ⏳
           
           Admin clique "Envoyer rappel" sur chaque feedbackRequest
           → 20 reminders envoyés (1 par 1)
           → reminder_count: 1 pour chacun

Vendredi → Cron automatique (09:00)
           → Envoie reminders pour tous les >24h sans réponse
           → 15 reçoivent 2e reminder
           → reminder_count: 2
           
Semaine suivante → Admin peut envoyer 3e reminder (max)
```

### Scénario 2: Restaurant avec Mode Automatique

```
Configuration: php artisan reminders:send → 09:00 chaque jour

Jour 1: Client reçoit demande feedback (email)

Jour 2: Cron 09:00 → Envoie reminder #1 (email)
        reminder_count: 1
        
Jour 3: Cron 09:00 → Envoie reminder #2 (email)
        reminder_count: 2
        
Jour 4: Cron 09:00 → Envoie reminder #3 (email)
        reminder_count: 3
        
Jour 5+: Cron 09:00 → Aucun reminder (limite atteinte)
         "Max reminders reached"
```

## Configuration Options

### Changer la fréquence du Cron

```php
// app/Console/Kernel.php

// Option 1: Tous les jours à 09:00
$schedule->command('reminders:send')->dailyAt('09:00');

// Option 2: Deux fois par jour
$schedule->command('reminders:send')->dailyAt('09:00');
$schedule->command('reminders:send')->dailyAt('14:00');

// Option 3: Toutes les 2 heures
$schedule->command('reminders:send')->everyTwoHours();

// Option 4: Chaque heure
$schedule->command('reminders:send')->hourly();

// Option 5: Chaque lundi à 09:00
$schedule->command('reminders:send')->weeklyOn(1, '09:00');
```

### Changer le max de reminders

```php
// Dans le contrôleur
$reminderService->sendReminder($feedbackRequest, maxReminders: 5);

// Ou dans la commande
$stats = $reminderService->sendAllReminders(maxReminders: 5);
```

### Changer le délai minimum

Édite dans ReminderService.php (ligne ~64):
```php
if ($hoursSinceLastReminder < 24) { // ← Changer 24 en 12, 48, etc
    return false;
}
```

## 📝 Résumé

| Aspect | MANUEL | AUTOMATIQUE |
|--------|--------|-----------|
| **Déclencheur** | Clic utilisateur | Cron Job |
| **Fréquence** | À la demande | Programmée |
| **Contrôle** | Admin décide | Automatique |
| **Route** | POST /feedback-request/{id}/remind | N/A |
| **Commande** | N/A | php artisan reminders:send |
| **Idéal pour** | Petits volumes | Volumes élevés |
| **Cas d'usage** | 1-2 reminders ponctuels | Rappels réguliers |

## ✅ Implémenté

✅ Mode MANUEL: Routes + Contrôleur + Service
✅ Mode AUTOMATIQUE: Scheduler + Commande + Service  
✅ Validations communes
✅ Logging complet
✅ Tests réussis

## 🚀 Activation

### Pour Mode MANUEL uniquement
Aucune config supplémentaire. Les routes sont prêtes.

### Pour Mode AUTOMATIQUE
```bash
# Ajouter à crontab:
* * * * * cd /home/saif/projects/Resto_Feedback/FeedBackProject && php artisan schedule:run >> /dev/null 2>&1
```

Cron exécutera `schedule:run` chaque minute, qui lancera `reminders:send` à 09:00 chaque jour.
