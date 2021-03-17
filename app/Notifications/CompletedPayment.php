<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\PaymentRequestStatus;
use App\Enums\ProviderType;
use App\Enums\RoomType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use App\Order;
use App\Services\LogService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class CompletedPayment extends Notification implements ShouldQueue
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
        return [
            //
        ];
    }

    public function pushData($notifiable)
    {
        $orderStartDate = Carbon::parse($this->order->actual_started_at);
        $orderEndDate = Carbon::parse($this->order->actual_ended_at);
        $guestNickname = $this->order->user->nickname ? $this->order->user->nickname . '様' : 'お客様';

        $totalPoint = $this->order->total_point - $this->order->discount_point;
        if ($totalPoint < 0) {
            $totalPoint = 0;
        }
        $content = 'Cheersをご利用いただきありがとうございました♪'
        . PHP_EOL . $orderStartDate->format('Y/m/d H:i') . '~' . $orderEndDate->format('H:i') . 'のご利用ポイント、' .
            number_format($totalPoint) . 'Pointのご清算が完了いたしました。'
            . PHP_EOL . PHP_EOL . 'マイページの「ポイント履歴」から領収書の発行が可能です。'
            . PHP_EOL . PHP_EOL . $guestNickname . 'のまたのご利用をお待ちしております♪';
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

        $pushId = 'g_16';
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
        $orderStartDate = Carbon::parse($this->order->actual_started_at);
        $orderEndDate = Carbon::parse($this->order->actual_ended_at);
        $guestNickname = $this->order->user->nickname ? $this->order->user->nickname . '様' : 'お客様';

        $totalPoint = $this->order->total_point - $this->order->discount_point;

        if ($totalPoint < 0) {
            $totalPoint = 0;
        }
        $content = 'Cheersをご利用いただきありがとうございました♪'
            . PHP_EOL . $orderStartDate->format('Y/m/d H:i') . '~' . $orderEndDate->format('H:i') . 'のご利用ポイント、' .
            number_format($totalPoint) . 'Pointのご清算が完了いたしました。'
            . PHP_EOL . PHP_EOL . 'マイページの「ポイント履歴」から領収書の発行が可能です。'
            . PHP_EOL . PHP_EOL . $guestNickname . 'のまたのご利用をお待ちしております♪';
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

        $content = 'Cheersをご利用いただきありがとうございました♪'
            . PHP_EOL . $orderStartDate->format('Y/m/d H:i') . '~' . $orderEndDate->format('H:i') . 'のご利用ポイント、' .
            number_format($totalPoint) . 'Point'
            . PHP_EOL . 'のご清算が完了いたしました。'
            . PHP_EOL . PHP_EOL . 'マイページの「ポイント履歴」から領収書の発行が可能です。'
            . PHP_EOL . PHP_EOL . $guestNickname . 'のまたのご利用をお待ちしております♪';

        return [
            [
                'type' => 'text',
                'text' => $content,
            ]
        ];
    }
}
