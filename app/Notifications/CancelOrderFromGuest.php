<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\ProviderType;
use App\Enums\UserType;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CancelOrderFromGuest extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;
    public $orderPoint;

    /**
     * Create a new notification instance.
     *
     * @param $order
     * @param null $orderPoint
     */
    public function __construct($order, $orderPoint = null)
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
        if ($notifiable->type == UserType::GUEST) {
            $content = '下記のご予約のキャンセルを承りました。'
                . PHP_EOL . '----'
                . PHP_EOL . '- キャンセル内容 -'
                . PHP_EOL . '日時：' . Carbon::parse($this->order->date . ' ' . $this->order->start_time)->format('Y/m/d H:i') . '~'
                . PHP_EOL . '時間：' . $this->order->duration . '時間'
                . PHP_EOL . 'クラス：' . $this->order->castClass->name
                . PHP_EOL . '人数：' . $this->order->total_cast . '人'
                . PHP_EOL . '場所：' . $this->order->address
                . PHP_EOL . '予定合計ポイント：' . number_format($this->orderPoint) . ' Point'
                . PHP_EOL . '----'
                . PHP_EOL . PHP_EOL . 'キャンセル規定は以下の通りとなっています。'
                . PHP_EOL . '該当期間内のキャンセルについては、キャンセル料が決済されます。'
                . PHP_EOL . '当日：予約時の金額100%'
                . PHP_EOL . '1日前：予約時の金額50%'
                . PHP_EOL . '2日前〜7日前：予約時の金額30%'
                . PHP_EOL . PHP_EOL . '※キャスト都合によるキャンセルの場合、キャンセル料金はいただきません。'
                . PHP_EOL . '※ご不明点がある場合は、こちらのチャットにて、ご返信くださいませ。';
            $pushId = 'g_9';
        } else {
            $content = '予約がキャンセルされました。';
            $pushId = 'c_9';
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
                        'order_id' => $this->order->id
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'order_id' => $this->order->id
                    ],
                ]
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $content = '下記のご予約のキャンセルを承りました。'
            . PHP_EOL . '----'
            . PHP_EOL . '▼キャンセル内容'
            . PHP_EOL . '日時：' . Carbon::parse($this->order->date . ' ' . $this->order->start_time)->format('Y/m/d H:i') . '~'
            . PHP_EOL . '時間：' . $this->order->duration . '時間'
            . PHP_EOL . 'クラス：' . $this->order->castClass->name
            . PHP_EOL . '人数：' . $this->order->total_cast . '人'
            . PHP_EOL . '場所：' . $this->order->address
            . PHP_EOL . '予定合計ポイント：' . number_format($this->orderPoint) . ' Point'
            . PHP_EOL . '----'
            . PHP_EOL . PHP_EOL . 'キャンセル規定は以下の通りとなっています。'
            . PHP_EOL . '該当期間内のキャンセルについては、キャンセル料が決済されます。'
            . PHP_EOL . '当日：予約時の金額100%'
            . PHP_EOL . '1日前：予約時の金額50%'
            . PHP_EOL . '2日前〜7日前：予約時の金額30%'
            . PHP_EOL . PHP_EOL . '※キャスト都合によるキャンセルの場合、キャンセル料金はいただきません。'
            . PHP_EOL . '※ご不明点がある場合は、こちらのチャットにて、ご返信くださいませ。';


        return [
            [
                'type' => 'text',
                'text' => $content
            ]
        ];
    }
}
