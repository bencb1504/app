<?php

namespace App\Console\Commands;

use App\Enums\UserType;
use App\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class MarketingOperation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:marketing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Marketing Operation';

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
        $startDate = Carbon::parse(env('CAMPAIGN_FROM'))->startOfDay();
        $endDate = Carbon::parse(env('CAMPAIGN_TO'))->endOfDay();
        $guests = User::where(function($q) use ($startDate, $endDate) {
            $q->where('created_at', '>=', $startDate)
                ->where('created_at', '<=', $endDate);
        })->where('campaign_participated', false)->where('type', UserType::GUEST)->get();

        \Notification::send($guests, new \App\Notifications\MarketingOperation());
    }
}
