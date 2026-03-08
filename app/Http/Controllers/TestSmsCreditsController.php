<?php

namespace App\Http\Controllers;

use App\Services\BrevoService;
use Illuminate\Http\Request;

class TestSmsCreditsController extends Controller
{
    public function checkSmsCredits(Request $request)
    {
        $brevoService = app(BrevoService::class);
        
        // Test 1: getAccountInfo
        $accountInfo = $brevoService->getAccountInfo();
        
        // Test 2: getSmsCredits
        $smsCredits = $brevoService->getSmsCredits();
        
        // Test 3: getSmsCreditsInfo
        $creditsInfo = $brevoService->getSmsCreditsInfo();
        
        return response()->json([
            'account_info' => $accountInfo,
            'sms_credits' => $smsCredits,
            'credits_info' => $creditsInfo,
            'timestamp' => now(),
        ]);
    }
}
