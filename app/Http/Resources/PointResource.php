<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class PointResource extends Resource
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
            'point' => $this->point,
            'user_id' => $this->user_id,
            'order_id' => $this->order_id,
            'is_autocharge' => $this->is_autocharge,
            'type' => $this->type,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'receipt' => ReceiptResource::make($this->whenLoaded('receipt')),
            'order' => OrderResource::make($this->whenLoaded('order')),
        ]);
    }
}
