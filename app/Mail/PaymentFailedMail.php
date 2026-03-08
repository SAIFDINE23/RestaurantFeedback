<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Company $company;
    public Subscription $subscription;

    public function __construct(User $user, Company $company, Subscription $subscription)
    {
        $this->user = $user;
        $this->company = $company;
        $this->subscription = $subscription;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Feedora — Échec de paiement pour votre abonnement',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-failed',
        );
    }
}
