<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class ReceiptResource extends Resource
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
            'point_id' => $this->point_id,
            'date' => $this->date,
            'name' => $this->name,
            'content' => $this->content,
            'file' => $this->file,
            'img_file' => $this->img_file,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ]);
    }
}
