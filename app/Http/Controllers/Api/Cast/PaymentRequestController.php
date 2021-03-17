<?php

namespace App\Http\Controllers\Api\Cast;

use App\Enums\CastOrderStatus;
use App\Enums\PaymentRequestStatus;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\PaymentRequestResource;
use App\Order;
use App\PaymentRequest;
use App\Services\LogService;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class PaymentRequestController extends ApiController
{
    public function payment(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $user = $this->guard()->user();
        $cast = $order->casts()
            ->where([
                ['cast_order.status', CastOrderStatus::DONE],
                ['user_id', $user->id],
                ['order_id', $id],
            ])
            ->whereNotNull('stopped_at')->get();

        if (!$cast) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        $paymentRequest = PaymentRequest::where([
            ['order_id', $id],
            ['cast_id', $user->id],
        ])->with('order.casts')->first();

        return $this->respondWithData(PaymentRequestResource::make($paymentRequest));
    }

    public function createPayment(Request $request, $id)
    {
        $rules = [
            'extra_time' => 'numeric',
            'started_at' => 'date_format:Y-m-d H:i',
            'stopped_at' => 'date_format:Y-m-d H:i'
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $cast = $order->casts()
            ->where([
                ['user_id', $user->id],
                ['order_id', $id],
                ['cast_order.status', CastOrderStatus::DONE],
            ])
            ->with('castClass')->first();

        $paymentRequest = $order->paymentRequests()->where([
            ['cast_id', $user->id],
            ['order_id', $id],
            ['payment_requests.status', PaymentRequestStatus::OPEN],
        ])->first();

        if (!$cast || !$paymentRequest) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        try {
            if (isset($request->extra_time)) {
                DB::beginTransaction();
                if ($request->started_at && $request->stopped_at) {
                    $castStartTime = Carbon::parse($request->started_at);
                    $stoppedAt = Carbon::parse($request->stopped_at);
                    $extraTime = $order->extraTime($castStartTime, $stoppedAt);
                } else {
                    $castStartTime = Carbon::parse($cast->pivot->started_at);
                    $stoppedAt = $castStartTime->copy()->addMinutes($order->duration * 60)->addMinutes($request->extra_time);
                    $extraTime = $request->extra_time;
                }

                if ($order->total_cast == 1) {
                    $order->actual_started_at = $castStartTime;
                    $order->actual_ended_at = $stoppedAt;
                    $order->save();
                }

                $extraPoint = $order->extraPoint($cast, $extraTime);
                $feePoint = $order->orderFee($cast, $castStartTime, $stoppedAt);

                $nightTime = $order->nightTime($stoppedAt);
                $allowance = $order->allowance($nightTime);
                $totalPoint = $paymentRequest->order_point + $allowance + $feePoint + $extraPoint;
                $paymentRequest->allowance_point = $allowance;
                $paymentRequest->extra_time = $extraTime;
                $paymentRequest->extra_point = $extraPoint;
                $paymentRequest->fee_point = $feePoint;
                $paymentRequest->total_point = $totalPoint;
                $paymentRequest->status = PaymentRequestStatus::UPDATED;

                $order->casts()->updateExistingPivot(
                    $user->id,
                    [
                        'extra_time' => $extraTime,
                        'total_point' => $totalPoint,
                        'night_time' => $nightTime,
                        'extra_point' => $extraPoint,
                        'fee_point' => $feePoint,
                        'allowance_point' => $allowance,
                        'started_at' => $castStartTime,
                        'stopped_at' => $stoppedAt,
                    ],
                    false
                );

                if ($order->total_cast > 1) {
                    $orderStartedtAt = Carbon::parse($order->actual_started_at);
                    $orderStoppedAt = Carbon::parse($order->actual_ended_at);
                    $casts = $order->casts;
                    foreach ($casts as $cast) {
                        $castStartTime = Carbon::parse($cast->pivot->started_at);
                        $castStoppedAt = Carbon::parse($cast->pivot->stopped_at);

                        if ($orderStartedtAt > $castStartTime) {
                            $order->actual_started_at = $castStartTime;
                            $order->save();
                        }
                        if ($orderStoppedAt < $castStoppedAt) {
                            $order->actual_ended_at = $castStoppedAt;
                            $order->save();
                        }
                    }
                }

                DB::commit();
            } else {
                $paymentRequest->status = PaymentRequestStatus::REQUESTED;
            }

            $paymentRequest->save();
            $paymentRequest->load('order.casts');

            return $this->respondWithData(PaymentRequestResource::make($paymentRequest));
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    public function getPaymentHistory(Request $request)
    {
        $user = $this->guard()->user();

        $paymentRequests = PaymentRequest::where('cast_id', $user->id)->with('order.casts');

        $nickName = $request->nickname;
        if ($nickName) {
            $paymentRequests->whereHas('guest', function ($query) use ($nickName) {
                $query->where('users.nickname', 'like', "%$nickName%");
            });
        }
        $paymentRequests = $paymentRequests->latest()->paginate($request->per_page)->appends($request->query());

        return $this->respondWithData(PaymentRequestResource::collection($paymentRequests));
    }
}
