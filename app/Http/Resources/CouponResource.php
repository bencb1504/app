<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class CouponResource extends Resource
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
            'name' => $this->name,
            'type' => $this->type,
            'point' => $this->point,
            'time' => $this->time,
            'percent' => $this->percent,
            'max_point' => $this->max_point,
            'note' => $this->note,
            'is_filter_after_created_date' => $this->is_filter_after_created_date,
            'filter_after_created_date' => $this->filter_after_created_date,
            'is_filter_order_duration' => $this->is_filter_order_duration,
            'filter_order_duration' => $this->filter_order_duration,
            'is_active' => $this->is_active,
            'sort_index' => $this->sort_index,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ]);
    }
}
