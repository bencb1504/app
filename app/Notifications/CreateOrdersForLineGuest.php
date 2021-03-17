<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\UserType;
use App\Order;
use Carbon\Carbon;
use App\Enums\RoomType;
use App\Enums\OrderType;
use App\Enums\MessageType;
use Illuminate\Bus\Queueable;
use App\Enums\SystemMessageType;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class CreateOrdersForLineGuest extends Notification implements ShouldQueue
{
    use Queueable, InteractsWithQueue;

    public $order;

    /**
     * Create a new notification instance.
     *
     * @param $orderId
     */
    public function __construct($orderId)
    {
        try {
            $order = Order::onWriteConnection()->findOrFail($orderId);

            $this->order = $order;
        } catch (\Exception $exception) {
            logger('QUEUE FAILED:');
            logger($exception->getMessage());
            logger('Attempts: ' . $this->attempts());

            $this->release(10);
        }
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        if ($notifiable->device_type == DeviceType::WEB) {
            return [LineBotNotificationChannel::class];
        } else {
            return [PushNotificationChannel::class];
        }
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
        $startTime = Carbon::parse($this->order->date . ' ' . $this->order->start_time);
        $endTime = $startTime->copy()->addMinutes($this->order->duration * 60);

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
        $endTime = $startTime->copy()->addMinutes($this->order->duration * 60);

        $roomMessage = 'Cheersをご利用いただきありがとうございます！'
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
            'message' => $roomMessage,
            'system_type' => SystemMessageType::NORMAL,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        if ($this->order->type == OrderType::NOMINATION) {
            $content = 'Cheersをご利用いただきありがとうございます！✨'
                . PHP_EOL . 'キャストのご予約を承りました。'
                . PHP_EOL . '----'
                . PHP_EOL . '▼ご予約内容'
                . PHP_EOL . '日時：' . $startTime->format('Y/m/d H:i') . '~'
                . PHP_EOL . '時間：' . $startTime->diffInMinutes($endTime) / 60 . '時間'
                . PHP_EOL . '場所：' . $this->order->address
                . PHP_EOL . PHP_EOL . '現在、キャストの調整を行っております。'
                . PHP_EOL . 'しばらくお待ちください☆'
                . PHP_EOL .  PHP_EOL . '【このあとの流れ】'
                . PHP_EOL .  '①キャストが揃うと、マッチング成功'
                . PHP_EOL .  '②キャストへ合流場所を送信'
                . PHP_EOL .  '③マッチング終了後、キャスト評価と決済';
        } else {
            $content = 'Cheersをご利用いただきありがとうございます！✨'
                . PHP_EOL . 'キャストのご予約を承りました。'
                . PHP_EOL . '----'
                . PHP_EOL . '▼ご予約内容'
                . PHP_EOL . '日時：' . $startTime->format('Y/m/d H:i') . '~'
                . PHP_EOL . '時間：' . $startTime->diffInMinutes($endTime) / 60 . '時間'
                . PHP_EOL . 'クラス：' . $this->order->castClass->name
                . PHP_EOL . '人数：' . $this->order->total_cast . '人'
                . PHP_EOL . '場所：' . $this->order->address
                . PHP_EOL . PHP_EOL . '現在、キャストの調整を行っております。'
                . PHP_EOL . 'しばらくお待ちください☆'
                . PHP_EOL .  PHP_EOL . '【このあとの流れ】'
                . PHP_EOL .  '①キャストが揃うと、マッチング成功'
                . PHP_EOL .  '②キャストへ合流場所を送信'
                . PHP_EOL .  '③マッチング終了後、キャスト評価と決済';
        }

        return [
            [
                'type' => 'text',
                'text' => $content
            ]
        ];
    }
}
