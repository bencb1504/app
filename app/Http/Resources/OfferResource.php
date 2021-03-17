<?php

namespace App\Http\Resources;

use App\Cast;
use App\Http\Resources\CastClassResource;
use App\Http\Resources\CastResource;
use App\Repositories\CastClassRepository;
use App\Repositories\PrefectureRepository;
use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;

class OfferResource extends Resource
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
        $casts = Cast::whereIn('id', $this->cast_ids)->get();

        return $this->filterNull([
            'id' => $this->id,
            'prefecture_id' => $this->prefecture_id,
            'prefecture' => $this->prefecture_id ? app(PrefectureRepository::class)->find($this->prefecture_id)->name : '',
            'comment' => $this->comment,
            'date' => $this->date,
            'start_time_from' => $this->start_time_from,
            'start_time_to' => $this->start_time_to,
            'expired_date' => $this->expired_date,
            'duration' => $this->duration,
            'casts' => CastResource::collection($casts),
            'total_cast' => $this->total_cast,
            'temp_point' => $this->temp_point,
            'class_id' => $this->class_id,
            'cast_class' => CastClassResource::make(app(CastClassRepository::class)->find($this->class_id)),
            'status' => $this->status,
        ]);
    }
}
