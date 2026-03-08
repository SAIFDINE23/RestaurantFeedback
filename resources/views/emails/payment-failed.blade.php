<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Échec de paiement</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; color: #374151; line-height: 1.6; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .alert-box p { margin: 0; color: #991b1b; }
        .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        .btn:hover { background: #b91c1c; }
        .footer { padding: 20px 30px; background: #f9fafb; color: #6b7280; font-size: 13px; text-align: center; border-top: 1px solid #e5e7eb; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .info-label { color: #6b7280; font-size: 14px; }
        .info-value { color: #111827; font-weight: 600; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Échec de paiement</h1>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>{{ $user->name }}</strong>,</p>

            <div class="alert-box">
                <p><strong>Le paiement de votre abonnement Feedora a échoué.</strong></p>
            </div>

            <p>Nous n'avons pas pu prélever le montant de votre abonnement pour l'entreprise <strong>{{ $company->name }}</strong>.</p>

            <div style="margin: 20px 0;">
                <div class="info-row">
                    <span class="info-label">Plan</span>
                    <span class="info-value">{{ $subscription->plan->name ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Montant</span>
                    <span class="info-value">{{ $subscription->plan->price ?? '0' }}€/mois</span>
                </div>
            </div>

            <p><strong>Que faire ?</strong></p>
            <ul>
                <li>Vérifiez que votre carte bancaire est toujours valide</li>
                <li>Assurez-vous que votre compte dispose de fonds suffisants</li>
                <li>Mettez à jour votre méthode de paiement via le portail Stripe</li>
            </ul>

            <p>
                <a href="{{ route('subscription.portal') }}" class="btn">
                    Mettre à jour le paiement →
                </a>
            </p>

            <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
                ⏰ <strong>Important :</strong> Si le paiement n'est pas régularisé dans les 14 jours, 
                votre abonnement sera automatiquement annulé et vous serez basculé sur le plan gratuit.
            </p>
        </div>

        <div class="footer">
            <p>Cet email a été envoyé automatiquement par Feedora.<br>
            Si vous avez des questions, contactez notre support.</p>
        </div>
    </div>
</body>
</html>
