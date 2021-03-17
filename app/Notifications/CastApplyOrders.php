<?php

namespace App\Notifications;

use App\Enums\MessageType;
use App\Enums\RoomType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use App\Order;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CastApplyOrders extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;
    public $orderPoint;

    /**
     * Create a new notification instance.
     *
     * @param Order $order
     * @param $orderPoint
     */
    public function __construct(Order $order, $orderPoint)
    {
        $this->order = $order;
        $this->orderPoint = $orderPoint;
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
     * @param  mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [];
    }

    public function pushData($notifiable)
    {
        $orderStartTime = Carbon::parse($this->order->date . ' ' . $this->order->start_time);

        $content = '以下の内容で予約が確定しました♪'
            . PHP_EOL . '----'
            . PHP_EOL . '- 提案内容 -'
            . PHP_EOL . '日時：' . $orderStartTime->format('Y/m/d H:i') . '~'
            . PHP_EOL . '時間：' . $this->order->duration . '時間'
            . PHP_EOL . 'クラス：' . $this->order->castClass->name
            . PHP_EOL . '人数：' . $this->order->total_cast . '人'
            . PHP_EOL . '場所：' . $this->order->address
            . PHP_EOL . '予定獲得ポイント：' . ($this->orderPoint * 0.8) . ' Point'
            . PHP_EOL . '----'
            . PHP_EOL . 'ゲストとのチャットが作成されるので、場所の詳細確認をお願いします♪'
            . PHP_EOL . PHP_EOL . 'また、合流開始時刻の1時間前にはゲストとのチャット画面にスタートボタンが出現します。'
            . PHP_EOL . 'ゲストと合流後、ゲストに確認してからスタートボタンを押してください！'
            . PHP_EOL . PHP_EOL . '予定時刻に遅れそうな場合は、チャットルームで遅れる旨を必ず伝えましょう！';

        $room = $notifiable->rooms()
            ->where('rooms.type', RoomType::SYSTEM)
            ->where('rooms.is_active', true)->first();
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
            'order_id' => $this->order->id,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        $pushId = 'c_15';

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
}
