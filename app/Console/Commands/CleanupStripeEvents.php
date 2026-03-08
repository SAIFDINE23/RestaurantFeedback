<?php

namespace App\Console\Commands;

use App\Models\StripeEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupStripeEvents extends Command
{
    protected $signature = 'stripe:cleanup-events {--days=90 : Number of days to keep}';
    protected $description = 'Cleanup old Stripe events to prevent table bloat';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $count = StripeEvent::where('received_at', '<', $cutoff)->count();

        if ($count === 0) {
            $this->info('No old Stripe events to clean up.');
            return self::SUCCESS;
        }

        $this->info("Deleting {$count} Stripe events older than {$days} days...");

        // Delete in chunks to avoid memory issues
        StripeEvent::where('received_at', '<', $cutoff)->delete();

        $this->info("Deleted {$count} old Stripe events.");
        Log::info("Stripe events cleanup: deleted {$count} events older than {$days} days.");

        return self::SUCCESS;
    }
}
