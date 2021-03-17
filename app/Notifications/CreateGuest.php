<?php

namespace App\Notifications;

use App\Enums\DeviceType;
use App\Enums\MessageType;
use App\Enums\ProviderType;
use App\Enums\SystemMessageType;
use App\Enums\UserType;
use App\Room;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Storage;

class CreateGuest extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
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
     * @param  mixed $notifiable
     */
    public function toMail($notifiable)
    {
        return;
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [];
    }

    public function pushData($notifiable)
    {
        $content = 'ようこそCheersへ！'
            . PHP_EOL . 'Cheersはプライベートでの飲み会や接待など様々なシーンにキャストを呼べるギャラ飲みマッチングアプリです。'
            . PHP_EOL . PHP_EOL . '面接通過率25%のクオリティの高いキャストと今すぐ出会えるのはCheersだけ！'
            . PHP_EOL . PHP_EOL . '呼びたいときに、呼びたい人数・場所を入力するだけ。'
            . PHP_EOL . '最短30分でキャストがゲストの元に駆けつけます♪'
            . PHP_EOL . PHP_EOL . '「探す」からお気に入りのキャストを見つけてアピールすることも可能です！'
            . PHP_EOL . PHP_EOL . 'まずはHomeの「キャストを呼ぶ」からキャストを呼んで素敵な時間をお過ごし下さい♪'
            . PHP_EOL . PHP_EOL . 'ご不明点はお気軽にお問い合わせください。';

        $room = Room::create([
            'owner_id' => $notifiable->id
        ]);

        $room->users()->attach([1, $notifiable->id]);
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
        ]);
        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        $this->limitedMessages($notifiable, $room);

        $namedUser = 'user_' . $notifiable->id;
        $send_from = UserType::ADMIN;
        $pushId = 'g_1';

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
                        'room_id' => $room->id
                    ],
                ],
                'android' => [
                    'alert' => $content,
                    'extra' => [
                        'push_id' => $pushId,
                        'send_from' => $send_from,
                        'room_id' => $room->id
                    ],
                ]
            ],
        ];
    }

    public function lineBotPushData($notifiable)
    {
        $content = 'ようこそCheersへ！'
            . PHP_EOL . 'Cheersはプライベートでの飲み会や接待など様々なシーンにキャストを呼べるギャラ飲みマッチングアプリです。'
            . PHP_EOL . PHP_EOL . '面接通過率25%のクオリティの高いキャストと今すぐ出会えるのはCheersだけ！'
            . PHP_EOL . PHP_EOL . '呼びたいときに、呼びたい人数・場所を入力するだけ。'
            . PHP_EOL .'最短30分でキャストがゲストの元に駆けつけます♪'
            . PHP_EOL . PHP_EOL . '「探す」からお気に入りのキャストを見つけてアピールすることも可能です！'
            . PHP_EOL . PHP_EOL . 'まずはHomeの「キャストを呼ぶ」からキャストを呼んで素敵な時間をお過ごし下さい♪'
            . PHP_EOL . PHP_EOL . 'ご不明点はお気軽にお問い合わせください。';

        $room = Room::create([
            'owner_id' => $notifiable->id
        ]);

        $room->users()->attach([1, $notifiable->id]);
        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'message' => $content,
            'system_type' => SystemMessageType::NORMAL,
        ]);

        $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

        $messages = $this->limitedLineMessage();

        return $messages;
    }

    private function limitedMessages($notifiable, $room)
    {
        $limitedStartTime = Carbon::parse(env('CAMPAIGN_FROM'))->startOfDay();
        $limitedEndTime = Carbon::parse(env('CAMPAIGN_TO'))->endOfDay();
        $now = Carbon::now()->startOfDay();
        if ($now->between($limitedStartTime, $limitedEndTime)) {
            $opContent = '【新規ユーザー様限定！ギャラ飲み1時間無料🥂💕】'
                . PHP_EOL . PHP_EOL . 'Cheersにご登録いただいてから1週間以内のゲスト様限定で、1時間無料キャンペーンを実施中！✨'
                . PHP_EOL . PHP_EOL . '※予約方法は、コール予約、指名予約問いません。'
                . PHP_EOL . '2時間以上のご予約で1時間無料となります（最大11,000円OFF）'
                . PHP_EOL . PHP_EOL . 'ギャラ飲み初めての方も安心！'
                . PHP_EOL . 'Cheersのキャストが盛り上げます🙋‍♀️❤️'
                . PHP_EOL . PHP_EOL . 'ご登録から1週間を超えてしまうとキャンペーン対象外となりますのでお早めにご予約ください。'
                . PHP_EOL . PHP_EOL . 'ご不明点はメッセージ内の運営者チャットからご連絡ください！';

            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $opContent,
                'system_type' => SystemMessageType::NORMAL,
                'created_at' => now()->copy()->addSeconds(1)
            ]);
            $roomMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

            $pricesSrc = Storage::url('add_friend_price_063112.png');
            $bannerSrc = Storage::url('add_friend_banner_063112.jpg');

            if (!@getimagesize($pricesSrc)) {
                $fileContents = Storage::disk('local')->get("system_images/add_friend_price_063112.png");
                $fileName = 'add_friend_price_063112.png';
                Storage::put($fileName, $fileContents, 'public');
            }
            if (!@getimagesize($bannerSrc)) {
                $fileContents = Storage::disk('local')->get("system_images/add_friend_banner_063112.jpg");
                $fileName = 'add_friend_banner_063112.jpg';
                Storage::put($fileName, $fileContents, 'public');
            }

            $priceImgMessge = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::IMAGE,
                'image' => 'add_friend_price_063112.png',
                'system_type' => SystemMessageType::NORMAL,
                'created_at' => now()->copy()->addSeconds(2)
            ]);
            $priceImgMessge->recipients()->attach($notifiable->id, ['room_id' => $room->id]);

            $bannerImgMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::IMAGE,
                'image' => 'add_friend_banner_063112.jpg',
                'system_type' => SystemMessageType::NORMAL,
                'created_at' => now()->copy()->addSeconds(3)
            ]);
            $bannerImgMessage->recipients()->attach($notifiable->id, ['room_id' => $room->id]);
        }
    }

    private function limitedLineMessage()
    {
        $now = Carbon::now()->startOfDay();
        $limitedMessageFromDate = Carbon::parse(env('CAMPAIGN_FROM'))->startOfDay();
        $limitedMessageToDate = Carbon::parse(env('CAMPAIGN_TO'))->endOfDay();
        if ($now->between($limitedMessageFromDate, $limitedMessageToDate)) {

            $pricesSrc = Storage::url('add_friend_price_063112.png');
            $bannerSrc = Storage::url('add_friend_banner_063112.jpg');
            if (!@getimagesize($pricesSrc)) {
                $fileContents = Storage::disk('local')->get("system_images/add_friend_price_063112.png");
                $fileName = 'add_friend_price_063112.png';
                Storage::put($fileName, $fileContents, 'public');
            }
            if (!@getimagesize($bannerSrc)) {
                $fileContents = Storage::disk('local')->get("system_images/add_friend_banner_063112.jpg");
                $fileName = 'add_friend_banner_063112.jpg';
                Storage::put($fileName, $fileContents, 'public');
            }

            $message = '【新規ユーザー様限定！ギャラ飲み1時間無料🥂💕】'
                . PHP_EOL . PHP_EOL . 'Cheersにご登録いただいてから1週間以内のゲスト様限定で、1時間無料キャンペーンを実施中！✨'
                . PHP_EOL . PHP_EOL . '※予約方法は、コール予約、指名予約問いません。'
                . PHP_EOL . '2時間以上のご予約で1時間無料となります（最大11,000円OFF）'
                . PHP_EOL . PHP_EOL . 'ギャラ飲み初めての方も安心！'
                . PHP_EOL . 'Cheersのキャストが盛り上げます🙋‍♀️❤️'
                . PHP_EOL . PHP_EOL . 'ご登録から1週間を超えてしまうとキャンペーン対象外となりますのでお早めにご予約ください。'
                . PHP_EOL . PHP_EOL . 'ご不明点はメッセージ内の運営者チャットからご連絡ください！';
            $opMessages = [
                [
                    'type' => 'text',
                    'text' => $message
                ],
                [
                    'type' => 'image',
                    'originalContentUrl' => $pricesSrc,
                    'previewImageUrl' => $pricesSrc

                ],
                [
                    'type' => 'image',
                    'originalContentUrl' => $bannerSrc,
                    'previewImageUrl' => $bannerSrc
                ]
            ];

            return $opMessages;
        }

        return [];
    }
}
