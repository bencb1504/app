<?php

namespace App\Notifications;

use App\User;
use App\Message;
use App\Enums\UserType;
use App\Enums\MessageType;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class MessageCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public $message;

    /**
     * Create a new notification instance.
     *
     * @param $message
     */
    public function __construct($messageId)
    {
        $message = Message::onWriteConnection()->findOrFail($messageId);

        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [PushNotificationChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable)
    {
        return;
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }

    public function pushData($notifiable)
    {
        if ($notifiable->type == UserType::GUEST) {
            $pushId = 'g_14';
            $send_from = UserType::GUEST;
        } else {
            $pushId = 'c_14';
            $send_from = UserType::CAST;
        }

        if ($this->message->type == MessageType::IMAGE) {
            $content = $this->message->user->nickname. 'さんが写真を送信しました';
        } else {
            $content = $this->message->message;
        }
        $namedUser = 'user_' . $notifiable->id;

        return [
            'audienceOptions' => ['named_user' => $namedUser],
            'notificationOptions' => [
                'alert' => $content,
                'ios' => [
                    'alert' => $content,
                    'sound' => 'cat.caf',
                    'badge' => '+1',
                    'content-available' => true,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'room_id' => $this->message->room_id
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'room_id' => $this->message->room_id
                    ],
                ]
            ],
        ];
    }
}
