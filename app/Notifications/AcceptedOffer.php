<?php

namespace App\Notifications;

use App\Enums\MessageType;
use App\Enums\SystemMessageType;
use App\Order;
use App\Room;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class AcceptedOffer extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;
    public $room;

    /**
     * Create a new notification instance.
     *
     * @param $orderId
     */
    public function __construct($orderId)
    {
        $this->order = Order::onWriteConnection()->findOrFail($orderId);
        $this->room = Room::onWriteConnection()->findOrFail($this->order->room_id);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [CustomDatabaseChannel::class];
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        $orderStartDate = Carbon::parse($this->order->start_time);
        $content = '\\\\ マッチングが確定しました♪ //'
            . PHP_EOL . PHP_EOL . '- ご予約内容 -'
            . PHP_EOL . '場所：' . $this->order->address
            . PHP_EOL . '合流予定時間：' . $orderStartDate->format('H:i') . '～'
            . PHP_EOL . PHP_EOL . 'ゲストの方はキャストに来て欲しい場所の詳細をお伝えください。'
            . PHP_EOL . '尚、ご不明点がある場合は「Cheers運営者」チャットまでお問い合わせください。'
            . PHP_EOL . PHP_EOL . 'それでは素敵な時間をお楽しみください♪';

        $room = $this->room;
        $casts = $this->order->casts;
        $recipients = [];
        foreach ($casts as $cast) {
            $recipients += [$cast->id => ['room_id' => $this->room->id]];
        }
        $recipients += [$notifiable->id => ['room_id' => $this->room->id]];

        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
            'order_id' => $this->order->id,
        ]);
        $roomMessage->recipients()->attach($recipients);

        return [];
    }
}
