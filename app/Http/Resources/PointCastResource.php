<?php

namespace App\Http\Resources;

use App\Traits\ResourceResponse;
use Auth;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\Resource;

class PointCastResource extends Resource
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
        $cast = Auth::user();
        
        $order = $this->whenLoaded('order');
        $paymentRequests = ($paymentRequestsTmp = $order->paymentRequests ?? []) ? $paymentRequestsTmp->first() : '';

        return $this->filterNull([
            'id' => $this->id,
            'cast_id' => $this->user_id,
            'guest_id' => $order->user_id ?? '',
            'order_id' => $this->order_id,
            'is_admin' => $this->is_adjusted ? 1 : 0,
            'order_time' => $paymentRequests ? $paymentRequests['order_time'] : '',
            'extra_time' => $paymentRequests ? $paymentRequests['extra_time'] : '',
            'order_point' => $paymentRequests ? round($cast->cost_rate * $paymentRequests['order_point']) : '',
            'extra_point' => $paymentRequests ? round($cast->cost_rate * $paymentRequests['extra_point']) : '',
            'allowance_point' => $paymentRequests ? round($cast->cost_rate * $paymentRequests['allowance_point']) : '',
            'fee_point' => $paymentRequests ? round($cast->cost_rate * $paymentRequests['fee_point']) : '',
            'total_point' => $paymentRequests ? round($cast->cost_rate * $paymentRequests['total_point']) : $this->point,
            'nickname' => $this->is_adjusted ? 'Cheers運営局' : $order->user->nickname,
            'type' => $this->type,
            'date' => $this->is_adjusted ? Carbon::parse($this->created_at)->format('Y-m-d') : Carbon::parse($order->date)->format('Y-m-d'),
            'status' => $paymentRequests['status'] ?? '',
            'order' => OrderResource::make($order),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ]);
    }
}
