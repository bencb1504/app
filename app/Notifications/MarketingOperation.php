<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class MarketingOperation extends Notification implements ShouldQueue
{
    use Queueable;

    public $isDayFive;

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
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        $now = Carbon::now();
        $createdAt = Carbon::parse($notifiable->created_at);
        $dayFive = $createdAt->copy()->addDays(5)->startOfDay();
        $daySix = $createdAt->copy()->addDays(6)->endOfDay();
        if ($now->between($dayFive, $daySix)) {
            $this->isDayFive = $now->between($dayFive, $dayFive->copy()->endOfDay()) ? true : false;
            return [LineBotNotificationChannel::class];
        }

        return [];
    }

    public function lineBotPushData($notifiable)
    {
        if ($this->isDayFive) {
            $message = '【キャンペーン終了まで残り2日😳💦】'
                . PHP_EOL . 'Cheersにご登録いただいてから1週間以内のゲスト様限定で、1時間無料キャンペーンを実施中！✨'
                . PHP_EOL . PHP_EOL . '※予約方法は、コール予約、指名予約問いません。'
                . PHP_EOL . '2時間以上のご予約で1時間無料となります（最大11,000円OFF）'
                . PHP_EOL . PHP_EOL . '無料体験ができるのは今だけ！'
                . PHP_EOL . 'この機会にぜひご利用ください🌷'
                . PHP_EOL . 'キャンペーン中のため利用者が増えております。'
                . PHP_EOL . 'お早めのご予約がおすすめです！🙋‍♀️🌷'
                . PHP_EOL . PHP_EOL . '残り2日でキャンペーン対象外となりますのでお早めにご予約ください。'
                . PHP_EOL . PHP_EOL . 'ご不明点はメッセージ内の運営者チャットからご連絡ください！';
        } else {
            $message = '【本日最終日😣💦1時間無料キャンペーン】'
                . PHP_EOL . 'Cheersにご登録いただいてから1週間以内のゲスト様限定で、1時間無料キャンペーンを実施中です！✨'
                . PHP_EOL . PHP_EOL . '※予約方法は、コール予約、指名予約問いません。'
                . PHP_EOL . '2時間以上のご予約で1時間無料となります（※最大11,000円OFF）'
                . PHP_EOL . PHP_EOL . '予約時間が1分でも本日にかかっていれば、キャンペーン対象となります！🙌💓'
                . PHP_EOL . PHP_EOL . 'この最後のチャンスをお見逃しなく！'
                . PHP_EOL . PHP_EOL . 'ご不明点はメッセージ内の運営者チャットからご連絡ください！';
        }

        return [
            [
                'type' => 'text',
                'text' => $message,
            ],
        ];
    }
}
