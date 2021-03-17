<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class MessageResource extends Resource
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
            'room_id' => $this->room_id,
            'user_id' => $this->user_id,
            'order_id' => $this->order_id,
            'offer_id' => $this->offer_id,
            'user' => UserResource::make($this->user),
            'message' => $this->message,
            'image' => $this->image,
            'thumbnail' => $this->thumbnail,
            'type' => $this->type,
            'system_type' => $this->system_type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'missing_point' => $this->missing_point,
            'cast_order_id' => $this->cast_order_id,
        ]);
    }
}
