<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\Resource;

class TimeLineResource extends Resource
{
    use ResourceResponse;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->filterNull([
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'content' => $this->content,
            'image' => $this->image,
            'location' => $this->location,
            'hidden' => (int)$this->hidden,
            'total_favorites' => $this->count_favorites,
            'is_favourited' => $this->is_favourited,
            'user' => new UserResource($this->user),
            'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i'),
            'updated_at' => Carbon::parse($this->updated_at)->format('Y-m-d H:i'),
        ]);
    }
}
