<?php

namespace App\Console\Commands;

use App\Cast;
use App\Enums\NotificationScheduleStatus;
use App\Enums\NotificationScheduleType;
use App\Enums\UserType;
use App\Guest;
use App\NotificationSchedule;
use App\Notifications\AdminNotification;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class NotificationSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:notification_schedules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notification schedule';

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

        $now = Carbon::now()->format('Y-m-d H:i');

        $notificationSchedules = NotificationSchedule::where('status', NotificationScheduleStatus::PUBLISH)
            ->where(\DB::raw('DATE_FORMAT(send_date, "%Y-%m-%d %H:%i") '), $now);
        try {
            foreach ($notificationSchedules->cursor() as $notificationSchedule) {
                $this->sendPush($notificationSchedule);
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }

    private function sendPush($notificationSchedule)
    {
        if (NotificationScheduleType::ALL == $notificationSchedule->type) {
            $guests = User::where('type', UserType::GUEST)->get();
            \Notification::send($guests, new AdminNotification($notificationSchedule));

            $casts = Cast::all();
            \Notification::send($casts, new AdminNotification($notificationSchedule));
        } elseif (NotificationScheduleType::GUEST == $notificationSchedule->type) {
            $guests = User::where('type', UserType::GUEST)->get();

            \Notification::send($guests, new AdminNotification($notificationSchedule));
        } else {
            $casts = Cast::all();

            \Notification::send($casts, new AdminNotification($notificationSchedule));
        }
    }
}
