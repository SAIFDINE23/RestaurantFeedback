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
        .message-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: scale(1.05);
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
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>✨ {{ config('app.name') }}</h1>
            <p>Votre avis nous importe</p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>{{ $name }}</strong>,</p>
            
            <div class="message-box">
                <p>{{ $message }}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="#" class="cta-button">Lire plus</a>
            </p>
            
            <p style="font-size: 13px; color: #666;">
                Cordialement,<br>
                L'équipe {{ config('app.name') }}
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tous droits réservés.</p>
            <p style="margin-top: 10px;">Vous avez des questions ? <a href="#" style="color: #667eea; text-decoration: none;">Contactez-nous</a></p>
        </div>
    </div>
</body>
</html>
