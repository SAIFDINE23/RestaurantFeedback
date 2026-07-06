<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur Feedora</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f0f2f8;
            color: #1e293b;
            line-height: 1.6;
        }
        .wrapper { max-width: 620px; margin: 32px auto; padding: 0 16px; }
        .card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .hero {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #ec4899 100%);
            padding: 48px 40px 40px;
            text-align: center;
        }
        .hero-logo {
            font-size: 28px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: -1px;
            margin-bottom: 16px;
        }
        .hero-logo span { color: #fde68a; }
        .hero h1 {
            font-size: 26px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 10px;
        }
        .hero p {
            font-size: 15px;
            color: rgba(255,255,255,0.85);
        }
        .emoji-icon {
            font-size: 52px;
            margin-bottom: 20px;
            display: block;
        }
        .content { padding: 40px; }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
        }
        .intro {
            font-size: 15px;
            color: #475569;
            margin-bottom: 28px;
        }
        .steps-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 16px;
        }
        .steps { list-style: none; margin-bottom: 36px; }
        .steps li {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .steps li:last-child { border-bottom: none; }
        .step-num {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .step-text strong { font-size: 14px; color: #1e293b; display: block; }
        .step-text span { font-size: 13px; color: #64748b; }
        .cta-block { text-align: center; margin: 36px 0 28px; }
        .cta-btn {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: #ffffff !important;
            text-decoration: none;
            font-size: 16px;
            font-weight: 700;
            padding: 16px 40px;
            border-radius: 50px;
            letter-spacing: 0.3px;
        }
        .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 28px 0;
        }
        .footer-note {
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
        }
        .footer-note a { color: #4f46e5; text-decoration: none; }
        .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 24px 40px;
            text-align: center;
        }
        .footer p { font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="card">

        <!-- Hero -->
        <div class="hero">
            <span class="emoji-icon">🎉</span>
            <div class="hero-logo">Feed<span>ora</span></div>
            <h1>Bienvenue, {{ $userName }} !</h1>
            <p>Votre compte <strong>{{ $companyName }}</strong> est prêt.</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting">Félicitations pour votre inscription !</p>
            <p class="intro">
                Feedora va vous aider à collecter des avis clients, booster votre réputation en ligne
                et transformer les retours négatifs en opportunités d'amélioration. Tout ça en quelques minutes.
            </p>

            <p class="steps-title">Vos 4 premières étapes</p>
            <ul class="steps">
                <li>
                    <div class="step-num">1</div>
                    <div class="step-text">
                        <strong>Votre secteur</strong>
                        <span>Choisissez le type d'activité pour personnaliser l'expérience.</span>
                    </div>
                </li>
                <li>
                    <div class="step-num">2</div>
                    <div class="step-text">
                        <strong>Votre lien Google</strong>
                        <span>Ajoutez votre fiche Google Business pour recevoir plus d'avis 5 étoiles.</span>
                    </div>
                </li>
                <li>
                    <div class="step-num">3</div>
                    <div class="step-text">
                        <strong>Premier client</strong>
                        <span>Importez ou saisissez votre premier contact en 30 secondes.</span>
                    </div>
                </li>
                <li>
                    <div class="step-num">4</div>
                    <div class="step-text">
                        <strong>C'est parti !</strong>
                        <span>Découvrez votre tableau de bord et envoyez votre premier feedback.</span>
                    </div>
                </li>
            </ul>

            <div class="cta-block">
                <a href="{{ $onboardingUrl }}" class="cta-btn">🚀 Configurer mon compte maintenant</a>
            </div>

            <hr class="divider">

            <p class="footer-note">
                Vous pouvez aussi accéder directement à votre
                <a href="{{ $dashboardUrl }}">tableau de bord</a> et revenir à la configuration plus tard.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© {{ date('Y') }} Feedora – Tous droits réservés</p>
            <p style="margin-top:6px;">Vous recevez cet email car vous venez de créer un compte Feedora.</p>
        </div>

    </div>
</div>
</body>
</html>
