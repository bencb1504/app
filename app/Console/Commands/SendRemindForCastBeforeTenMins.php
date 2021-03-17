<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Notifications\OrderRemindBeforeTenMinutes;
use App\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendRemindForCastBeforeTenMins extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:send_remind_for_cast_before_ten_minutes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send remind for cast before order starting time 10 mins';

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
        $now = Carbon::now()->second(0);
        $currentDate = Carbon::now()->format('Y-m-d');
        $orders = Order::whereDate('date', $currentDate)->whereIn('status', [OrderStatus::ACTIVE])->with('casts')->get();

        foreach ($orders as $order) {
            $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $order->date . ' ' . $order->start_time)->second(0);

            $time = $startTime->copy()->subMinute(10);
            if ($time == $now) {
                \Notification::send($order->casts, new OrderRemindBeforeTenMinutes($order));
            }
        }
    }
}
