<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\ProviderType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use App\Traits\DirectRoom;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Storage;

class FavoritedNotify extends Notification implements ShouldQueue
{
    use Queueable, DirectRoom;

    public $user;

    /**
     * Create a new notification instance.
     *
     * @param $user
     */
    public function __construct($user)
    {
        $this->user = $user;
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
        $room = $this->createDirectRoom($notifiable->id, $this->user->id);
        $likeImgSrc = Storage::url('iine3.png');;
        if (!@getimagesize($likeImgSrc)) {
            $fileContents = Storage::disk('local')->get("system_images/iine3.png");
            $fileName = 'iine3.png';
            Storage::put($fileName, $fileContents, 'public');
        }
        $likeImgMessge = $room->messages()->create([
            'user_id' => $this->user->id,
            'type' => MessageType::LIKE,
            'image' => 'iine3.png',
            'system_type' => SystemMessageType::NORMAL,
            'created_at' => now()->copy()->addSeconds(2)
        ]);
        $likeImgMessge->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = $this->user->nickname . 'さんからイイネされました！';
        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        if ($notifiable->type == UserType::CAST) {
            $pushId = 'c_19';
        } else {
            $pushId = 'g_17';
        }

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
        $room = $this->createDirectRoom($notifiable->id, $this->user->id);
        $likeImgSrc = Storage::url('iine3.png');;
        if (!@getimagesize($likeImgSrc)) {
            $fileContents = Storage::disk('local')->get("system_images/iine3.png");
            $fileName = 'iine3.png';
            Storage::put($fileName, $fileContents, 'public');
        }
        $likeImgMessge = $room->messages()->create([
            'user_id' => $this->user->id,
            'type' => MessageType::LIKE,
            'image' => 'iine3.png',
            'system_type' => SystemMessageType::NORMAL,
            'created_at' => now()->copy()->addSeconds(2)
        ]);
        $likeImgMessge->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = $this->user->nickname . 'さんからイイネされました！';
        $page = env('LINE_LIFF_REDIRECT_PAGE') . '?page=cast&cast_id=' . $this->user->id;

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
                            'label' => 'キャストを見てみる',
                            'uri' => "line://app/$page"
                        ]
                    ]
                ]
            ]
        ];
    }
}
