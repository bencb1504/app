<?php

namespace App\Notifications;

use App\Verification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use NotificationChannels\Twilio\TwilioCallMessage;
use NotificationChannels\Twilio\TwilioChannel;

class VoiceCallVerification extends Notification implements ShouldQueue
{
    use Queueable;

    public $verification;

    /**
     * Create a new notification instance.
     *
     * @param $verificationId
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
        $url = route('voice_code', ['code' => $this->verification->code, 'phone' => $this->verification->phone]);
        return (new TwilioCallMessage())
            ->url($url)->method('GET');
    }
}
