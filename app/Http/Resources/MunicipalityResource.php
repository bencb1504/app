<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class MunicipalityResource extends Resource
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
            'code' => $this->code,
            'name' => $this->name,
            'name_kana' => $this->name_kana,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ]);
    }
}
