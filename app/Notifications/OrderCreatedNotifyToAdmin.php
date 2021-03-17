<?php

namespace App\Notifications;

use App\Order;
use App\Enums\OrderType;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderCreatedNotifyToAdmin extends Notification implements ShouldQueue
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
        return [RocketChatNotificationChannel::class];
    }

    public function rocketChatPushData($notifiable)
    {
        if ($this->order->type == OrderType::NOMINATION) {
            $link = route('admin.orders.order_nominee', ['order' => $this->order->id]);
        } else {
            $link = route('admin.orders.call', ['order' => $this->order->id]);
        }

        return [
            'text' => "新規の予約がありました。[Link]($link)"
        ];
    }
}
