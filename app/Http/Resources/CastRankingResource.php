<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\Resource;

class CastRankingResource extends Resource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nickname' => $this->nickname,
            'fullname' => $this->fullname,
            'date_of_birth ' => $this->date_of_birth,
            'age' => $this->age,
            'avatars' => $this->avatars
        ];
    }
}
