<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Http\Controllers\{
    CompanyController,
    DashboardController,
    CustomerController,
    FeedbackController,
    FeedbackDesignController,
    FeedbackRequestController,
    ProfileController,
    FeedbackReplyController,
    TaskController,
    PricingController,
    SubscriptionController,
    StripeController,
    StripeWebhookController
};
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminRadarController;
use App\Http\Middleware\IsAdmin;
use App\Services\SmsService;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    // Récupérer les plans pour l'affichage sur la page d'accueil
    $plans = \App\Models\Plan::active()->orderBy('sort_order')->get()->toArray();
    
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
        'plans'          => $plans,
    ]);
});

// Page Pricing (publique)
Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');

/*
|--------------------------------------------------------------------------
| Webhooks (publique - sans authentification)
|--------------------------------------------------------------------------
*/

Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle'])
    ->name('webhooks.stripe');

/*
|--------------------------------------------------------------------------
| Feedback public (clients)
|--------------------------------------------------------------------------
*/

Route::get('/feedback/{token}', [FeedbackController::class, 'show'])
    ->name('feedback.show');

Route::post('/feedback/{token}', [FeedbackController::class, 'store'])
    ->name('feedback.store');

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Liste de tous les feedbacks
    Route::get('/feedbacks', [FeedbackController::class, 'index'])
        ->name('feedbacks.index');

    Route::get('/feedbacks/{id}', [FeedbackController::class, 'adminShow'])
        ->name('feedback.adminShow');

    // Configuration du design de la page feedback
    Route::get('/feedback-design', [FeedbackDesignController::class, 'edit'])
        ->name('feedback.design.edit');
    
    Route::post('/feedback-design', [FeedbackDesignController::class, 'update'])
        ->name('feedback.design.update');

    // Liste des réponses pour un feedback
    Route::get('/feedback/{id}/replies', [FeedbackReplyController::class, 'index'])
        ->name('feedback.replies.index');

    // Création d'une réponse manuelle
    Route::post('/feedback/{id}/replies', [FeedbackReplyController::class, 'store'])
        ->name('feedback.replies.store');

    // Génération IA d'une réponse
    Route::post('/feedback/{id}/replies/ai', [FeedbackReplyController::class, 'generateAIReply'])
        ->middleware('plan.feature:ai_reply_generation')
        ->name('feedback.replies.ai');

    // Génération IA synchrone (retourne le contenu généré en JSON)
    Route::post('/feedback/{id}/replies/ai/generate', [FeedbackReplyController::class, 'generateAIReplySync'])
        ->middleware('plan.feature:ai_reply_generation')
        ->name('feedback.replies.ai.generate');

    /*
    | Dashboard
    */
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/radar-ia', [DashboardController::class, 'radar'])
        ->middleware('plan.feature:radar_ai')
        ->name('radar');
    Route::get('/radar-ia/export', [DashboardController::class, 'exportRadar'])
        ->middleware('plan.feature:radar_ai')
        ->name('radar.export');

    /*
    | Subscription & Crédits
    */
    Route::get('/subscription', [SubscriptionController::class, 'index'])
        ->name('subscription.index');
    
    Route::get('/subscription/portal', [SubscriptionController::class, 'portal'])
        ->name('subscription.portal');
    
    Route::get('/subscription/upgrade/{planId}', [SubscriptionController::class, 'upgrade'])
        ->name('subscription.upgrade');
    
    Route::post('/subscription/upgrade/{planId}', [SubscriptionController::class, 'confirmUpgrade'])
        ->name('subscription.confirmUpgrade');

    /*
    | Stripe Checkout
    */
    Route::post('/stripe/checkout/plan/{planId}', [StripeController::class, 'checkoutPlan'])
        ->name('stripe.checkout.plan');
    Route::post('/stripe/checkout/addon/{addonId}', [StripeController::class, 'checkoutAddon'])
        ->name('stripe.checkout.addon');

    Route::get('/stripe/success', [StripeController::class, 'success'])
        ->name('stripe.success');
    Route::get('/stripe/cancel', [StripeController::class, 'cancel'])
        ->name('stripe.cancel');

    /*
    | Tasks (company)
    */
    Route::get('/tasks', [TaskController::class, 'index'])
        ->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])
        ->name('tasks.store');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])
        ->name('tasks.updateStatus');

    /*
    | Analytics (company)
    */
    Route::get('/analytics', [DashboardController::class, 'analytics'])
        ->name('analytics');

    /*
    | Profile
    */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /*
    | Customers
    */
    Route::get('/customers', [CustomerController::class, 'index'])
        ->name('customers.index');

    Route::get('/customers/create', [CustomerController::class, 'create'])
        ->name('customers.create');

    Route::post('/customers', [CustomerController::class, 'store'])
        ->name('customers.store');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])
        ->name('customers.show');
    Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])
        ->name('customers.edit');
    Route::get('/customers/{customer}/qr', [CustomerController::class, 'qr'])
        ->name('customers.qr');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])
        ->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
    ->name('customers.destroy');


    Route::post('/customers/import-csv', [CustomerController::class, 'importCSV'])
        ->name('customers.importCSV');

    Route::get('/company/settings', [CompanyController::class, 'edit'])
        ->name('company.edit');

    Route::put('/company/settings', [CompanyController::class, 'update'])
        ->name('company.update');

    Route::get('/company/review-platforms', [CompanyController::class, 'editReviewPlatforms'])
        ->name('company.review-platforms.edit');

    Route::post('/company/review-platforms', [CompanyController::class, 'updateReviewPlatforms'])
        ->name('company.review-platforms.update');

    Route::get('/account-settings', function (Request $request) {
        return Inertia::render('Settings/Index', [
            'company' => $request->user()->company,
        ]);
    })->name('settings.index');

    Route::put('/account-settings', [CompanyController::class, 'update'])
        ->name('settings.update');

    /*
    | Feedback requests (send / resend)
    */
    Route::post('/feedback-requests', [FeedbackRequestController::class, 'store'])
        ->middleware(['plan.credits:1', 'plan.limits:feedbacks'])
        ->name('feedback-requests.store');
    
    Route::post('/feedback-requests/bulk', [FeedbackRequestController::class, 'storeBulk'])
        ->middleware(['plan.credits:1', 'plan.limits:feedbacks'])
        ->name('feedback-requests.bulk');
});

