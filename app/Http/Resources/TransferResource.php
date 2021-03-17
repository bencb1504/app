<?php

namespace App\Http\Resources;

use App\Enums\PointType;
use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
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
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,
            'amount' => $this->point,
            'status' => $this->status,
            'transfered_at' => $this->updated_at,
            'user' => UserResource::make($this->whenLoaded('user')),
            'order' => OrderResource::make($this->whenLoaded('order')),
        ]);
    }
}
