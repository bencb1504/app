<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\ProviderType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class CancelOrderCreateByCast extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     *
     * @param $order
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
        $room = $this->order->room;
        $message = '指名予約の提案が取り下げられました';

        $sendMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $message,
            'system_type' => SystemMessageType::NORMAL,
        ]);

        $sendMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = '指名予約の提案が取り下げられました';
        $pushId = 'g_26';

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;

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
                        'room_id' => $room->id,
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'order_id' => $this->order->id,
                        'room_id' => $room->id,
                    ],
                ],
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $room = $this->order->room;
        $message = '指名予約の提案が取り下げられました';
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $message,
            'system_type' => SystemMessageType::NOTIFY,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = '指名予約の提案が取り下げられました';

        return [
            [
                'type' => 'text',
                'text' => $content,
            ],
        ];
    }
}
