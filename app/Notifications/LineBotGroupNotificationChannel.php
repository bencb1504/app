<?php

namespace App\Notifications;

use App\Services\Line;
use Illuminate\Notifications\Notification;

class LineBotGroupNotificationChannel
{

    public function send($notifiable, Notification $notification)
    {
        if (env('LINE_GROUP_ID')) {
            $data = $notification->lineBotPushToGroupData($notifiable);

            $accessToken = env('LINE_BOT_NOTIFY_CHANNEL_ACCESS_TOKEN');
            $pushTo = env('LINE_GROUP_ID');
            $lineBot = new Line($accessToken);
            return $lineBot->push($pushTo, $data);
        }

        return;
    }
}