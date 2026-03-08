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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .company-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .company-logo {
            text-align: center;
            margin-bottom: 15px;
        }
        .company-logo img {
            max-height: 80px;
            max-width: 100%;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .rating-preview {
            text-align: center;
            font-size: 28px;
            margin: 15px 0;
            letter-spacing: 10px;
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
            <h1>📝 {{ $companyName }}</h1>
            <p>Donnez votre avis en 30 secondes</p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>{{ $customerName }}</strong>,</p>
            
            <p>Merci de votre confiance ! Nous aimerions connaître votre avis sur votre expérience récente avec <strong>{{ $companyName }}</strong>.</p>
            
            <p>Vos commentaires nous aident à améliorer nos services et à mieux vous servir.</p>

            <div class="company-info">
                <p style="margin-top: 0; text-align: center;">
                    <strong>Évaluez votre expérience</strong>
                </p>
                <div class="rating-preview">⭐ ⭐ ⭐ ⭐ ⭐</div>
                <p style="text-align: center; color: #666; font-size: 13px;">
                    Notez de 1 à 5 étoiles et laissez vos commentaires
                </p>
            </div>

            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ $feedbackLink }}" class="cta-button">Donner mon avis maintenant</a>
            </p>
            
            <p style="font-size: 13px; color: #999; text-align: center;">
                ou copiez ce lien : <br>
                <code style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px; font-size: 11px; word-break: break-all;">{{ $feedbackLink }}</code>
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <p style="font-size: 13px; color: #666;">
                Cordialement,<br>
                <strong>L'équipe {{ $companyName }}</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $companyName }}. Tous droits réservés.</p>
            <p style="margin-top: 10px;">Cet email vous a été envoyé car vous êtes un client de {{ $companyName }}.</p>
        </div>
    </div>
</body>
</html>
        <div class="header">
            <img src="{{ asset('images/logo_Luminea.png') }}" alt="Luminea">
            <h1 style="margin: 0; font-size: 24px;">Demande de Feedback</h1>
        </div>
        
        <div class="content">
            <h2>Bonjour {{ $customer }},</h2>
            
            <p>Nous espérons que vous appréciez votre expérience avec <span class="company-name">{{ $company }}</span>.</p>
            
            <p>Votre avis nous est précieux et nous aide à améliorer continuellement nos services. Pourriez-vous prendre quelques minutes pour partager votre feedback?</p>
            
            <div style="text-align: center;">
                <a href="{{ $link }}" class="cta-button">👉 Partager votre avis</a>
            </div>
            
            <p>Merci beaucoup pour votre temps et vos commentaires précieux! 🙏</p>
            
            <p>Cordialement,<br><strong>L'équipe {{ config('app.name') }}</strong></p>
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} {{ config('app.name') }} - Tous droits réservés</p>
            <p>Vous recevez cet email car vous êtes client de {{ $company }}</p>
        </div>
    </div>
</body>
</html>
