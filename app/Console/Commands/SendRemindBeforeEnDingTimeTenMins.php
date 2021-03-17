<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Notifications\RenewalReminderTenMinute;
use App\Notifications\TenMinBeforeOrderEnded;
use App\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendRemindBeforeEnDingTimeTenMins extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:send_remind_before_ending_time_ten_mins';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = ' Send remind for cast and guest before order ending time 10 mins';

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
        $orders = Order::whereDate('date', $currentDate)->whereIn('status', [OrderStatus::PROCESSING])->with('casts')->get();

        foreach ($orders as $order) {
            $tenMinBeforeEndTime = Carbon::parse($order->actual_started_at)
                ->addHours($order->duration)
                ->subMinute(10)
                ->second(0);

            if ($tenMinBeforeEndTime == $now) {
                $order->user->notify(new TenMinBeforeOrderEnded($order));
            }

            foreach ($order->casts as $cast) {
                $timeCast = Carbon::parse($cast->pivot->started_at)
                    ->addHours($order->duration)
                    ->subMinute(10)
                    ->second(0);

                if ($timeCast == $now) {
                    \Notification::send($cast, new RenewalReminderTenMinute($order));
                }
            }
        }
    }
}
