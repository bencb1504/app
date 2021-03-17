<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CreateReportLineNotify extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [LineBotGroupNotificationChannel::class];
    }

    public function lineBotPushToGroupData($notifiable)
    {

        $link = route('admin.reports.index');
        $content = '通報がありました。'
            . PHP_EOL . 'Link: ' . $link;

        return [
            [
                'type' => 'text',
                'text' => $content,
            ]
        ];
    }
}
