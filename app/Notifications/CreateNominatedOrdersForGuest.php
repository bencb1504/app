<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Order;
use Carbon\Carbon;
use App\Enums\RoomType;
use App\Enums\UserType;
use App\Enums\MessageType;
use App\Enums\ProviderType;
use Illuminate\Bus\Queueable;
use App\Enums\SystemMessageType;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class CreateNominatedOrdersForGuest extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     *
     * @param $orderId
     */
    public function __construct($orderId)
    {
        $order = Order::onWriteConnection()->findOrFail($orderId);

        $this->order = $order;
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
        return [];
    }

    public function pushData($notifiable)
    {
        $startTime = Carbon::parse($this->order->date . ' ' . $this->order->start_time);
        $endTime = Carbon::parse($this->order->date . ' ' . $this->order->end_time);

        $content = 'Cheersをご利用いただきありがとうございます！'
        . PHP_EOL . 'キャストのご予約を承りました。'
        . PHP_EOL . '-----'
        . PHP_EOL . PHP_EOL . '- ご予約内容 -'
        . PHP_EOL . '日時：' . $startTime->format('Y/m/d H:i') . '~'
        . PHP_EOL . '時間：' . $startTime->diffInMinutes($endTime) / 60 . '時間'
        . PHP_EOL . 'クラス：' . $this->order->castClass->name
        . PHP_EOL . '人数：' . $this->order->total_cast . '人'
        . PHP_EOL . '場所：' . $this->order->address
        . PHP_EOL . PHP_EOL . '現在、キャストの調整を行っております。'
        . PHP_EOL . 'しばらくお待ちください☆';

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        $pushId = 'g_2';

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
                        'order_id' => $this->order->id,
                        'room_id' => $room->id
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'order_id' => $this->order->id,
                        'room_id' => $room->id
                    ],
                ]
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $startTime = Carbon::parse($this->order->date . ' ' . $this->order->start_time);
        $endTime = Carbon::parse($this->order->date . ' ' . $this->order->end_time);

        $content = 'Cheersをご利用いただきありがとうございます！'
            . PHP_EOL . 'キャストのご予約を承りました。'
            . PHP_EOL . '-----'
            . PHP_EOL . PHP_EOL . '- ご予約内容 -'
            . PHP_EOL . '日時：' . $startTime->format('Y/m/d H:i') . '~'
            . PHP_EOL . '時間：' . $startTime->diffInMinutes($endTime) / 60 . '時間'
            . PHP_EOL . 'クラス：' . $this->order->castClass->name
            . PHP_EOL . '人数：' . $this->order->total_cast . '人'
            . PHP_EOL . '場所：' . $this->order->address
            . PHP_EOL . PHP_EOL . '現在、キャストの調整を行っております。'
            . PHP_EOL . 'しばらくお待ちください☆';

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = 'Cheersをご利用いただきありがとうございます！'
            . PHP_EOL . 'キャストのご予約を承りました。'
            . PHP_EOL . '-----'
            . PHP_EOL . PHP_EOL . '- ご予約内容 -'
            . PHP_EOL . '日時：' . $startTime->format('Y/m/d H:i') . '~'
            . PHP_EOL . '時間：' . $startTime->diffInMinutes($endTime) / 60 . '時間'
            . PHP_EOL . 'クラス：' . $this->order->castClass->name
            . PHP_EOL . '人数：' . $this->order->total_cast . '人'
            . PHP_EOL . '場所：' . $this->order->address
            . PHP_EOL . PHP_EOL . '現在、キャストの調整を行っております。'
            . PHP_EOL . 'しばらくお待ちください☆';

        return [
            [
                'type' => 'text',
                'text' => $content
            ]
        ];
    }
}