// Stripe Webhook (public)
Route::post('/stripe/webhook', [StripeController::class, 'webhook'])
    ->name('stripe.webhook');

/*
||--------------------------------------------------------------------------
|| Admin routes (créateurs de la plateforme)
||--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', IsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])
        ->name('dashboard');

    Route::get('/radar-ia', [AdminRadarController::class, 'index'])
        ->name('radar');
    Route::post('/radar-ia/regenerate', [AdminRadarController::class, 'regenerate'])
        ->name('radar.regenerate');

    // Admin sections
    Route::get('/companies', [AdminController::class, 'companies'])
        ->name('companies');
    Route::get('/users', [AdminController::class, 'users'])
        ->name('users');
    Route::get('/feedbacks', [AdminController::class, 'feedbacks'])
        ->name('feedbacks');
    Route::get('/requests', [AdminController::class, 'requests'])
        ->name('requests');
    Route::get('/replies', [AdminController::class, 'replies'])
        ->name('replies');
    Route::get('/analytics', [AdminController::class, 'analytics'])
        ->name('analytics');
    Route::get('/subscriptions', [AdminController::class, 'subscriptions'])
        ->name('subscriptions');
    Route::get('/channels', [AdminController::class, 'channels'])
        ->name('channels');
    Route::get('/settings', [AdminController::class, 'settings'])
        ->name('settings');
});




require __DIR__.'/auth.php';
