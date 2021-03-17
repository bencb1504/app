<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\OrderType;
use App\Enums\ProviderType;
use App\Enums\RoomType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use App\Order;
use App\Traits\DirectRoom;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CallOrdersTimeOut extends Notification implements ShouldQueue
{
    use Queueable, DirectRoom;

    public $order;

    /**
     * Create a new notification instance.
     *
     * @param $order
     */
    public function __construct(Order $order)
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
        if ($this->order->type == OrderType::NOMINATION) {
            return [PushNotificationChannel::class];
        } else {
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
        if ($this->order->type != OrderType::NOMINATION) {
            $message = 'ご希望の人数のキャストが揃わなかったため、'
                . PHP_EOL . '下記の予約が無効となりました。'
                . PHP_EOL . '----'
                . PHP_EOL . '- キャンセル内容 -'
                . PHP_EOL . '日時：' . Carbon::parse($this->order->date . ' ' . $this->order->start_time)->format('Y/m/d H:i') . '~'
                . PHP_EOL . '時間：' . $this->order->duration . '時間'
                . PHP_EOL . 'クラス：' . $this->order->castClass->name
                . PHP_EOL . '人数：' . $this->order->total_cast . '人'
                . PHP_EOL . '場所：' .  $this->order->address
                . PHP_EOL . '予定合計ポイント：' . number_format($this->order->temp_point) . ' Point'
                . PHP_EOL . '----'
                . PHP_EOL . 'お手数ですが、再度場所や時刻を変更してコールをし直してください。';

            $room = $notifiable->rooms()
                ->where('rooms.type', RoomType::SYSTEM)
                ->where('rooms.is_active', true)->first();
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $message,
                'system_type' => SystemMessageType::NORMAL
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        } else {
            $nominees = $this->order->nomineesWithTrashed()->first();
            $room = $this->createDirectRoom($this->order->user_id, $nominees->id);
            $roomMesage = '提案がキャンセルされました。';
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $roomMesage,
                'system_type' => SystemMessageType::NOTIFY
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        }

        $content = '残念ながらマッチングが成立しませんでした（；；）';

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        $pushId = 'g_12';

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
        if ($this->order->type != OrderType::NOMINATION) {
            $message = 'ご希望の人数のキャストが揃わなかったため、'
                . PHP_EOL . '下記の予約が無効となりました。'
                . PHP_EOL . '----'
                . PHP_EOL . '- キャンセル内容 -'
                . PHP_EOL . '日時：' . Carbon::parse($this->order->date . ' ' . $this->order->start_time)->format('Y/m/d H:i') . '~'
                . PHP_EOL . '時間：' . $this->order->duration . '時間'
                . PHP_EOL . 'クラス：' . $this->order->castClass->name
                . PHP_EOL . '人数：' . $this->order->total_cast . '人'
                . PHP_EOL . '場所：' .  $this->order->address
                . PHP_EOL . '予定合計ポイント：' . number_format($this->order->temp_point) . ' Point'
                . PHP_EOL . '----'
                . PHP_EOL . 'お手数ですが、再度場所や時刻を変更してコールをし直してください。';

            $room = $notifiable->rooms()
                ->where('rooms.type', RoomType::SYSTEM)
                ->where('rooms.is_active', true)->first();
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $message,
                'system_type' => SystemMessageType::NORMAL
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        } else {
            $nominees = $this->order->nomineesWithTrashed()->first();
            $room = $this->createDirectRoom($this->order->user_id, $nominees->id);
            $roomMesage = '提案がキャンセルされました。';
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $roomMesage,
                'system_type' => SystemMessageType::NOTIFY
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        }

        $content = 'ご希望の人数のキャストが揃わなかったため、予約が無効となりました。'
            . PHP_EOL . 'お手数ですが、下記の「今すぐキャストを呼ぶ」をタップし、キャストクラスを変更して再度コールをし直してください。';

        $page = env('LINE_LIFF_REDIRECT_PAGE') . '?page=call';

        return [
            [
                'type' => 'template',
                'altText' => $content,
                'text' => $content,
                'template' => [
                    'type' => 'buttons',
                    'text' => $content,
                    'actions' => [
                        [
                            'type' => 'uri',
                            'label' => '今すぐキャストを呼ぶ',
                            'uri' => "line://app/$page"
                        ]
                    ]
                ]
            ]
        ];
    }
}
