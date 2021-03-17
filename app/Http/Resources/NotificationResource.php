<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\Resource;

class NotificationResource extends Resource
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
            'type' => $this->type,
            'notifiable_id' => $this->notifiable_id,
            'notifiable_type' => $this->notifiable_type,
            'data' => $this->data,
            'read_at' => $this->read_at,
            'content' => $this->content,
            'send_from' => $this->send_from,
            'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i'),
            'updated_at' => Carbon::parse($this->updated_at)->format('Y-m-d H:i'),
        ]);
    }
}
