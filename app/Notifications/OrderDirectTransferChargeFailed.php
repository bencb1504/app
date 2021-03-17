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

class OrderDirectTransferChargeFailed extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;
    public $point;

    /**
     * Create a new notification instance.
     *
     * @param $order
     * @param $point
     */
    public function __construct($order, $point)
    {
        $this->order = $order;
        $this->point = $point;
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
            } else {
                return [PushNotificationChannel::class];
            }
        } else {
            return [PushNotificationChannel::class];
        }
    }

    public function pushData($notifiable)
    {
        $content = 'ポイントが不足しているため、決済できませんでした。'
            . PHP_EOL . 'コチラから不足ポイントと振込先をご確認の上、ポイント購入をお願い致します。'
            . PHP_EOL . '着金後に弊社でポイント付与・決済処理をさせていただきます。'
            . PHP_EOL . PHP_EOL . 'ご不明点がございましたら、こちらのチャットにご返信ください。';

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
            'missing_point' => $this->point,
            'order_id' => $this->order->id,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        $pushId = 'g_20';
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
                        'room_id' => $room->id,
                        'order_id' => $this->order->id,
                        'missing_point' => $this->point
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'room_id' => $room->id,
                        'order_id' => $this->order->id,
                        'missing_point' => $this->point
                    ],
                ]
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $roomMessage = 'ポイントが不足しているため、決済できませんでした。'
            . PHP_EOL . 'コチラから不足ポイントと振込先をご確認の上、ポイント購入をお願い致します。'
            . PHP_EOL . '着金後に弊社でポイント付与・決済処理をさせていただきます。'
            . PHP_EOL . PHP_EOL . 'ご不明点がございましたら、こちらのチャットにご返信ください。';

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $roomMessage,
            'system_type' => SystemMessageType::NORMAL,
            'missing_point' => $this->point,
            'order_id' => $this->order->id,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = 'ポイントが不足しているため、決済できませんでした。'
            . PHP_EOL . '不足ポイントと振込先をご確認の上、ポイント購入をお願い致します。'
            . PHP_EOL . '着金後に弊社でポイント付与・決済処理をさせていただきます。';

        $page = env('LINE_LIFF_REDIRECT_PAGE') . '?page=require_transfer_point&point=' . $this->point . '&order_id=' . $this->order->id;

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
                            'label' => '不足ポイントを確認する',
                            'uri' => "line://app/$page"
                        ]
                    ]
                ]
            ]
        ];
    }
}
