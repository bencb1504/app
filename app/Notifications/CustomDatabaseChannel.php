<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class CustomDatabaseChannel
{
    public function send($notifiable, Notification $notification)
    {
        $data = $notification->toArray($notifiable);

        if (!empty($data)) {
            return $notifiable->routeNotificationFor('database')->create([
                'id' => $notification->id,
                'type' => get_class($notification),
                'content' => $data['content'],
                'data' => $data,
                'read_at' => null,
                'send_from' => $data['send_from'],
            ]);
        }

        return;
    }

}
