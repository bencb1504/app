<?php

namespace App\Console;

use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\CastRankingSchedule::class,
        Commands\WorkingToday::class,
        Commands\NominatedCallSchedule::class,
        Commands\SetTimeOutForCallOrder::class,
        Commands\InactiveChatRoomWhenOrderDone::class,
        Commands\DeleteCanceledOrderSchedule::class,
        Commands\DeleteCastCanceledOrderSchedule::class,
        Commands\SendRemindBeforeEnDingTimeTenMins::class,
        Commands\SendPaymentRequestWhenCastStopOrder::class,
        Commands\PointSettlementSchedule::class,
        Commands\SendRemindForCastBeforeTenMins::class,
        Commands\CancelFeeSettlement::class,
        Commands\DeleteUnusedPointAfter180Days::class,
        Commands\IncativeChatRoomWhenOrderCanceled::class,
        Commands\NotificationSchedules::class,
        Commands\SetTimeOutForOffer::class,
        Commands\MarketingOperation::class,
        Commands\RetryFailedJobs::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('cheers:update_cast_ranking')->hourly()->between('4:00', '7:00')->onOneServer()->runInBackground();
        $schedule->command('cheers:reset_working_today')->dailyAt(5)->onOneServer()->runInBackground();
        $schedule->command('cheers:update_nominated_call')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:set_timeout_for_call_order')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:inactive_chatroom_when_order_done')->hourly()->onOneServer()->runInBackground();
        // $schedule->command('cheers:delete_canceled_order')->hourly()->onOneServer()->runInBackground();
        $schedule->command('cheers:delete_cast_canceled_order')->hourly()->onOneServer()->runInBackground();
        $schedule->command('cheers:send_remind_before_ending_time_ten_mins')->everyMinute()->onOneServer()->runInBackground();
        // $schedule->command('cheers:send_remind_for_cast_before_ten_minutes')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:point_settlement')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:send_payment_request_when_cast_stop_order')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:cancel_fee_settlement')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:delete_unused_point_after_180_days')->hourly()->onOneServer()->runInBackground();
        $schedule->command('cheers:inactive_chatroom_when_order_canceled')->hourlyAt(5)->onOneServer()->runInBackground();
        $schedule->command('cheers:notification_schedules')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:set_timeout_for_offer')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:marketing')->dailyAt(env('CAMPAIGN_SEND_TIME'))->onOneServer()->runInBackground();
        $schedule->command('cheers:retry_failed_jobs')->everyMinute()->onOneServer()->runInBackground();
        $schedule->command('cheers:add_shift')->dailyAt('18:00')->onOneServer()->runInBackground();
        $schedule->command('cheers:remind_register_shifts')->wednesdays()->dailyAt('12:00')->onOneServer()->runInBackground();
        $schedule->command('cheers:remind_register_shifts')->sundays()->dailyAt('12:00')->onOneServer()->runInBackground();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
