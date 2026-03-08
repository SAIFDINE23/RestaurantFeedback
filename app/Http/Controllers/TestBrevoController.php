<?php

namespace App\Http\Controllers;

use App\Services\BrevoService;
use Illuminate\Http\Request;

class TestBrevoController extends Controller
{
    protected $brevoService;

    public function __construct(BrevoService $brevoService)
    {
        $this->brevoService = $brevoService;
    }

    /**
     * Tester l'envoi d'email via Brevo
     */
    public function testEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        $to = [
            'email' => $request->input('email'),
            'name' => $request->input('name'),
        ];

        $subject = $request->input('subject');
        $message = $request->input('message');

        // Créer un HTML simple
        $htmlContent = view('emails.test', [
            'name' => $to['name'],
            'message' => $message,
        ])->render();

        $success = $this->brevoService->sendEmail($to, $subject, $htmlContent);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Email envoyé avec succès!' : 'Erreur lors de l\'envoi de l\'email',
        ]);
    }

    /**
     * Tester l'envoi d'SMS via Brevo
     */
    public function testSMS(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string|max:160',
        ]);

        $phoneNumber = $request->input('phone');
        $message = $request->input('message');

        $success = $this->brevoService->sendSMS($phoneNumber, $message);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'SMS envoyé avec succès!' : 'Erreur lors de l\'envoi du SMS',
        ]);
    }

    /**
     * Vérifier la configuration Brevo
     */
    public function checkConfiguration()
    {
        $config = $this->brevoService->checkConfiguration();

        return response()->json([
            'configured' => $config['api_key_set'] && $config['sms_sender_set'],
            'details' => $config,
        ]);
    }
}
