<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\ProviderType;
use App\Enums\UserType;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\User;

class NotifyFavouriteTimeline extends Notification implements ShouldQueue
{
    use Queueable;
    public $user;
    public $timeline;
    /**
     * Create a new notification instance.
     *
     * @param $orderId
     */
    public function __construct($user, $timeline) {
        $this->user = $user;
        $this->timeline = $timeline;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        if ($notifiable->provider == ProviderType::LINE) {
            if ($notifiable->type == UserType::GUEST && $notifiable->device_type == null) {
                return [LineBotNotificationChannel::class];
            }

            if ($notifiable->type == UserType::CAST && $notifiable->device_type == null) {
                return [PushNotificationChannel::class];
            }

            if ($notifiable->device_type == DeviceType::WEB) {
                return [LineBotNotificationChannel::class];
            } else {
                return [PushNotificationChannel::class];
            }
        } else {
            return [PushNotificationChannel::class];
        }
    }

    public function lineBotPushData($notifiable)
    {
        $content = $this->user->nickname.'さんがあなたの投稿にいいねしました';

        return [
            [
                'type' => 'text',
                'text' => $content,
            ]
        ];
    }

    public function pushData($notifiable)
    {
        if ($notifiable->type == UserType::GUEST) {
            $pushId = 'g_23';
            $send_from = UserType::GUEST;
        } else {
            $pushId = 'c_24';
            $send_from = UserType::CAST;
        }
        $content = $this->user->nickname.'さんがあなたの投稿にいいねしました';
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
                        'timeline_id' => $this->timeline->id,
                        'send_from' => $send_from,
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'timeline_id' => $this->timeline->id,
                        'send_from' => $send_from,
                    ],
                ]
            ],
        ];
    }
}
