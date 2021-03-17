<?php

namespace App\Observers;

use App\Enums\MessageType;
use App\Enums\RoomType;
use App\Enums\UserType;
use App\Events\MessageCreated as BroadcastMessage;
use App\Message;
use App\Notifications\DirectMessageNotifyToLine;
use App\Notifications\MessageCreated;
use App\Notifications\MessageCreatedFromAdmin;
use App\Notifications\MessageCreatedLineNotify;
use App\Notifications\MessageCreatedNotifyToAdmin;
use App\User;
use Carbon\Carbon;

class MessageObserver
{
    public function created(Message $message)
    {
        $room = $message->room;
        if (MessageType::SYSTEM == $message->type || MessageType::LIKE == $message->type) {
            broadcast(new BroadcastMessage($message->id));
        }
        if (MessageType::SYSTEM != $message->type) {
            $users = $room->users->except([$message->user_id]);

            if (RoomType::DIRECT == $room->type) {
                $otherId = $room->owner_id == $room->users[0]->id ? $room->users[1]->id : $room->users[0]->id;
                if (!$room->checkBlocked($otherId)) {
                    if ($message->user_id != 1) {
                        \Notification::send($users, new MessageCreated($message->id));
                    }

                    $other = $users->first();
                    if ($other->line_user_id != null && $other->type == UserType::GUEST) {
                        if ($message->user_id != 1) {
                            $other->notify(new DirectMessageNotifyToLine($message->id));
                        }
                    }
                }
            } else {
                if (RoomType::SYSTEM != $room->type) {
                    if ($message->user_id != 1) {
                        \Notification::send($users, new MessageCreated($message->id));
                    }
                } else {
                    \Notification::send($users, new MessageCreated($message->id));
                }
            }
        }

        if (RoomType::SYSTEM != $room->type || !$message->is_manual) {
            \DB::table('message_recipient')
                ->where([
                    'user_id' => $message->user_id,
                    'room_id' => $message->room_id,
                ])->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        if (RoomType::SYSTEM == $room->type && $message->user_id != 1) {
            $delay = Carbon::now()->addSeconds(3);
            $admin = User::find(1);
            $admin->notify((new MessageCreatedNotifyToAdmin($room->id)));
            $admin->notify((new MessageCreatedLineNotify($room->id))->delay($delay));
        }

        if (RoomType::SYSTEM == $room->type && $message->user_id == 1 && $message->is_manual) {
            $user = $room->users->except([$message->user_id])->first();
            $user->notify(new MessageCreatedFromAdmin($room->id));
        }
    }
}
