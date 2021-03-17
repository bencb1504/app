<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\Resource;

class RoomResource extends Resource
{
    use ResourceResponse;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->filterNull([
            'id' => $this->id,
            'order_id' => $this->order_id,
            'type' => $this->type,
            'is_active' => $this->is_active,
            'unread_count' => $this->unread_count,
            'users' => UserCollection::make($this->whenLoaded('users')),
            'latest_message' => new MessageResource($this->whenLoaded('latestMessage')),
            'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i'),
            'updated_at' => Carbon::parse($this->updated_at)->format('Y-m-d H:i'),
        ]);
    }
}
