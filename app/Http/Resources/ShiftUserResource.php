<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ShiftUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'user_id' => $this->user_id,
            'shift_id' => $this->shift_id,
            'day_shift' => $this->day_shift,
            'night_shift' => $this->night_shift,
            'off_shift' => $this->off_shift
        ];
    }
}
