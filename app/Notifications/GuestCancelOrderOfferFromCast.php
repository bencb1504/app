<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\ProviderType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GuestCancelOrderOfferFromCast extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     *
     * @param $order
     */
    public function __construct($orderId)
    {
        $this->order = Order::onWriteConnection()->findOrFail($orderId);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        if (ProviderType::LINE == $notifiable->provider) {
            if (UserType::GUEST == $notifiable->type && null == $notifiable->device_type) {
                return [LineBotNotificationChannel::class];
            }

            if (UserType::CAST == $notifiable->type && null == $notifiable->device_type) {
                return [PushNotificationChannel::class];
            }

            if (DeviceType::WEB == $notifiable->device_type && UserType::GUEST == $notifiable->type) {
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
        $castPrivateRoom = $this->order->room;

        $message = '予約リクエストがキャンセルされました';

        $castPrivateRoomMessage = $castPrivateRoom->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $message,
            'system_type' => SystemMessageType::NOTIFY,
        ]);

        $userIds = [$notifiable->id, $this->order->user->id];

        $castPrivateRoomMessage->recipients()->attach($userIds, ['room_id' => $castPrivateRoom->id]);

        $pushId = 'c_26';
        $room = $castPrivateRoom;

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;

        return [
            'audienceOptions' => ['named_user' => $namedUser],
            'notificationOptions' => [
                'alert' => $message,
                'ios' => [
                    'alert' => $message,
                    'sound' => 'cat.caf',
                    'badge' => '+1',
                    'content-available' => true,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'cast_offer_id' => $this->order->id,
                        'room_id' => $room->id,
                    ],
                ],
                'android' => [
                    'alert' => $message,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'cast_offer_id' => $this->order->id,
                        'room_id' => $room->id,
                    ],
                ],
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $castPrivateRoom = $this->order->room;

        $message = '予約リクエストがキャンセルされました';

        $castPrivateRoomMessage = $castPrivateRoom->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $message,
            'system_type' => SystemMessageType::NOTIFY,
        ]);

        $userIds = [$notifiable->id, $this->order->user->id];

        $castPrivateRoomMessage->recipients()->attach($userIds, ['room_id' => $castPrivateRoom->id]);

        return [
            [
                'type' => 'text',
                'text' => $message,
            ],
        ];
    }
}
