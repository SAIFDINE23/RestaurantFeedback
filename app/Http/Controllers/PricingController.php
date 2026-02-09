<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function index()
    {
        // Récupérer les 3 plans actifs triés par ordre
        $plans = Plan::active()
            ->orderBy('sort_order')
            ->get();

        return view('pricing', compact('plans'));
    }
}
