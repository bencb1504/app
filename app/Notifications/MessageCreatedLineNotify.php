<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class MessageCreatedLineNotify extends Notification implements ShouldQueue
{
    use Queueable;

    public $roomId;

    /**
     * Create a new notification instance.
     *
     * @param $roomId
     */
    public function __construct($roomId)
    {
        $this->roomId = $roomId;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [LineBotGroupNotificationChannel::class];
    }

    public function lineBotPushToGroupData($notifiable)
    {
        $link = route('admin.chat.index', ['room' => $this->roomId]);
        $content = '運営者チャットにメッセージが届きました。'
            . PHP_EOL . 'Link: ' . $link;

        return [
            [
                'type' => 'text',
                'text' => $content,
            ]
        ];
    }
}
