<?php

namespace App\Http\Controllers\Api\Guest;

use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OrderResource;
use App\Notifications\PaymentRequestUpdate;
use App\Notifications\PaymentRequestUpdateLineNotify;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PaymentRequestController extends ApiController
{
    public function payment(Request $request, $id)
    {
        $user = $this->guard()->user();
        $order = $user->orders()->where('orders.id', $id)->first();

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

//        if (OrderPaymentStatus::REQUESTING != $order->payment_status) {
//            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
//        }
        try {
            $delay = Carbon::now()->addSeconds(3);
            $order->payment_status = OrderPaymentStatus::EDIT_REQUESTING;
            $order->save();
            $user->notify(new PaymentRequestUpdate($order));
            $user->notify((new PaymentRequestUpdateLineNotify($order))->delay($delay));

            return $this->respondWithData(OrderResource::make($order));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    public function getPaymentRequest(Request $request, $id)
    {
        $user = $this->guard()->user();
        $order = $user->orders()->withTrashed()->with('casts')->where('orders.id', $id)->first();

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        if (!in_array($order->status, [OrderStatus::DONE, OrderStatus::CANCELED]) || !$order->payment_status || !$order->paymentRequests->count()) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if ($order->status == OrderStatus::CANCELED) {
            $order->load('canceledCasts');
            $order->is_canceled = true;
        }

        $order->load('paymentRequests.cast');

        return $this->respondWithData(OrderResource::make($order));
    }
}
