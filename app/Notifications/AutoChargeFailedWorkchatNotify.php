<?php

namespace App\Notifications;

use App\Enums\OrderType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AutoChargeFailedWorkchatNotify extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;
    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($order)
    {
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
        return [RocketChatNotificationChannel::class];
    }

    public function rocketChatPushData($notifiable)
    {
        if (OrderType::NOMINATION != $this->order->type) {
            $link = route('admin.orders.call', ['order' => $this->order->id]);
        } else {
            $link = route('admin.orders.order_nominee', ['order' => $this->order->id]);
        }

        return [
            'text' => "決済エラーが発生しました [Link]($link)",
        ];
    }
}
