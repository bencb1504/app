<?php

namespace App\Notifications;

use App\Services\RocketChat;
use Illuminate\Notifications\Notification;

class RocketChatNotificationChannel
{

    public function send($notifiable, Notification $notification)
    {
        $rocketChat = new RocketChat();

        $content = $notification->rocketChatPushData($notifiable);

        return $rocketChat->sendMessage($content);
    }
}