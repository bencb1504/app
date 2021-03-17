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
use Illuminate\Notifications\Messages\MailMessage;

class CancelOrderFromCast extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     *
     * @param $order
     */
    public function __construct($order){
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

            if ($notifiable->device_type == DeviceType::WEB && $notifiable->type == UserType::GUEST) {
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
        if ($notifiable->type == UserType::CAST) {
            $castPrivateRoom = $notifiable->rooms()
                ->where('rooms.type', RoomType::SYSTEM)
                ->where('rooms.is_active', true)->first();
            $message = 'キャンセルが完了しました。';
            $castPrivateRoomMessage = $castPrivateRoom->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $message,
                'system_type' => SystemMessageType::NORMAL
            ]);
            $castPrivateRoomMessage->recipients()->attach($notifiable->id, ['room_id' => $castPrivateRoom->id]);

            $content = 'キャンセルが完了しました。';
            $pushId = 'c_10';
            $room = $castPrivateRoom;
        } else {
            $room = $this->order->room;
            $message = '予約がキャンセルされました。';
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $message,
                'system_type' => SystemMessageType::NOTIFY
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

            $pushId = 'g_10';
            $content = '予約がキャンセルされました。';
        }

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
        $room = $this->order->room;
        $message = '予約がキャンセルされました。';
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $message,
            'system_type' => SystemMessageType::NOTIFY
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $content = 'キャストが予約をキャンセルしたため、開催予定の飲み会は中止となります。'
            . PHP_EOL . '大変申し訳ございません。'
            . PHP_EOL . '再度予約し直す場合は、お手数ですが、もう一度「今すぐキャストを呼ぶ」ボタンをタップして、予約を行ってください。';

        return [
            [
                'type' => 'text',
                'text' => $content
            ]
        ];
    }
}
