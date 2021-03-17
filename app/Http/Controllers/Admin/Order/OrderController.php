<?php

namespace App\Http\Controllers\Admin\Order;

use App\Cast;
use App\CastClass;
use App\Enums\CastOrderStatus;
use App\Enums\CastOrderType;
use App\Enums\MessageType;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentRequestStatus;
use App\Enums\PointType;
use App\Enums\RoomType;
use App\Enums\SystemMessageType;
use App\Guest;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Jobs\PointSettlement;
use App\Notification;
use App\Notifications\AdminEditOrder;
use App\Notifications\AdminEditOrderNominee;
use App\Notifications\AdminRemoveCastInOrder;
use App\Notifications\CallOrdersCreated;
use App\Notifications\CastAcceptNominationOrders;
use App\Notifications\CastApplyOrders;
use App\Notifications\CreateNominationOrdersForCast;
use App\Notifications\PaymentRequestFromCast;
use App\Order;
use App\PaymentRequest;
use App\Point;
use App\Room;
use App\Services\CSVExport;
use App\Services\LogService;
use App\Traits\DirectRoom;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use DirectRoom;

    public function index(CheckDateRequest $request)
    {
        $pointStatus = [
            OrderStatus::PROCESSING,
            OrderStatus::TIMEOUT,
            OrderStatus::DENIED,
            OrderStatus::CANCELED,
            OrderStatus::DONE,
            OrderStatus::ACTIVE,
            OrderStatus::OPEN,
        ];

        if ($request->has('notification_id')) {
            $notification = Notification::find($request->notification_id);
            if (null == $notification->read_at) {
                $now = Carbon::now();
                try {
                    $notification->read_at = $now;
                    $notification->save();
                } catch (\Exception $e) {
                    LogService::writeErrorLog($e);

                    return $this->respondServerError();
                }
            }
        }

        $keyword = $request->search;
        $orderBy = $request->only('user_id', 'id', 'type', 'address',
            'created_at', 'date', 'start_time', 'status');

        $orders = Order::with('user', 'castOrderWithTrashedRejectCastDenied')->withTrashed();

        if ($keyword) {
            $orders->where(function ($query) use ($keyword) {
                $query->where('id', "$keyword")
                    ->orWhereHas('user', function ($subQuery) use ($keyword) {
                        $subQuery->where('id', "$keyword")
                            ->orWhere('nickname', 'like', "%$keyword%");
                    })
                    ->orWhereHas('castOrderWithTrashedRejectCastDenied', function ($subQuery) use ($keyword) {
                        $subQuery->where('cast_order.user_id', "$keyword");
                    });
            });
        }

        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($fromDate) {
            $orders->where(function ($query) use ($fromDate) {
                $query->whereDate('date', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $orders->where(function ($query) use ($toDate) {
                $query->whereDate('date', '<=', $toDate);
            });
        }

        if (!$request->alert && empty($orderBy)) {
            $orders = $orders->orderBy('created_at', 'DESC');
        } else {
            switch ($request->alert) {
                case 'asc':
                    $orders = $orders->orderByRaw("FIELD(status, " . implode(',', $pointStatus) . ") ")
                        ->orderBy('date')->orderBy('start_time');
                    break;
                case 'desc':
                    $orders = $orders->orderByRaw("FIELD(status, " . implode(',', $pointStatus) . ") DESC ")
                        ->orderBy('date', 'DESC')->orderBy('start_time', 'DESC');
                    break;

                default:
                    break;
            }

            if (!empty($orderBy)) {
                foreach ($orderBy as $key => $value) {
                    $orders->orderBy($key, $value);
                }
            }
        }

        // Export all order
        if ('export_orders' == $request->submit) {
            $ordersExport = $orders->get();

            return $this->exportOrders($ordersExport);
        }

        // Export order payment finished
        if ('export_real_orders' == $request->submit) {
            $realOrdersExport = $orders->where('payment_status', OrderPaymentStatus::PAYMENT_FINISHED)->get();

            return $this->exportRealOrders($realOrdersExport);
        }

        $orders = $orders->paginate($request->limit ?: 10);

        return view('admin.orders.index', compact('orders'));
    }

    public function exportOrders($ordersExport)
    {
        $data = collect($ordersExport)->map(function ($item) {
            $status = OrderStatus::getDescription($item->status);

            if (OrderStatus::DENIED == $item->status || OrderStatus::CANCELED == $item->status) {
                if (OrderType::NOMINATION == $item->type && (count($item->nominees) > 0 ? empty
                    ($item->nominees[0]->pivot->accepted_at) : false)) {
                    $status = '提案キャンセル';
                } else {
                    if (0 == $item->cancel_fee_percent) {
                        $status = '確定後キャンセル (キャンセル料なし)';
                    } else {
                        $status = '確定後キャンセル (キャンセル料あり)';
                    }
                }
            }

            $totalTime = 0;
            foreach ($item->casts as $cast) {
                $start = Carbon::parse($cast->pivot->started_at);
                $stop = Carbon::parse($cast->pivot->stopped_at);

                $totalTime += $stop->diffInMinutes($start);
            }

            return [
                $item->user_id,
                $item->user ? $item->user->nickname : '',
                $item->user ? Carbon::parse($item->user->created_at)->format('Y年m月d日') : '',
                $item->id,
                OrderType::getDescription($item->type),
                $item->address,
                Carbon::parse($item->created_at)->format('Y年m月d日 H:i'),
                Carbon::parse($item->date)->format('Y年m月d日') . Carbon::parse($item->start_time)->format('H:i'),
                $item->total_cast . '名', OrderType::CALL == $item->type ? $item->castClass->name : '',
                $item->duration,
                $item->temp_point,
                ($item->total_cast > 1) ? round(($totalTime / 60) / $item->total_cast, 2) : round($totalTime / 60, 2),
                ($item->total_point < $item->discount_point) ? 0 : ($item->total_point - $item->discount_point),
                $status,
            ];
        })->toArray();

        $header = [
            '予約者ID',
            '予約者名',
            '予約者の登録日',
            '予約ID',
            '予約区分',
            '開催エリア',
            '予約発生時間',
            '予約開始時間',
            '希望人数',
            'キャストクラス',
            '予約時間',
            '基本料金',
            '合流時間の平均実績(ｈ)',
            '実績合計ポイント',
            'ステータス',
        ];

        try {
            $file = CSVExport::toCSV($data, $header);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            request()->session()->flash('msg', trans('messages.server_error'));

            return redirect()->route('admin.orders.index');
        }
        $file->output('orders_' . Carbon::now()->format('Ymd_Hi') . '.csv');

        return;
    }

    public function exportRealOrders($realOrdersExport)
    {
        $data = [];
        foreach ($realOrdersExport as $item) {
            $casts = $item->casts;
            foreach ($casts as $cast) {
                if ($cast) {
                    $startTime = Carbon::parse($cast->pivot->started_at);
                    $stoppedAt = Carbon::parse($cast->pivot->stopped_at);

                    $array = [
                        $item->id,
                        OrderType::getDescription($item->type),
                        $cast->id,
                        $item->castClass->name,
                        $startTime->format('Y年m月d日 H:i'),
                        $stoppedAt->format('Y年m月d日 H:i'),
                        round($cast->pivot->extra_time / 60, 2),
                        $item->orderFee($cast, $cast->pivot->started_at, $cast->pivot->stopped_at),
                        $cast->pivot->allowance_point,
                        $cast->pivot->total_point,
                        \App\Enums\DeviceType::getDescription($item->user->device_type),
                        $item->coupon_id,
                    ];

                    array_push($data, $array);
                }
            }
        }

        $header = [
            '予約ID',
            '予約区分',
            'マッチングしたキャストID',
            'キャストクラス',
            '合流時刻',
            '解散時刻',
            '延長時間',
            '指名料',
            '深夜手当',
            '実績合計ポイント',
            '利用ゲストのデバイス',
            'クーポン利用状況',
        ];

        try {
            $file = CSVExport::toCSV($data, $header);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            request()->session()->flash('msg', trans('messages.server_error'));

            return redirect()->route('admin.orders.index');
        }
        $file->output('real_orders_' . Carbon::now()->format('Ymd_Hi') . '.csv');

        return;
    }

    public function deleteOrder(Request $request)
    {
        if ($request->has('order_ids')) {
            $orderIds = array_map('intval', explode(',', $request->order_ids));

            $checkOrderIdExist = Order::whereIn('id', $orderIds)->exists();

            if ($checkOrderIdExist) {
                $orders = Order::whereIn('id', $orderIds)->get();

                foreach ($orders as $order) {
                    if ($order->coupon_id) {
                        $user = $order->user;

                        $user->coupons()->detach([$order->coupon_id]);
                    }

                    // $this->updateInviteCodeHistory($order->id);
                    $order->delete();
                }
            }
        }

        return redirect(route('admin.orders.index'));
    }

    public function nominees($order)
    {
        $order = Order::withTrashed()->find($order);

        if (empty($order)) {
            abort(404);
        }

        $casts = $order->nominees()->paginate();

        return view('admin.orders.nominees', compact('casts', 'order'));
    }

    public function candidates($order)
    {
        $order = Order::withTrashed()->find($order);

        if (empty($order)) {
            abort(404);
        }

        $casts = $order->candidates()->paginate();

        return view('admin.orders.candidates', compact('casts', 'order'));
    }

    public function orderCall(Request $request, $order)
    {
        $order = Order::withTrashed()->find($order);

        if (empty($order)) {
            abort(404);
        }

        if (OrderType::NOMINATION == $order->type) {
            $request->session()->flash('msg', trans('messages.order_not_found'));

            return redirect(route('admin.orders.index'));
        }

        $order = $order->load('candidates', 'nominees', 'user', 'castClass', 'room', 'casts', 'tags');

        return view('admin.orders.order_call', compact('order'));
    }

    public function editOrderCall(Order $order)
    {
        $castClasses = CastClass::all();
        $castsNominee = [];
        $castsCandidates = [];
        $castsMatching = $order->casts;
        $castsMatching = $castsMatching->map(function ($user) {
            return collect($user->toArray())
                ->only(['id', 'nickname', 'pivot'])
                ->all();
        });

        $castsNominee = $order->nominees()->whereNotIn('cast_order.status', [CastOrderStatus::TIMEOUT, CastOrderStatus::CANCELED])
            ->get();
        $castsNominee = $castsNominee->map(function ($user) {
            return collect($user->toArray())
                ->only(['id', 'nickname', 'pivot'])
                ->all();
        });
        $castsCandidates = $order->candidates()->whereNotIn('cast_order.status', [CastOrderStatus::TIMEOUT, CastOrderStatus::CANCELED])
            ->get();

        $castsCandidates = $castsCandidates->map(function ($user) {
            return collect($user->toArray())
                ->only(['id', 'nickname', 'pivot'])
                ->all();
        });

        $orderTypeDesc = [
            OrderType::NOMINATED_CALL => OrderType::getDescription(OrderType::NOMINATED_CALL),
            OrderType::CALL => OrderType::getDescription(OrderType::CALL),
            OrderType::NOMINATION => OrderType::getDescription(OrderType::NOMINATION),
            OrderType::HYBRID => OrderType::getDescription(OrderType::HYBRID),
        ];
        $orderStatusDesc = [
            OrderStatus::OPEN => OrderStatus::getDescription(OrderStatus::OPEN),
            OrderStatus::ACTIVE => OrderStatus::getDescription(OrderStatus::ACTIVE),
            OrderStatus::PROCESSING => OrderStatus::getDescription(OrderStatus::PROCESSING),
            OrderStatus::DONE => OrderStatus::getDescription(OrderStatus::DONE),
            OrderStatus::TIMEOUT => OrderStatus::getDescription(OrderStatus::TIMEOUT),
        ];

        return view('admin.orders.order_call_edit', compact('order', 'castClasses', 'castsMatching', 'castsNominee', 'castsCandidates', 'orderTypeDesc', 'orderStatusDesc'));
    }

    public function updateOrderCall(Request $request, $id)
    {
        $order = Order::find($id);
        $orderDate = Carbon::parse($request->orderDate);

        try {
            \DB::beginTransaction();
            $oldCast = $order->casts()->first();
            $oldTotalCast = $order->total_cast;

            $order->duration = $request->orderDuration;
            $order->class_id = $request->class_id;
            $order->total_cast = $request->totalCast;
            $order->date = $orderDate->format('Y-m-d');
            $order->start_time = $orderDate->format('H:i');
            $order->end_time = $orderDate->copy()->addMinutes($order->duration * 60)->format('H:i');
            $order->type = $request->type;
            $order->temp_point = $request->temp_point;
            $order->status = $request->status;
            $order->save();

            $newNominees = [];
            $castsRemoved = [];
            $newMatchings = [];
            if ($request->addedNomineeCast) {
                $newNominees = Cast::whereIn('id', $request->addedNomineeCast)->get();
            }
            if ($request->addedCandidateCast) {
                $newMatchings = Cast::whereIn('id', $request->addedCandidateCast)->get();
            }

            if ($request->deletedCast) {
                $order->castOrder()->detach($request->deletedCast);
                $castsRemoved = Cast::whereIn('id', $request->deletedCast)->get();
            }

            $orderStartTime = Carbon::parse($order->date . ' ' . $order->start_time);
            $orderEndTime = $orderStartTime->copy()->addMinutes($order->duration * 60);
            $nightTime = $order->nightTime($orderEndTime);
            $allowance = $order->allowance($nightTime);
            $orderPoint = $order->orderPoint();

            // Update temp point for previous casts matched
            $matchedCasts = $order->casts()->get();
            foreach ($matchedCasts as $cast) {
                if (CastOrderType::NOMINEE == $cast->pivot->type) {
                    $orderFee = $order->orderFee($cast, $orderStartTime, $orderEndTime);
                    $orderPoint = $order->orderPoint($cast);
                    $order->castOrder()->updateExistingPivot(
                        $cast->id,
                        [
                            'temp_point' => $orderPoint + $allowance + $orderFee,
                        ]
                    );
                } else {
                    $orderPoint = $order->orderPoint();
                    $order->castOrder()->updateExistingPivot(
                        $cast->id,
                        [
                            'temp_point' => $orderPoint + $allowance,
                        ]
                    );
                }
            }

            // Add casts nominee
            foreach ($newNominees as $nominee) {
                $order->nominees()->attach($nominee->id, [
                    'type' => CastOrderType::NOMINEE,
                    'status' => CastOrderStatus::OPEN,
                ]);
            }

            // Add casts matched
            foreach ($newMatchings as $matching) {
                $order->candidates()->attach($matching->id, [
                    'type' => CastOrderType::CANDIDATE,
                    'status' => CastOrderStatus::ACCEPTED,
                    'accepted_at' => Carbon::now(),
                    'temp_point' => $orderPoint + $allowance,
                ]);
            }
            $currentTotalCast = $order->casts()->count();
            // Add/Remove casts in room
            $room = $order->room;
            if ($room) {
                if (1 == $order->total_cast) {
                    $cast = $order->casts()->first();
                    if ($cast) {
                        if (RoomType::GROUP == $room->type) {
                            $users = $order->casts()->get()->pluck('id')->toArray();
                            $users[] = $order->user_id;
                            $room->users()->sync($users);
                        } else {
                            $ownerId = $order->user_id;
                            $room = $this->createDirectRoom($ownerId, $cast->id);
                            $room->save();

                            $order->room_id = $room->id;
                            $order->save();
                        }
                    }
                }

                if ($order->total_cast > 1) {
                    if (RoomType::GROUP == $room->type) {
                        $users = $order->casts()->get()->pluck('id')->toArray();
                        $users[] = $order->user_id;
                        $room->users()->sync($users);
                    } else {
                        $room = new Room;
                        $room->order_id = $order->id;
                        $room->owner_id = $order->user_id;
                        $room->type = RoomType::GROUP;
                        $room->save();
                        $users = $order->casts()->get()->pluck('id')->toArray();
                        $users[] = $order->user_id;
                        $room->users()->attach($users);

                        $order->room_id = $room->id;
                        $order->save();
                    }
                }
            } else {
                if ($order->total_cast == $currentTotalCast) {
                    if ($order->total_cast > 1) {
                        $room = new Room;
                        $room->order_id = $order->id;
                        $room->owner_id = $order->user_id;
                        $room->type = RoomType::GROUP;
                        $room->save();
                        $users = $order->casts()->get()->pluck('id')->toArray();
                        $users[] = $order->user_id;
                        $room->users()->attach($users);
                    }

                    if (1 == $order->total_cast) {
                        $cast = $order->casts()->first();
                        $ownerId = $order->user_id;
                        $room = $this->createDirectRoom($ownerId, $cast->id);
                        $room->save();
                    }

                    $order->room_id = $room->id;
                    $order->save();
                }
            }

            $currentCasts = $order->casts()->get();
            $isDone = true;
            $allRequestPayment = true;
            foreach ($currentCasts as $cast) {
                if (!$cast->pivot->stopped_at) {
                    $isDone = false;
                }
                $paymentRequest = $order->paymentRequests()->where('cast_id', $cast->id)->first();
                if ($paymentRequest) {
                    if (!in_array($paymentRequest->status, [PaymentRequestStatus::REQUESTED,
                        PaymentRequestStatus::UPDATED])) {
                        $allRequestPayment = false;
                    }
                } else {
                    $allRequestPayment = false;
                }
            }
            if (!count($currentCasts)) {
                $isDone = false;
                $allRequestPayment = false;
            }

            if ($isDone) {
                $order->status = OrderStatus::DONE;
                if ($allRequestPayment) {
                    $order->payment_status = OrderPaymentStatus::REQUESTING;
                    $order->payment_requested_at = now();
                }
                $order->save();
            }

            \DB::commit();

            if ($isDone) {
                if ($allRequestPayment) {
                    $requestedStatuses = [
                        PaymentRequestStatus::REQUESTED,
                        PaymentRequestStatus::UPDATED,
                    ];
                    $order->payment_requested_at = now();
                    $order->total_point = $order->paymentRequests()
                        ->whereIn('status', $requestedStatuses)
                        ->sum('total_point');
                    $order->save();
                    $order->user->notify(new PaymentRequestFromCast($order, $order->total_point));
                }
            }

            if ($request->old_status != $order->status && OrderStatus::ACTIVE == $order->status) {
                $casts = $order->casts()->get();
                $involvedUsers = [$order->user];
                foreach ($casts as $cast) {
                    $involvedUsers[] = $cast;
                    $cast->notify(new CastApplyOrders($order, $cast->pivot->temp_point));
                }

                $this->sendMessageToMatchingOrder($order, $involvedUsers);
                \Notification::send($involvedUsers, new CastAcceptNominationOrders($order));
            } else if ($request->old_status == $order->status && OrderStatus::ACTIVE == $order->status) {
                if ($oldTotalCast == $order->total_cast && 1 == $order->total_cast) {
                    $currentCast = $order->casts()->first();
                    if ($oldCast->id != $currentCast->id) {
                        $involvedUsers = [$order->user];
                        $involvedUsers[] = $currentCast;
                        $currentCast->notify(new CastApplyOrders($order, $currentCast->pivot->temp_point));
                        $this->sendMessageToMatchingOrder($order, $involvedUsers);
                        \Notification::send($involvedUsers, new CastAcceptNominationOrders($order));
                    }
                } else {
                    if ($request->addedCandidateCast) {
                        $newCastIds = $request->addedCandidateCast;
                        $casts = $order->casts()->whereIn('cast_order.user_id', $newCastIds)->get();
                        $involvedUsers = [$order->user];

                        foreach ($casts as $cast) {
                            $involvedUsers[] = $cast;
                            $cast->notify(new CastApplyOrders($order, $cast->pivot->temp_point));
                        }
                        $this->sendMessageToMatchingOrder($order, $involvedUsers);
                        \Notification::send($involvedUsers, new CastAcceptNominationOrders($order));
                    }
                }
            } else {
                // Send notification to new nominees
                \Notification::send(
                    $newNominees,
                    (new CreateNominationOrdersForCast($order->id))->delay(now()->addSeconds(3))
                );
                // Send notification to casts removed
                \Notification::send(
                    $castsRemoved,
                    (new AdminRemoveCastInOrder())->delay(now()->addSeconds(3))
                );
                // Send notification to user and casts.
                $order->user->notify((new AdminEditOrder())->delay(now()->addSeconds(3)));
                \Notification::send(
                    $matchedCasts,
                    (new AdminEditOrder())->delay(now()->addSeconds(3))
                );

                // Send notification to other casts
                if ($order->total_cast != $currentTotalCast) {
                    $castInOrder = $order->castOrder()->get()->pluck('id')->toArray();
                    $casts = Cast::where('class_id', $order->class_id)->whereNotIn('id', $castInOrder)->get();
                    \Notification::send(
                        $casts,
                        (new CallOrdersCreated($order->id))->delay(now()->addSeconds(3))
                    );
                }
            }

            return response()->json(['success' => true], 200);
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);
            return response()->json(['success' => false, 'info' => $e->getMessage()], 400);
        }
    }

    public function getCasts(Request $request, $classId)
    {
        $casts = Cast::where('class_id', $classId);
        $listCast = [
            $request->listCastNominees,
            $request->listCastCandidates,
            $request->listCastMatching,
        ];
        $listCast = array_unique(collect($listCast)->collapse()->toArray());
        $search = $request->search;
        $casts->whereNotIn('id', $listCast);
        if ($search) {
            $casts->where(function ($query) use ($search) {
                $query->where('nickname', 'like', "%$search%")
                    ->orWhere('id', $search);
            });
        }

        $casts = $casts->get();

        return response()->json([
            'view' => view('admin.orders.list_cast_by_class', compact('casts'))->render(),
            'casts' => $casts,
        ]);
    }

    public function castsMatching($order)
    {
        $order = Order::withTrashed()->find($order);

        if (empty($order)) {
            abort(404);
        }

        $casts = $order->casts;
        $paymentRequests = $order->paymentRequests->keyBy('cast_id')->toArray();

        return view('admin.orders.casts_matching', compact('casts', 'order', 'paymentRequests'));
    }

    public function changeStartTimeOrderCall(Request $request)
    {
        $order = Order::find($request->order_id);
        $castId = $request->cast_id;
        $casts = $order->casts;

        $newHour = $request->start_time_hour;
        $newMinute = $request->start_time_minute;
        $newDay = $request->start_date;
        $newStartTime = Carbon::parse($newDay . ' ' . $newHour . ':' . $newMinute);
        $this->changeStartTime($newStartTime, $order, $castId);

        return redirect(route('admin.orders.casts_matching', compact('casts', 'order')));
    }

    private function changeStartTime($newStartedTime, $order, $castId)
    {
        $cast = $order->casts()->withPivot('started_at', 'stopped_at', 'type')->where('user_id', $castId)->first();
        $stoppedAt = $cast->pivot->stopped_at;
        $totalTime = $newStartedTime->diffInMinutes($stoppedAt);
        $nightTime = $order->nightTime($stoppedAt);
        $extraTime = $order->extraTime($newStartedTime, $stoppedAt);
        $extraPoint = $order->extraPoint($cast, $extraTime);
        $orderPoint = $order->orderPoint($cast, $newStartedTime, $stoppedAt);
        $ordersFee = $order->orderFee($cast, $newStartedTime, $stoppedAt);
        $allowance = $order->allowance($nightTime);
        $totalPoint = $orderPoint + $ordersFee + $allowance + $extraPoint;
        $orderTime = (60 * $order->duration);

        $input = [
            'started_at' => $newStartedTime,
            'stopped_at' => $stoppedAt,
            'total_time' => $totalTime,
            'night_time' => $nightTime,
            'extra_time' => $extraTime,
            'extra_point' => $extraPoint,
            'order_point' => $orderPoint,
            'fee_point' => $ordersFee,
            'allowance_point' => $allowance,
            'total_point' => $totalPoint,
            'order_time' => $orderTime,
        ];

        $this->calculatorPoint($input, $castId, $order);
    }

    private function calculatorPoint($input, $castId, $order)
    {
        try {
            \DB::beginTransaction();

            $order->casts()->updateExistingPivot($castId, $input, false);

            $latestStoppedAt = $input['stopped_at'];
            $earliesStartedtAt = $input['started_at'];

            if ($order->casts->count() > 1) {
                if ($order->actual_started_at > $earliesStartedtAt) {
                    $order->actual_started_at = $earliesStartedtAt;
                }

                if ($order->actual_ended_at < $latestStoppedAt) {
                    $order->actual_ended_at = $latestStoppedAt;
                }
            } else {
                $order->actual_started_at = $earliesStartedtAt;
                $order->actual_ended_at = $latestStoppedAt;
            }

            if (OrderType::NOMINATION != $order->type) {
                $totalPoint = 0;
                foreach ($order->casts as $cast) {
                    if ($cast->pivot->user_id != $castId) {
                        $totalPoint += $cast->pivot->total_point;
                    }
                }
                $order->total_point = $input['total_point'] + $totalPoint;
            } else {
                $order->total_point = $input['total_point'];
            }

            $order->save();

            $paymentRequest = $order->paymentRequests->where('cast_id', $castId)->first();

            if ($paymentRequest) {
                $paymentRequest->cast_id = $castId;
                $paymentRequest->guest_id = $order->user_id;
                $paymentRequest->order_id = $order->id;
                $paymentRequest->order_time = $input['order_time'];
                $paymentRequest->order_point = $input['order_point'];
                $paymentRequest->allowance_point = $input['allowance_point'];
                $paymentRequest->fee_point = $input['fee_point'];
                $paymentRequest->extra_time = $input['extra_time'];
                $paymentRequest->old_extra_time = $paymentRequest->extra_time;
                $paymentRequest->extra_point = $input['extra_point'];
                $paymentRequest->total_point = $input['total_point'];
                if ((OrderPaymentStatus::EDIT_REQUESTING == $order->payment_status) && (in_array($paymentRequest->status, [PaymentRequestStatus::REQUESTED, PaymentRequestStatus::UPDATED]))) {
                    $paymentRequest->status = PaymentRequestStatus::CONFIRM;
                }

                $paymentRequest->save();

                $point = Point::withTrashed()->where('payment_request_id', $paymentRequest->id)->where('type', PointType::TEMP)->first();
                if ($point) {
                    $cast = $paymentRequest->cast;

                    $point->update(['point' => round($paymentRequest->total_point * $cast->cost_rate)]);
                }
            }

            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    public function changeStopTimeOrderCall(Request $request)
    {
        $order = Order::find($request->order_id);
        $castId = $request->cast_id;
        $casts = $order->casts;

        $newHour = $request->stop_time_hour;
        $newMinute = $request->stop_time_minute;
        $newDay = $request->stop_date;
        $newstoppedTime = Carbon::parse($newDay . ' ' . $newHour . ':' . $newMinute);
        $cast = $order->casts()->withPivot('started_at', 'stopped_at', 'type')->where('user_id', $castId)->first();
        $startedDay = Carbon::parse($cast->pivot->started_at);
        if ($startedDay > $newstoppedTime) {
            $request->session()->flash('err', trans('messages.time_invalid'));

            return redirect(route('admin.orders.casts_matching', ['order' => $order->id]));
        }
        $this->changeStopTime($newstoppedTime, $order, $castId);

        return redirect(route('admin.orders.casts_matching', compact('casts', 'order')));
    }

    private function changeStopTime($newstoppedTime, $order, $castId)
    {
        $cast = $order->casts()->withPivot('started_at', 'stopped_at', 'type')->where('user_id', $castId)->first();
        $startedDay = Carbon::parse($cast->pivot->started_at);
        $extraTime = $order->extraTime($startedDay, $newstoppedTime);
        $nightTime = $order->nightTime($newstoppedTime);
        $extraPoint = $order->extraPoint($cast, $extraTime);
        $orderPoint = $order->orderPoint($cast, $startedDay, $newstoppedTime);
        $ordersFee = $order->orderFee($cast, $startedDay, $newstoppedTime);
        $allowance = $order->allowance($nightTime);
        $totalTime = $startedDay->diffInMinutes($newstoppedTime);
        $totalPoint = $orderPoint + $ordersFee + $allowance + $extraPoint;
        $orderTime = (60 * $order->duration);

        if ($startedDay < $newstoppedTime) {
            $input = [
                'started_at' => $startedDay,
                'stopped_at' => $newstoppedTime,
                'total_time' => $totalTime,
                'night_time' => $nightTime,
                'extra_time' => $extraTime,
                'extra_point' => $extraPoint,
                'order_point' => $orderPoint,
                'fee_point' => $ordersFee,
                'allowance_point' => $allowance,
                'total_point' => $totalPoint,
                'order_time' => $orderTime,
            ];

            $this->calculatorPoint($input, $castId, $order);
        }
    }

    public function orderNominee(Request $request, $order)
    {
        $order = Order::withTrashed()->find($order);

        if (empty($order)) {
            abort(404);
        }

        if (OrderType::NOMINATION != $order->type) {
            $request->session()->flash('msg', trans('messages.order_not_found'));

            return redirect(route('admin.orders.index'));
        }

        return view('admin.orders.order_nominee', compact('order'));
    }

    public function changePaymentRequestStatus(Request $request, Order $order)
    {
        $order->payment_status = OrderPaymentStatus::WAITING;

        try {
            \DB::beginTransaction();
            $order->save();
            PaymentRequest::where([
                ['order_id', '=', $order->id],
                ['status', '=', PaymentRequestStatus::CONFIRM],
            ])->update(['status' => PaymentRequestStatus::OPEN]);

            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        if ('order_nominee' == $request->page) {
            return redirect(route('admin.orders.order_nominee', compact('order')));
        } else {
            return redirect(route('admin.orders.call', compact('order')));
        }
    }

    public function changeStartTimeOrderNominee(Request $request)
    {
        $order = Order::find($request->orderId);
        $castId = $request->cast_id;
        $newHour = $request->start_time_hour;
        $newMinute = $request->start_time_minute;
        $newDay = $request->start_date;
        $newStartTime = Carbon::parse($newDay . ' ' . $newHour . ':' . $newMinute);
        $this->changeStartTime($newStartTime, $order, $castId);

        return redirect(route('admin.orders.order_nominee', compact('order')));
    }

    public function changeStopTimeOrderNominee(Request $request)
    {
        $order = Order::find($request->orderId);
        $castId = $request->cast_id;

        $newHour = $request->stop_time_hour;
        $newMinute = $request->stop_time_minute;
        $newDay = $request->stop_date;
        $newstoppedTime = Carbon::parse($newDay . ' ' . $newHour . ':' . $newMinute);
        $cast = $order->casts()->withPivot('started_at', 'stopped_at', 'type')->where('user_id', $castId)->first();
        $startedDay = Carbon::parse($cast->pivot->started_at);
        if ($startedDay > $newstoppedTime) {
            $request->session()->flash('err', trans('messages.time_invalid'));

            return redirect(route('admin.orders.order_nominee', ['order' => $order->id]));
        }
        $this->changeStopTime($newstoppedTime, $order, $castId);

        return redirect(route('admin.orders.order_nominee', compact('order')));
    }

    public function pointSettlement(Request $request, Order $order)
    {

        PointSettlement::dispatchNow($order->id);

        if ('order_nominee' == $request->page) {
            return redirect(route('admin.orders.order_nominee', compact('order')));
        } else {
            return redirect(route('admin.orders.call', compact('order')));
        }
    }

    private function sendMessageToMatchingOrder($order, $users)
    {
        $room = Room::find($order->room_id);

        $startTime = Carbon::parse($order->date . ' ' . $order->start_time);
        $message = '\\\\ マッチングが確定しました♪ //'
        . PHP_EOL . PHP_EOL . '- ご予約内容 - '
        . PHP_EOL . '場所：' . $order->address
        . PHP_EOL . '合流予定時間：' . $startTime->format('H:i') . '～'
            . PHP_EOL . PHP_EOL . 'ゲストの方はキャストに来て欲しい場所の詳細をお伝えください。'
            . PHP_EOL . '尚、ご不明点がある場合は「Cheers運営者」チャットまでお問い合わせください。'
            . PHP_EOL . PHP_EOL . 'それでは素敵な時間をお楽しみください♪';

        $roomMessage = $room->messages()->create([
            'user_id' => 1,
            'type' => MessageType::SYSTEM,
            'system_type' => SystemMessageType::NORMAL,
            'message' => $message,
        ]);

        $userIds = [];
        foreach ($users as $user) {
            $userIds[] = $user->id;
        }

        $roomMessage->recipients()->attach($userIds, ['room_id' => $room->id]);
    }

    public function getListGuests(Request $request)
    {
        $search = $request->search;
        $deviceType = $request->device_type;

        $guests = Guest::where('device_type', $deviceType);

        if ($search) {
            $guests->where(function ($query) use ($search) {
                $query->where('nickname', 'like', "%$search%")
                    ->orWhere('id', $search);
            });
        }

        $guests = $guests->get();

        return response()->json([
            'view' => view('admin.orders.list_guests_by_device_type', compact('guests'))->render(),
            'guests' => $guests,
        ]);
    }

    public function updateOrderStatusToActive(Request $request)
    {
        $order = Order::where(function($q) {
            $q->where('status', OrderStatus::CANCELED)
                ->orWhere('status', OrderStatus::DENIED);
        })->where(function($q) {
            $q->whereNull('payment_status')
                ->orWhere('payment_status', '<>', OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED);
        })->find($request->id);

        if (!$order) {
            return redirect()->back();
        }

        $cast = $order->castOrder()->first();
        if (!$cast) {
            return redirect()->back();
        }

        $order->status = OrderStatus::ACTIVE;
        $order->canceled_at = null;
        $order->cancel_fee_percent = null;
        $order->save();

        $casts = $order->castOrder()->get();
        foreach ($casts as $cast) {
            $cast->pivot->canceled_at = null;
            $cast->pivot->deleted_at = null;
            $cast->pivot->status = CastOrderStatus::ACCEPTED;
            $cast->pivot->save();
        }

        if ($order->type == OrderType::NOMINATION) {
            return redirect()->route('admin.orders.order_nominee', ['order' => $order->id]);
        }

        return redirect()->route('admin.orders.call', ['order' => $order->id]);
    }

    public function updateNomineeOrder(Request $request, $id)
    {
        try {
            \DB::beginTransaction();
            $order = Order::whereIn('status', [OrderStatus::OPEN, OrderStatus::ACTIVE])->find($id);
            if (!$order) {
                return redirect()->route('admin.orders.order_nominee', ['order' => $order->id]);
            }

            $oldDate = Carbon::parse($order->date . ' ' . $order->start_time);
            $newDate = Carbon::parse($request->order_start_date);
            if ($oldDate->equalTo($newDate) && $order->duration == $request->duration) {
                return redirect()->route('admin.orders.order_nominee', ['order' => $order->id]);
            }

            $orderStartTime = Carbon::parse($request->order_start_date);
            $duration = $request->duration;

            $order->date = $orderStartTime->format('Y-m-d');
            $order->start_time = $orderStartTime->format('H:i');
            $order->duration = $duration;
            $order->end_time = $orderStartTime->copy()->addMinutes($order->duration * 60)->format('H:i');

            $cast = $order->nominees()->first();
            $orderEndTime = $orderStartTime->copy()->addMinutes($order->duration * 60);
            $nightTime = $order->nightTime($orderEndTime);
            $allowance = $order->allowance($nightTime);
            $orderPoint = $order->orderPoint($cast);
            $orderFee = $order->orderFee($cast, $orderStartTime, $orderEndTime);

            $order->nominees()->updateExistingPivot(
                $cast->id,
                [
                    'temp_point' => $orderPoint + $allowance + $orderFee,
                ],
                false
            );

            $order->temp_point = $orderPoint + $allowance + $orderFee;
            $order->save();

            $room = Room::find($order->room_id);

            $roomMesage = '予約内容が変更されました。';
            $roomMessage = $room->messages()->create([
                'user_id' => 1,
                'type' => MessageType::SYSTEM,
                'message' => $roomMesage,
                'system_type' => SystemMessageType::NOTIFY
            ]);
            $roomMessage->recipients()->attach($cast->id, ['room_id' => $room->id]);
            $users = [
                $order->user,
                $cast
            ];

            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);
            return redirect()->back();
        }

        \Notification::send($users, new AdminEditOrderNominee($order->id));
        return redirect()->route('admin.orders.order_nominee', ['order' => $order->id]);
    }
}
