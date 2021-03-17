<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DeleteCanceledOrderSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:delete_canceled_order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete canceled orders';

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
        $today = Carbon::now();

        Order::whereIn('status', [OrderStatus::DENIED, OrderStatus::TIMEOUT, OrderStatus::CANCELED])
            ->where('canceled_at', '<', $today->subDays(1))
            ->delete();
    }
}
