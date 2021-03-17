<?php

namespace App\Notifications;

use App\Services\Line;
use Illuminate\Notifications\Notification;

class LineBotNotificationChannel
{

    public function send($notifiable, Notification $notification)
    {
        $lineBot = new Line();

        $data = $notification->lineBotPushData($notifiable);
        if ($data) {
            return $lineBot->push($notifiable->line_user_id, $data);
        }

        return;
    }
}