<?php

namespace App\Http\Controllers\Api\Guest;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CouponResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Coupon;

class CouponController extends ApiController
{
    public function getCoupons(Request $request)
    {
        $rules = [
            'duration' => 'numeric',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $params = $request->only([
            'duration',
        ]);

        $user = $this->guard()->user();
        $coupons = Coupon::query();
        $coupons = $coupons->whereDoesntHave('users', function($q) use ($user) {
            $q->where('user_id', '=', $user->id);
        });

        if (isset($params['duration'])) {
            $coupons = $coupons->where(function($q) use ($params) {
                $q->where([
                    ['is_filter_order_duration', '=', true],
                    ['filter_order_duration', '<=', $params['duration']],
                ])->orWhere(function($sq) {
                    $sq->where('is_filter_order_duration', false)->orWhere('is_filter_order_duration', null);
                });
            });
        } else {
            $coupons = $coupons->where(function($q) {
                $q->where('is_filter_order_duration', false)->orWhere('is_filter_order_duration', null);
            });
        }

        $coupons = $coupons->where('is_active', true)->orderBy('sort_index')->get();
        
        $now = now();
        $collection = $coupons->reject(function ($item) use ($user, $now) {
            $createdAtOfUser = Carbon::parse($user->created_at);

            $bool = false;
            if ($item->is_filter_after_created_date && $item->filter_after_created_date >= 0) {
                if ($now->diffInDays($createdAtOfUser) > $item->filter_after_created_date) {
                    $bool = true;
                }
            }

            return $bool;
        })->values();

        return $this->respondWithData(CouponResource::collection($collection));

    }
}
