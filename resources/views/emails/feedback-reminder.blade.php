<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
            background: #fafafa;
        }
        .content p {
            margin: 0 0 15px 0;
            font-size: 15px;
            line-height: 1.6;
        }
        .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #92400e;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white !important;
            padding: 14px 40px;
            text-decoration: none !important;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .cta-button:hover {
            transform: scale(1.02);
            text-decoration: none !important;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            background: #f5f5f5;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
        }
        .reminder-badge {
            display: inline-block;
            background: #f59e0b;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            @if($companyLogo)
                <div style="margin-bottom: 15px;">
                    <img src="{{ $companyLogo }}" alt="{{ $companyName }}" style="max-height: 60px;">
                </div>
            @endif
            <h1>⏰ Rappel</h1>
            <p>Nous attendons votre avis</p>
        </div>
        
        <div class="content">
            <div style="text-align: center;">
                <span class="reminder-badge">Rappel #{{ $reminderNumber }}</span>
            </div>

            <p>Bonjour <strong>{{ $customerName }}</strong>,</p>
            
            <div class="alert-box">
                <p style="margin: 0;">Nous n'avons pas encore reçu votre avis concernant votre expérience avec <strong>{{ $companyName }}</strong>.</p>
            </div>

            <p>Votre feedback est très important pour nous et nous aide à continuer à améliorer nos services. Cela ne vous prendra que <strong>30 secondes</strong>!</p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ $feedbackLink }}" class="cta-button">✍️ Partager mon avis maintenant</a>
            </p>
            
            <p style="font-size: 13px; color: #666; text-align: center;">
                Ou copiez ce lien :<br>
                <code style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px; font-size: 11px; word-break: break-all;">{{ $feedbackLink }}</code>
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 13px; color: #666;">
                Merci pour votre temps,<br>
                <strong>L'équipe {{ $companyName }}</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $companyName }}. Tous droits réservés.</p>
            <p style="margin-top: 10px;">Cet email est un rappel de votre demande de feedback précédente.</p>
        </div>
    </div>
</body>
</html>
