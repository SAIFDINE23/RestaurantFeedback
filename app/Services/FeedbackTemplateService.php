<?php

namespace App\Services;

use App\Models\Company;

class FeedbackTemplateService
{
    public const TOKENS = [
        '{{customer_name}}',
        '{{company_name}}',
        '{{feedback_link}}',
    ];

    public function defaults(string $companyName = 'votre restaurant'): array
    {
        return [
            'sms_template' => "🍽️ Bonjour {{customer_name}} !\nMerci d'avoir choisi {{company_name}} ❤️\n\nVotre avis compte énormément pour nous !\n👉 {{feedback_link}}\n\n⭐ Cela ne prend que 30 secondes.\nMerci 🙏",
            'email_subject_template' => "🍽️ {{company_name}} — Votre avis compte pour nous !",
            'email_body_template' => "Bonjour {{customer_name}},\n\nMerci d'avoir choisi {{company_name}}.\n\nVotre avis est précieux pour notre équipe.\nPouvez-vous nous donner votre retour en cliquant sur le bouton ci-dessous ?\n\nMerci d'avance 🙏\nL'équipe {{company_name}}",
            'qr_template' => "Scannez ce QR Code pour laisser votre avis en 30 secondes ⭐",
        ];
    }

    public function forCompany(Company $company): array
    {
        $defaults = $this->defaults($company->name ?? 'votre restaurant');

        return [
            'sms_template' => $company->feedback_sms_template ?: $defaults['sms_template'],
            'email_subject_template' => $company->feedback_email_subject_template ?: $defaults['email_subject_template'],
            'email_body_template' => $company->feedback_email_body_template ?: $defaults['email_body_template'],
            'qr_template' => $company->feedback_qr_template ?: $defaults['qr_template'],
            'tokens' => self::TOKENS,
        ];
    }

    public function render(string $template, array $variables): string
    {
        return str_replace(
            array_keys($variables),
            array_values($variables),
            $template
        );
    }
}
