<?php

namespace App\Notifications;

use App\Cast;
use App\Enums\DeviceType;
use App\Enums\NotificationScheduleSendTo;
use App\Enums\ProviderType;
use App\Enums\UserType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $schedule;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($schedule)
    {
        $this->schedule = $schedule;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        if ($notifiable->provider == ProviderType::LINE) {
            if ($notifiable->type == UserType::GUEST && $notifiable->device_type == null) {
                return [CustomDatabaseChannel::class, LineBotNotificationChannel::class];
            }

            if ($notifiable->type == UserType::CAST && $notifiable->device_type == null) {
                return [CustomDatabaseChannel::class, PushNotificationChannel::class];
            }

            if ($this->schedule->send_to == NotificationScheduleSendTo::ALL) {
                if ($notifiable->device_type == DeviceType::WEB) {
                    return [CustomDatabaseChannel::class, LineBotNotificationChannel::class];
                } else {
                    return [CustomDatabaseChannel::class, PushNotificationChannel::class];
                }
            }

            if ($notifiable->device_type == DeviceType::WEB && $this->schedule->send_to == NotificationScheduleSendTo::WEB) {
                return [CustomDatabaseChannel::class, LineBotNotificationChannel::class];
            }

            if ($notifiable->type == UserType::GUEST && $notifiable->device_type == DeviceType::IOS && $this->schedule->send_to == NotificationScheduleSendTo::WEB) {
                return [CustomDatabaseChannel::class, LineBotNotificationChannel::class];
            }

            if ($notifiable->type == UserType::GUEST && $notifiable->device_type == DeviceType::IOS && $this->schedule->send_to == NotificationScheduleSendTo::ANDROID) {
                return [CustomDatabaseChannel::class, PushNotificationChannel::class];
            }

            if ($notifiable->device_type == DeviceType::WEB && $this->schedule->send_to != NotificationScheduleSendTo::WEB) {
                return [];
            }

            if ($notifiable->device_type == DeviceType::IOS && $this->schedule->send_to != NotificationScheduleSendTo::IOS) {
                return [];
            }

            if ($notifiable->device_type == DeviceType::ANDROID && $this->schedule->send_to != NotificationScheduleSendTo::ANDROID) {
                return [];
            }

            return [CustomDatabaseChannel::class, PushNotificationChannel::class];
        } else {
            if ($notifiable->device_type != DeviceType::WEB && $this->schedule->send_to != NotificationScheduleSendTo::WEB) {
                return [CustomDatabaseChannel::class, PushNotificationChannel::class];
            }

            return [];
        }
    }

    public function toArray($notifiable)
    {
        $schedule = $this->schedule;
        $content = $schedule->content;
        $send_from = UserType::ADMIN;
        $bool = false;
        if (($notifiable->device_type == DeviceType::IOS && $this->schedule->send_to == NotificationScheduleSendTo::IOS)) {
            $bool = true;
        }

        if (($notifiable->device_type == DeviceType::ANDROID && $this->schedule->send_to == NotificationScheduleSendTo::ANDROID)) {
            $bool = true;
        }

        if (($notifiable->device_type == DeviceType::WEB && $this->schedule->send_to == NotificationScheduleSendTo::WEB)) {
            $bool = true;
        }

        if ($notifiable->device_type == null) {
            $bool = true;
        }

        if ($this->schedule->send_to == NotificationScheduleSendTo::ALL) {
            $bool = true;
        }

        if ($bool) {
            return [
                'title' => $schedule->title,
                'content' => $content,
                'send_from' => $send_from,
            ];
        }

        return [];
    }

    public function pushData($notifiable)
    {
        $schedule = $this->schedule;
        $content = $schedule->title;

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;

        $scheduleSendTo = $schedule->send_to;
        if ($scheduleSendTo == NotificationScheduleSendTo::IOS) {
            $devices = ['ios'];
        } elseif ($scheduleSendTo == NotificationScheduleSendTo::ANDROID) {
            $devices = ['android'];
        } else {
            $devices = ['android', 'ios'];
        }

        return [
            'devices' => $devices,
            'audienceOptions' => ['named_user' => $namedUser],
            'notificationOptions' => [
                'alert' => $content,
                'ios' => [
                    'alert' => $content,
                    'sound' => 'cat.caf',
                    'badge' => '+1',
                    'content-available' => true,
                    'extra' => [
                        'send_from' => $send_from,
                        'push_id' => 'a_1'
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'send_from' => $send_from,
                        'push_id' => 'a_1'
                    ],
                ],
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $content = $this->schedule->content;
        $linkArray = linkExtractor($content);
        $content = removeHtmlTags($content);
        if ($content) {
            $pushData = [
                [
                    'type' => 'text',
                    'text' => $content,
                ]
            ];
        } else {
            $pushData = [];
        }

        if ($linkArray) {
            foreach ($linkArray as $link) {
                $pushData[] = [
                    'type' => 'image',
                    'originalContentUrl' => $link,
                    'previewImageUrl' => $link
                ];
            }
        }

        if ($this->imageCarouselMessage()) {
            $pushData[] = $this->imageCarouselMessage();
        }

        return $pushData;
    }

    private function imageCarouselMessage()
    {
        if ($this->schedule->cast_ids) {
            $castIds = array_filter($this->schedule->cast_ids);
            if (env('ENABLE_LINE_IMAGE_CAROUSEL') && $castIds) {
                $castIdStr = implode(',', $castIds);
                $columns = [];
                $page = env('LINE_LIFF_REDIRECT_PAGE') . '?page=cast&cast_id=';
                $casts = Cast::whereIn('id', array_filter($castIds))->orderByRaw(\DB::raw("FIELD(id, $castIdStr)"))->get();
                foreach ($casts as $item) {
                    if ($item->avatars->first()) {
                        $path = $item->avatars->first()->path;
                    } else {
                        $path = url('/assets/web/images/gm1/ic_default_avatar@3x.png');
                    }
                    $columns[] = [
                        'imageUrl' => $path,
                        'action' => [
                            'type' => 'uri',
                            'label' => 'プロフィールを見る',
                            'uri' => "line://app/$page" . $item->id
                        ]
                    ];
                }

                if ($columns) {
                    return [
                        'type' => 'template',
                        'altText' => 'Cheersで会える女性を写真でご紹介！本日以降のご予約も可能です！',
                        'template' => [
                            'type' => 'image_carousel',
                            'columns' => $columns
                        ]
                    ];
                }

                return [];

            }
        }


        return [];
    }
}
