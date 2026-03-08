<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f6f3;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            padding: 48px 32px;
            text-align: center;
        }
        .header .emoji-top {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 15px;
            opacity: 0.85;
        }
        .content {
            padding: 40px 36px;
        }
        .content p {
            margin: 0 0 16px 0;
            font-size: 15px;
            line-height: 1.7;
            color: #444;
        }
        .greeting {
            font-size: 17px;
            color: #1a1a2e;
        }
        .highlight-box {
            background: linear-gradient(135deg, #fff9f0 0%, #fff5eb 100%);
            border: 2px solid #ffd6a0;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            text-align: center;
        }
        .highlight-box .stars {
            font-size: 36px;
            letter-spacing: 8px;
            margin: 12px 0;
            display: block;
        }
        .highlight-box p {
            margin: 0;
            color: #8b6914;
            font-size: 14px;
        }
        .cta-button {
            display: block;
            background: linear-gradient(135deg, #e8590c 0%, #d9480f 100%);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none !important;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            margin: 28px auto;
            text-align: center;
            max-width: 320px;
            box-shadow: 0 4px 16px rgba(232, 89, 12, 0.3);
        }
        .cta-button:hover {
            background: linear-gradient(135deg, #d9480f 0%, #c92a2a 100%);
        }
        .benefits {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin: 20px 0;
            text-align: center;
        }
        .benefit {
            flex: 1;
            padding: 12px;
        }
        .benefit .icon {
            font-size: 28px;
            display: block;
            margin-bottom: 6px;
        }
        .benefit p {
            font-size: 12px;
            color: #888;
            margin: 0;
        }
        .link-alt {
            font-size: 12px;
            color: #999;
            text-align: center;
            margin: 20px 0 0 0;
        }
        .link-alt code {
            background: #f5f5f5;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            word-break: break-all;
            display: inline-block;
            margin-top: 4px;
        }
        .divider {
            border: none;
            border-top: 1px solid #eee;
            margin: 28px 0;
        }
        .signature {
            font-size: 14px;
            color: #666;
        }
        .signature strong {
            color: #333;
        }
        .footer {
            padding: 24px 32px;
            text-align: center;
            font-size: 11px;
            color: #aaa;
            background: #fafafa;
            border-top: 1px solid #f0f0f0;
        }
        .footer p {
            margin: 4px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            @if($companyLogo)
                <div style="margin-bottom: 16px;">
                    <img src="{{ $companyLogo }}" alt="{{ $companyName }}" style="max-height: 60px; border-radius: 8px;">
                </div>
            @else
                <span class="emoji-top">🍽️</span>
            @endif
            <h1>{{ $companyName }}</h1>
            <p>Votre avis nous est précieux ✨</p>
        </div>
        
        <div class="content">
            <p class="greeting">Bonjour <strong>{{ $customerName ?? 'cher client' }}</strong> 👋</p>
            
            <p>
                Merci d'avoir choisi <strong>{{ $companyName }}</strong> ! 🙏<br>
                Nous espérons que votre expérience a été à la hauteur de vos attentes.
            </p>

            <p>
                Votre opinion est <strong>essentielle</strong> pour nous aider à toujours mieux vous servir.
                Pourriez-vous prendre <strong>30 secondes</strong> pour nous donner votre avis ?
            </p>

            <div class="highlight-box">
                <p><strong>Comment était votre expérience ?</strong></p>
                <span class="stars">⭐ ⭐ ⭐ ⭐ ⭐</span>
                <p>Cliquez ci-dessous pour nous le dire</p>
            </div>

            <a href="{{ $feedbackLink }}" class="cta-button">
                🍽️ Donner mon avis
            </a>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                    <td style="text-align: center; padding: 8px;">
                        <span style="font-size: 24px; display: block;">⏱️</span>
                        <span style="font-size: 12px; color: #888;">30 secondes</span>
                    </td>
                    <td style="text-align: center; padding: 8px;">
                        <span style="font-size: 24px; display: block;">🔒</span>
                        <span style="font-size: 12px; color: #888;">100% anonyme</span>
                    </td>
                    <td style="text-align: center; padding: 8px;">
                        <span style="font-size: 24px; display: block;">❤️</span>
                        <span style="font-size: 12px; color: #888;">Aide notre équipe</span>
                    </td>
                </tr>
            </table>

            <p class="link-alt">
                ou copiez ce lien :<br>
                <code>{{ $feedbackLink }}</code>
            </p>

            <hr class="divider">

            <p class="signature">
                Merci infiniment pour votre temps 🙏<br>
                À très bientôt !<br><br>
                <strong>🍽️ L'équipe {{ $companyName }}</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $companyName }} — Tous droits réservés</p>
            <p>Cet email vous a été envoyé suite à votre visite chez {{ $companyName }}.</p>
        </div>
    </div>
</body>
</html>
