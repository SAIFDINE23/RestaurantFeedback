<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande d'avis</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, sans-serif; color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6; padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
                    <tr>
                        <td style="background:linear-gradient(90deg,#0f172a,#1e293b); color:#fff; padding:24px;">
                            <div style="font-size:22px; font-weight:700;">🍽️ {{ $companyName }}</div>
                            <div style="opacity:0.85; margin-top:6px; font-size:14px;">Votre avis nous aide à mieux vous servir</div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 24px 16px 24px;">
                            @if(!empty($customerName))
                                <p style="margin:0 0 14px 0; font-size:16px; color:#374151;">Bonjour {{ $customerName }},</p>
                            @endif

                            <div style="font-size:15px; line-height:1.7; color:#1f2937; white-space:pre-line;">{!! nl2br(e($emailBody)) !!}</div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:20px 24px 28px 24px;">
                            <a href="{{ $feedbackLink }}" style="display:inline-block; background:#f97316; color:#fff; text-decoration:none; font-weight:700; padding:14px 22px; border-radius:10px;">⭐ Donner mon avis</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
