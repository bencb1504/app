<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\ProviderType;
use App\Enums\RoomType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class AddedInvitePoint extends Notification implements ShouldQueue
{
    use Queueable;

    public $isRecevice;

    /**
     * Create a new notification instance.
     *
     * @param bool $isRecevice
     */
    public function __construct($isRecevice = false)
    {
        $this->isRecevice = $isRecevice;
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

    public function pushData($notifiable)
    {
        if ($this->isRecevice) {
            $content = '「友達招待キャンペーン」特典で10,000Pが付与されました。ぜひ次回の飲み会に利用してください！コチラからポイント残高を確認できます。';
        } else {
            $content = '「友達招待キャンペーン」特典で10,000Pが付与されました。ぜひ次回の飲み会に利用してください！コチラからポイント残高を確認できます。';
        }

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        if ($room) {
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::INVITE_CODE,
                'message' => $content,
                'system_type' => SystemMessageType::NORMAL,
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        }

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        $pushId = 'g_19';

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
                        'room_id' => $room->id
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'room_id' => $room->id
                    ],
                ]
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        if ($this->isRecevice) {
            $content = '「友達招待キャンペーン」特典で10,000Pが付与されました。ぜひ次回の飲み会に利用してください！';
            $btnText = 'ポイント残高を確認する';
        } else {
            $content = '「友達招待キャンペーン」特典で10,000Pが付与されました。ぜひ次回の飲み会に利用してください！';
            $btnText = 'ポイント残高を確認する';
        }

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        if ($room) {
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::INVITE_CODE,
                'message' => $content,
                'system_type' => SystemMessageType::NORMAL,
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        }

        $page = env('LINE_LIFF_REDIRECT_PAGE') . '?page=purchase';
        return [
            [
                'type' => 'template',
                'altText' => $content,
                'text' => $content,
                'template' => [
                    'type' => 'buttons',
                    'text' => $content,
                    'actions' => [
                        [
                            'type' => 'uri',
                            'label' => $btnText,
                            'uri' => "line://app/$page"
                        ]
                    ]
                ]
            ]
        ];
    }
}
