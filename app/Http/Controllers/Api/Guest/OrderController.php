<?php

namespace App\Http\Controllers\Api\Guest;

use App\Enums\CastOrderStatus;
use App\Enums\OrderPaymentMethod;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentRequestStatus;
use App\Enums\PointType;
use App\Enums\UserType;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\OrderResource;
use App\Notifications\AutoChargeFailedLineNotify;
use App\Notifications\AutoChargeFailedWorkchatNotify;
use App\Notifications\OrderDirectTransferChargeFailed;
use App\Notifications\SkipOrderNomination;
use App\Order;
use App\Point;
use App\Services\LogService;
use App\Transfer;
use App\User;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class OrderController extends ApiController
{
    public function index(Request $request)
    {
        if ($request->status) {
            $listStatuses = explode(",", trim($request->status, ","));
        } else {
            $listStatuses = [
                OrderStatus::OPEN,
                OrderStatus::ACTIVE,
                OrderStatus::PROCESSING,
                OrderStatus::DENIED,
                OrderStatus::CANCELED
            ];
        }

        $user = $this->guard()->user();
        $orders = Order::whereIn('status', $listStatuses)
            ->where('user_id', $user->id)
            ->with(['user', 'casts', 'nominees', 'tags'])
            ->latest()
            ->paginate($request->per_page);

        return $this->respondWithData(OrderResource::collection($orders));
    }

    public function cancel($id)
    {
        $user = $this->guard()->user();

        $order = $user->orders()->find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        if (!in_array($order->status, [OrderStatus::OPEN, OrderStatus::ACTIVE])) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if (!$order->cancel()) {
            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('messages.cancel_order_success'));
    }

    public function pointSettlement(Request $request, $id)
    {
        $user = $this->guard()->user();
        $order = Order::where(function ($query) {
            $query->where('payment_status', OrderPaymentStatus::REQUESTING)
                ->orWhere('payment_status', OrderPaymentStatus::PAYMENT_FAILED);
        })->find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        if ($order && ($order->payment_method == OrderPaymentMethod::CREDIT_CARD)) {
            if (!$user->is_card_registered) {
                return response()->json(['success' => false], 400);
            }
        }

        $now = Carbon::now();
        try {
            DB::beginTransaction();
            $order->settle();
            $order->paymentRequests()->update(['status' => PaymentRequestStatus::CLOSED]);

            $order->payment_status = OrderPaymentStatus::PAYMENT_FINISHED;
            $order->paid_at = $now;
            $order->update();

            $adminId = User::where('type', UserType::ADMIN)->first()->id;

            $order = $order->load('paymentRequests');

            $paymentRequests = $order->paymentRequests;

            $receiveAdmin = 0;

            foreach ($paymentRequests as $paymentRequest) {
                $cast = $paymentRequest->cast;

                $receiveCast = round($paymentRequest->total_point * $cast->cost_rate);
                $receiveAdmin += round($paymentRequest->total_point * (1 - $cast->cost_rate));

                $this->createTransfer($order, $paymentRequest, $receiveCast);

                // receive cast
                $this->createPoint($receiveCast, $paymentRequest->cast_id, $order);
            }

            // receive admin
            $this->createPoint($receiveAdmin, $adminId, $order);

            DB::commit();

            return $this->respondWithNoData(trans('messages.payment_completed'));
        } catch (\Exception $e) {
            DB::rollBack();
            if ($e->getMessage() == 'Auto charge failed') {
                if (!in_array($order->payment_status, [OrderPaymentStatus::PAYMENT_FINISHED, OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED])) {
                    $order->payment_status = OrderPaymentStatus::PAYMENT_FAILED;
                    $order->save();
                    $delay = Carbon::now()->addSeconds(3);
                    $user->notify(new AutoChargeFailedWorkchatNotify($order));
                    $user->notify((new AutoChargeFailedLineNotify($order))->delay($delay));
                }
            }

            LogService::writeErrorLog($e);
            return $this->respondErrorMessage(trans('messages.payment_failed'));
        }
    }

    public function sendPushAlertMissingPoint(Request $request, $id)
    {
        $user = $this->guard()->user();
        $order = Order::findOrFail($id);

        if (!$order->send_warning) {
            $orderTotalPoint = $order->total_point - $order->discount_point;
            $user->notify(new OrderDirectTransferChargeFailed($order, $orderTotalPoint - $user->point));
            $order->send_warning = true;
            $order->save();
        }

        return $this->respondWithNoData('succeed');
    }

    private function createTransfer($order, $paymentRequest, $receiveCast)
    {
        $transfer = new Transfer;
        $transfer->order_id = $order->id;
        $transfer->user_id = $paymentRequest->cast_id;
        $transfer->amount = $receiveCast;
        $transfer->save();
    }

    private function createPoint($receive, $id, $order)
    {
        $user = User::find($id);

        $point = new Point;
        $point->point = $receive;
        $point->balance = $user->point + $receive;
        $point->user_id = $user->id;
        $point->order_id = $order->id;
        $point->type = PointType::RECEIVE;
        $point->status = true;
        $point->save();

        $user->point += $receive;
        $user->update();
    }

    public function skipOrderNominee($id)
    {
        $user = $this->guard()->user();
        $order = $user->orders()->find($id);
        $nominee = $order->nominees()->first();

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        if ($order->status != OrderStatus::OPEN || $order->type != OrderType::NOMINATION) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        try {
            $order->status = OrderStatus::SKIP_NOMINATION;
            $order->save();

            $order->nominees()->updateExistingPivot(
                $nominee->id,
                [
                    'status' => CastOrderStatus::TIMEOUT,
                ],
                false
            );

            $nominee->notify(new SkipOrderNomination($user));

            return $this->respondWithNoData(trans('messages.skip_order_noninee'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }
}
