<?php

namespace App\Http\Resources;

use App\Http\Resources\CastClassResource;
use App\Repositories\CastClassRepository;
use App\Repositories\PrefectureRepository;
use App\Traits\ResourceResponse;
use Illuminate\Http\Resources\Json\Resource;
use Illuminate\Support\Facades\Auth;

class OrderResource extends Resource
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
        $cast = Auth::user();
        $isCast = $cast->is_cast;

        return $this->filterNull([
            'id' => $this->id,
            'user_id' => $this->user_id,
            'offer_id' => $this->offer_id,
            'prefecture_id' => $this->prefecture_id,
            'prefecture' => $this->prefecture_id ? app(PrefectureRepository::class)->find($this->prefecture_id)->name : '',
            'address' => $this->address,
            'date' => $this->date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration' => $this->duration,
            'extra_time' => $this->extra_time,
            'night_time' => $this->night_time,
            'total_time' => $this->total_time,
            'total_cast' => $this->total_cast,
            'temp_point' => $this->when($isCast, round($this->temp_point * $cast->cost_rate), $this->temp_point),
            'total_point' => $this->when($isCast, round($this->total_point * $cast->cost_rate), $this->total_point),
            'class_id' => $this->class_id,
            'cast_class' => CastClassResource::make(app(CastClassRepository::class)->find($this->class_id)),
            'type' => $this->type,
            'status' => $this->status,
            'actual_started_at' => $this->actual_started_at,
            'actual_ended_at' => $this->actual_ended_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'casts' => $this->when(true == $this->is_canceled, UserCollection::make($this->whenLoaded('canceledCasts')), UserCollection::make($this->whenLoaded('casts'))),
            'payment_requests' => PaymentRequestResource::collection($this->whenLoaded('paymentRequests')),
            'nominees' => UserCollection::make($this->whenLoaded('nominees')),
            'user' => new UserResource($this->user),
            'is_nominated' => $this->isNominated(),
            'user_status' => $this->user_status,
            'room_id' => $this->room_id,
            'payment_status' => $this->payment_status,
            'cancel_fee_percent' => $this->cancel_fee_percent,
            'payment_requested_at' => $this->payment_requested_at,
            'paid_at' => $this->paid_at,
            'call_point' => $this->when($isCast, round($this->call_point * $cast->cost_rate), $this->call_point),
            'nominee_point' => $this->when($isCast, round($this->nominee_point * $cast->cost_rate), $this->nominee_point),
            'deleted_at' => $this->deleted_at,
            'coupon_id' => $this->coupon_id,
            'coupon_name' => $this->coupon_name,
            'coupon_type' => $this->coupon_type,
            'coupon_value' => $this->coupon_value,
            'coupon_max_point' => $this->coupon_max_point,
            'discount_point' => $this->discount_point,
            'payment_method' => $this->payment_method,
            'cast_offer_id' => $this->cast_offer_id,
        ]);
    }
}
