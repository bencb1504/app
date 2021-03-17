<?php

namespace App\Traits;

use App\Room;
use App\Enums\RoomType;

trait DirectRoom
{
    public function createDirectRoom($ownerId, $userId)
    {
        $directRoom = Room::active()->where('type', RoomType::DIRECT)
            ->whereHas('users', function ($query) use ($ownerId) {
                $query->where('user_id', $ownerId);
            })
            ->whereHas('users', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->first();

        if (!$directRoom) {
            $room = new Room;
            $room->owner_id = $ownerId;
            $room->type = RoomType::DIRECT;
            $room->save();

            $room->users()->attach([$ownerId, $userId]);

            return $room;
        }

        return $directRoom;
    }
}
