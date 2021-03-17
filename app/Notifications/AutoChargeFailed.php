<?php

namespace App\Notifications;

use App\Enums\UserType;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AutoChargeFailed extends Notification implements ShouldQueue
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
        return [LineBotNotificationChannel::class];
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
        $content = '決済が未完了です';

        return [
            'content' => $content,
            'send_from' => UserType::ADMIN,
        ];
    }

    public function lineBotPushData($notifiable)
    {

        $message = '※重要なメッセージです。必ずご確認くださいませ。'
            . PHP_EOL . 'クレジットカードにエラーが発生したため、自動決済に失敗しました。'
            . PHP_EOL . 'カード情報を更新してください。';

        $page = env('LINE_LIFF_REDIRECT_PAGE') . '?page=credit_card&order_id=' . $this->order->id;

        return [
            [
                'type' => 'template',
                'altText' => $message,
                'text' => $message,
                'template' => [
                    'type' => 'buttons',
                    'text' => $message,
                    'actions' => [
                        [
                            'type' => 'uri',
                            'label' => 'カード情報を更新する',
                            'uri' => "line://app/$page"
                        ]
                    ]
                ]
            ]
        ];
    }
}
