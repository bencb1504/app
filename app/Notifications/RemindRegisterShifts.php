<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\ProviderType;
use App\Enums\UserType;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class RemindRegisterShifts extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     */
    public function __construct()
    {

    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        if ($notifiable->provider == ProviderType::LINE) {
            if ($notifiable->device_type == DeviceType::WEB) {
                return [LineBotNotificationChannel::class];
            }
        }

        return [PushNotificationChannel::class];
    }

    public function pushData($notifiable)
    {
        $content = 'スケジュール入力は完了しましたか？'
            . PHP_EOL . 'スケジュールを入力する方が予約率が上がります！';
        $pushId = 'c_22';

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;

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
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                    ],
                ]
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $content = 'スケジュール入力は完了しましたか？'
            . PHP_EOL . 'スケジュールを入力する方が予約率が上がります！';

        return [
            [
                'type' => 'text',
                'text' => $content
            ]
        ];
    }
}
