<?php

namespace App\Notifications;

use App\Verification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use NotificationChannels\Twilio\TwilioChannel;
use NotificationChannels\Twilio\TwilioSmsMessage;

class SendVerificationCode extends Notification implements ShouldQueue
{
    use Queueable;

    public $verification;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($verificationId)
    {
        $this->verification = Verification::onWriteConnection()->findOrFail($verificationId);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [TwilioChannel::class];
    }

    public function toTwilio($notifiable)
    {
        return (new TwilioSmsMessage())
            ->content("[Cheers]認証コード：{$this->verification->code} \nこの番号をWebサイトの画面で入力してください。");
    }
}
