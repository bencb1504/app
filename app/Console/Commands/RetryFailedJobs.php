<?php

namespace App\Console\Commands;

use App\FailedJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class RetryFailedJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:retry_failed_jobs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Retry failed jobs';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $failedAt = now()->subMinutes(3);

        $jobs = FailedJob::where('failed_at', '>=', $failedAt);

        foreach ($jobs->cursor() as $job) {
            $payload = json_decode($job->payload, true);

            if (isset($payload['attempts']) && $payload['attempts'] > 3) {
                continue;
            }

            Artisan::call('queue:retry', ['id' => [$job->id]]);
        }
    }
}
