<?php

namespace App\Notifications;

use App\Enums\RoomType;
use App\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class MessageCreatedNotifyToAdmin extends Notification implements ShouldQueue
{
    use Queueable;

    public $roomId;
    /**
     * Create a new notification instance.
     *
     * @return void
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
        return [RocketChatNotificationChannel::class];
    }

    public function rocketChatPushData($notifiable)
    {
        $link = route('admin.chat.index', ['room' => $this->roomId]);
        return [
            'text' => "運営者チャットにメッセージが届きました。[Link]($link)"
        ];
    }
}
