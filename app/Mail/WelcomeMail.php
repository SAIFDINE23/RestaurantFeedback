<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $companyName
    ) {}

    public function build()
    {
        return $this
            ->subject('Bienvenue sur Feedora 🎉 – Commençons !')
            ->view('emails.welcome')
            ->with([
                'userName'       => $this->user->name,
                'companyName'    => $this->companyName,
                'onboardingUrl'  => route('onboarding.index', [], true),
                'dashboardUrl'   => route('dashboard', [], true),
            ]);
    }
}
