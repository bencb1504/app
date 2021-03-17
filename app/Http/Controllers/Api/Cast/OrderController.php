<?php

namespace App\Http\Controllers\Api\Cast;

use App\Cast;
use App\CastClass;
use App\Enums\CastClassType;
use App\Enums\CastOrderStatus;
use App\Enums\MessageType;
use App\Enums\OrderScope;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\UserType;
use App\Events\MessageCreated;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\MessageResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PaymentRequestResource;
use App\Message;
use App\Order;
use App\Services\LogService;
use App\Traits\DirectRoom;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class OrderController extends ApiController
{
    use DirectRoom;

    public function index(Request $request)
    {
        $rules = [
            'scope' => 'numeric|in:1,2',
            'status' => 'numeric|min:1|max:7',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        $orders = Order::with('user', 'tags');

        if (isset($request->scope)) {
            if (OrderScope::OPEN_TODAY == $request->scope) {
                $today = Carbon::today();
                $orders->whereDate('date', $today);
            } else {
                $tomorow = Carbon::tomorrow();
                $orders->whereDate('date', '>=', $tomorow);
            }



            $orders->where(function ($query) use ($user) {
                $query->whereDoesntHave('nominees', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->whereDoesntHave('casts', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
            })
                ->where(function ($query) {
                    $query->where('type', OrderType::CALL)
                        ->orWhere(function ($query) {
                            $query->where('type', OrderType::HYBRID)
                                ->where('is_changed', true);
                        });
                })
                ->where('status', OrderStatus::OPEN)

                ->orderBy('date')
                ->orderBy('start_time');

            if ($user->class_id == CastClassType::PLANTIUM) {
                $orders->whereIn('class_id', [CastClassType::BRONZE, CastClassType::PLANTIUM]);
            } else {
                $orders->where('class_id', $user->class_id);
            }
        } elseif (isset($request->status)) {
            $orders->where(function ($query) use ($user) {
                $query->whereHas('nominees', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
            });

            $orders->where('status', $request->status)->latest();
        } else {
            $orders->where('status', '!=', OrderStatus::DONE)
                ->where(function ($query) use ($user) {
                    $query->whereHas('nominees', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    });
                    $query->orWhereHas('candidates', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    });
                })
                ->latest();
        }

        $now = now();
        $orders = $orders->where(function($query) use ($now) {
            $query->whereNull('canceled_at')
                ->orWhere('canceled_at', '>', $now->subDays(1));
        })->paginate($request->per_page)->appends($request->query());

        return $this->respondWithData(OrderResource::collection($orders));
    }

    public function deny($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        if (OrderType::NOMINATION == $order->type) {
            $validStatus = [
                OrderStatus::OPEN,
                OrderStatus::ACTIVE,
            ];

            if (!in_array($order->status, $validStatus)) {
                return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
            }
        } else {
            if (OrderStatus::OPEN != $order->status && (1 != $order->total_cast || OrderStatus::ACTIVE != $order->status)) {
                return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
            }
        }

        $user = $this->guard()->user();

        $castExists = $order->castOrder()->where('user_id', $user->id)->whereNull('canceled_at')->first();

        if (!$castExists) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if (OrderStatus::OPEN == $order->status) {
            if (!$order->deny($user->id)) {
                return $this->respondServerError();
            }
        } else {
            if (!$order->denyAfterActived($user->id)) {
                return $this->respondServerError();
            }
        }

        $order = $order->fresh();

        return $this->respondWithData(OrderResource::make($order));
    }

    public function validTimeOrder($user, $order)
    {
        $startTime = Carbon::parse($order->date . ' ' . $order->start_time);
        $endTime = $startTime->copy()->addMinutes($order->duration * 60);

        $validStatus = [
            CastOrderStatus::ACCEPTED,
            CastOrderStatus::PROCESSING,
        ];

        $orderCheck = Order::whereIn('status', [OrderStatus::OPEN, OrderStatus::ACTIVE, OrderStatus::PROCESSING])
            ->whereHas('castOrder', function ($query) use ($user, $validStatus) {
                $query->where('user_id', $user->id);
                $query->whereIn('cast_order.status', $validStatus);
            })
            ->where(function ($query) use ($startTime, $endTime) {
                $query->orWhereRaw("concat_ws(' ',`date`,`start_time`) >= '$startTime' and concat_ws(' ',`date`,`start_time`) <= '$endTime'"
                );

                $query->orWhereRaw("DATE_ADD(concat_ws(' ',`date`,`start_time`), INTERVAL `duration` HOUR) >= '$startTime' and DATE_ADD(concat_ws(' ',`date`,`start_time`), INTERVAL `duration` HOUR) <= '$endTime'"
                );
                $query->orWhereRaw("concat_ws(' ',`date`,`start_time`) <= '$startTime' and DATE_ADD(concat_ws(' ',`date`,`start_time`), INTERVAL `duration` HOUR) >= '$endTime'"
                );
            });

        if ($orderCheck->count() > 0) {
            return false;
        }

        return true;
    }

    public function accept($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        if (OrderStatus::OPEN != $order->status || OrderType::CALL == $order->type) {
            return $this->respondErrorMessage(trans('messages.accept_error'), 409);
        }

        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        if (!$this->validTimeOrder($user, $order)) {
            return $this->respondErrorMessage(trans('messages.order_time_error'), 409);
        }

        $nomineeExists = $order->nominees()->where('user_id', $user->id)->where('cast_order.status', CastOrderStatus::OPEN)->first();
        if (!$nomineeExists) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if (!$order->accept($user->id)) {
            return $this->respondServerError();
        }

        $order = $order->fresh();

        return $this->respondWithData(OrderResource::make($order));
    }

    public function apply($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $validOrderTypes = [
            OrderType::CALL,
            OrderType::HYBRID,
        ];

        if (OrderStatus::OPEN != $order->status || !in_array($order->type, $validOrderTypes)) {
            return $this->respondErrorMessage(trans('messages.apply_error'), 409);
        }

        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        if (!$this->validTimeOrder($user, $order)) {
            return $this->respondErrorMessage(trans('messages.order_time_error'), 409);
        }

        if ($order->casts->count() == $order->total_cast
            || $order->casts->contains($user->id)) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if (!$order->apply($user->id)) {
            return $this->respondServerError();
        }

        $order = $order->fresh();

        return $this->respondWithData(OrderResource::make($order));
    }

    public function start($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        $castExists = $order->casts()->where('user_id', $user->id)->whereNull('started_at')->first();

        $validStatus = [
            OrderStatus::ACTIVE,
            OrderStatus::PROCESSING,
        ];

        if (!$castExists || !in_array($order->status, $validStatus)) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if (!$order->start($user->id)) {
            return $this->respondServerError();
        }

        $order = $order->fresh();

        return $this->respondWithData(OrderResource::make($order));
    }

    public function stop($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        $castExists = $order->casts()
            ->where('cast_order.status', CastOrderStatus::PROCESSING)
            ->where('user_id', $user->id)
            ->whereNull('stopped_at')
            ->exists();

        $validStatus = [
            OrderStatus::PROCESSING,
            OrderStatus::DONE,
        ];

        if (!$castExists || !in_array($order->status, $validStatus)) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if (!$paymentRequest = $order->stop($user->id)) {
            return $this->respondServerError();
        }

        $order = $order->fresh();
        $paymentRequest = $paymentRequest->load('order.casts');

        return $this->respondWithData(PaymentRequestResource::make($paymentRequest));
    }

    public function thanks(Request $request, $id)
    {
        $rules = [
            'message' => 'required',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        $castExists = $order->whereHas('castOrder', function ($query) use ($user) {
            $query->where('user_id', $user->id);
            $query->where('cast_order.status', CastOrderStatus::DONE);
        })->exists();

        if (!$castExists) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        try {
            DB::beginTransaction();
            $room = $this->createDirectRoom($order->user_id, $user->id);

            $messageExist = Message::where([
                ['user_id', $user->id],
                ['order_id', $id],
                ['type', MessageType::THANKFUL],
            ])->exists();

            if ($messageExist) {
                return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
            }

            $message = new Message;
            $message->room_id = $room->id;
            $message->user_id = $user->id;
            $message->order_id = $id;
            $message->message = $request->message;
            $message->type = MessageType::THANKFUL;
            $message->save();

            $message->recipients()->attach($order->user_id, [
                'room_id' => $room->id,
                'message_id' => $message->id,
            ]);

            $order->casts()->updateExistingPivot(
                $user->id,
                ['is_thanked' => true],
                false
            );

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        broadcast(new MessageCreated($message->id))->toOthers();

        return $this->respondWithData(MessageResource::make($message));
    }

    public function delete(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        $validStatus = [
            CastOrderStatus::DENIED,
            CastOrderStatus::CANCELED,
            CastOrderStatus::TIMEOUT,
        ];
        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        $castExists = $order->castOrder()->where('cast_order.user_id', $user->id)
            ->whereIn('cast_order.status', $validStatus)->exists();

        if (!$castExists) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        try {
            $order->castOrder()->updateExistingPivot($user->id, ['deleted_at' => Carbon::now()], false);

            return $this->respondWithNoData(trans('messages.delete_order_success'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    public function orderCount(Request $request)
    {
        $rules = [
            'order_type' => 'required|numeric',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();
        $cast = Cast::find($user->id);

        $input = $request->only([
            'order_type',
        ]);

        $orderCount = $cast->orders()->where([
            ['cast_order.status', '=', CastOrderStatus::OPEN],
            ['orders.type', '=', $input['order_type']],
        ])->count();

        return $this->respondWithData(['total' => $orderCount]);
    }
}
