<?php

namespace App;

use App\Enums\CastClassType;
use App\Enums\CastOrderStatus;
use App\Enums\CastOrderType;
use App\Enums\CouponType;
use App\Enums\InviteCodeHistoryStatus;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PointType;
use App\Enums\RoomType;
use App\Jobs\CancelOrder;
use App\Jobs\ProcessOrder;
use App\Jobs\StopOrder;
use App\Jobs\ValidateOrder;
use App\Notifications\CancelOrderFromCast;
use App\Notifications\CastDenyOrders;
use App\Services\LogService;
use App\Traits\DirectRoom;
use Auth;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use DirectRoom;

    use SoftDeletes;

    protected $dates = ['deleted_at'];

    protected $fillable = [
        'prefecture_id',
        'address',
        'date',
        'start_time',
        'end_time',
        'duration',
        'total_cast',
        'temp_point',
        'class_id',
        'type',
        'offer_id',
        'status',
        'canceled_at',
        'is_changed',
        'payment_method',
        'coupon_id',
        'coupon_name',
        'coupon_type',
        'coupon_value',
        'cast_offer_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function test() {
        dd($this->room,$this->room());
    }
    public function casts()
    {
        return $this->belongsToMany(Cast::class)
            ->withTrashed()
            ->whereNotNull('cast_order.accepted_at')
            ->whereNull('cast_order.canceled_at')
            ->whereNull('cast_order.deleted_at')
            ->withPivot('order_time', 'extra_time', 'order_point', 'extra_point', 'allowance_point', 'fee_point',
                'total_point', 'type', 'started_at', 'stopped_at', 'status', 'accepted_at', 'canceled_at', 'guest_rated',
                'cast_rated', 'is_thanked', 'temp_point', 'cost', 'id')
            ->withTimestamps();
    }

    public function canceledCasts()
    {
        return $this->belongsToMany(Cast::class)
            ->where('cast_order.status', CastOrderStatus::CANCELED)
            ->whereNotNull('cast_order.accepted_at')
            ->withPivot('order_time', 'extra_time', 'order_point', 'extra_point', 'allowance_point', 'fee_point',
                'total_point', 'type', 'started_at', 'stopped_at', 'status', 'accepted_at', 'canceled_at', 'guest_rated',
                'cast_rated', 'is_thanked', 'temp_point', 'cost')
            ->withTimestamps();
    }

    public function nominees()
    {
        return $this->belongsToMany(Cast::class)
            ->where('cast_order.type', CastOrderType::NOMINEE)
            ->whereNull('cast_order.deleted_at')
            ->withPivot('order_time', 'extra_time', 'order_point', 'extra_point', 'allowance_point', 'fee_point',
                'total_point', 'type', 'started_at', 'stopped_at', 'status', 'accepted_at', 'canceled_at', 'guest_rated',
                'cast_rated', 'is_thanked', 'temp_point', 'cost', 'id')
            ->withTimestamps();
    }

    public function nomineesWithTrashed()
    {
        return $this->belongsToMany(Cast::class)
            ->withTrashed()
            ->where('cast_order.type', CastOrderType::NOMINEE)
            ->withPivot('status', 'type', 'cost', 'started_at', 'temp_point')
            ->withTimestamps();
    }

    public function nomineesWithTrashedRejectCastDenied()
    {
        return $this->belongsToMany(Cast::class)
            ->where('cast_order.type', CastOrderType::NOMINEE)
            ->where('cast_order.status', '<>', CastOrderStatus::DENIED)
            ->withTimestamps();
    }

    public function candidates()
    {
        return $this->belongsToMany(Cast::class)
            ->where('cast_order.type', CastOrderType::CANDIDATE)
            ->whereNull('cast_order.deleted_at')
            ->withPivot('order_id', 'user_id', 'started_at', 'stopped_at', 'created_at', 'updated_at')
            ->withTimestamps();
    }

    public function candidatesWithTrashedRejectCastDenied()
    {
        return $this->belongsToMany(Cast::class)
            ->where('cast_order.type', CastOrderType::CANDIDATE)
            ->where('cast_order.status', '<>', CastOrderStatus::DENIED)
            ->withTimestamps();
    }

    public function castOrder()
    {
        return $this->belongsToMany(Cast::class)
            ->whereNull('cast_order.deleted_at')
            ->withPivot('status', 'type', 'started_at', 'cost', 'temp_point')
            ->withTimestamps();
    }

    public function castOrderWithTrashedRejectCastDenied()
    {
        return $this->belongsToMany(Cast::class)
            ->where('cast_order.status', '<>', CastOrderStatus::DENIED)
            ->withTimestamps();
    }

    public function paymentRequests()
    {
        return $this->hasMany(PaymentRequest::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function castClass()
    {
        return $this->hasOne(CastClass::class, 'id', 'class_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }

    public function offer()
    {
        return $this->hasOne(Offer::class, 'id', 'offer_id');
    }

    public function coupon()
    {
        return $this->hasOne(Coupon::class, 'id', 'coupon_id');
    }

    public function deny($userId)
    {
        try {
            $this->nominees()->updateExistingPivot(
                $userId,
                ['status' => CastOrderStatus::DENIED, 'canceled_at' => Carbon::now()],
                false
            );
            if (OrderType::NOMINATION == $this->type) {
                $this->status = OrderStatus::DENIED;
                $this->canceled_at = Carbon::now();
                $this->save();

                $cast = User::find($userId);

                if ($this->coupon_id) {
                    $user = $this->user;

                    $user->coupons()->detach([$this->coupon_id]);
                }

                // $this->updateInviteCodeHistory($this->id);
                $this->user->notify(new CastDenyOrders($this, $cast));
            }

            ValidateOrder::dispatchNow($this->id);

            return true;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function denyAfterActived($userId)
    {
        try {
            $this->casts()->updateExistingPivot(
                $userId,
                ['status' => CastOrderStatus::DENIED, 'canceled_at' => Carbon::now()],
                false
            );
            $this->status = OrderStatus::DENIED;
            $this->canceled_at = Carbon::now();
            $this->save();

            if ($this->coupon_id) {
                $user = $this->user;

                $user->coupons()->detach([$this->coupon_id]);
            }
            $cast = User::find($userId);
            $owner = $this->user;
            $involvedUsers = [];
            $involvedUsers[] = $owner;
            $involvedUsers[] = $cast;

            \Notification::send($involvedUsers, new CancelOrderFromCast($this));
            // $this->updateInviteCodeHistory($this->id);
            return true;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function cancel()
    {
        try {
            $this->update([
                'status' => OrderStatus::CANCELED,
                'canceled_at' => Carbon::now(),
            ]);
            CancelOrder::dispatchNow($this->id);
            // $this->updateInviteCodeHistory($this->id);
            return true;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function apply($userId)
    {
        try {
            $orderStartTime = Carbon::parse($this->date . ' ' . $this->start_time);
            $orderEndTime = $orderStartTime->copy()->addMinutes($this->duration * 60);
            $nightTime = $this->nightTime($orderEndTime);
            $allowance = $this->allowance($nightTime);
            $orderPoint = $this->orderPoint();
            $tempPoint = $orderPoint + $allowance;

            $this->casts()->attach(
                $userId,
                [
                    'status' => CastOrderStatus::ACCEPTED,
                    'accepted_at' => Carbon::now(),
                    'type' => CastOrderType::CANDIDATE,
                    'temp_point' => $tempPoint,
                ]
            );

            ValidateOrder::dispatchNow($this->id);

            return true;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function accept($userId)
    {
        try {
            $cast = $this->nominees()->where('user_id', $userId)->first();
            $orderStartTime = Carbon::parse($this->date . ' ' . $this->start_time);
            $orderEndTime = $orderStartTime->copy()->addMinutes($this->duration * 60);
            $nightTime = $this->nightTime($orderEndTime);
            $allowance = $this->allowance($nightTime);
            $orderPoint = $this->orderPoint($cast);
            $orderFee = $this->orderFee($cast, $orderStartTime, $orderEndTime);
            $this->nominees()->updateExistingPivot(
                $userId,
                [
                    'status' => CastOrderStatus::ACCEPTED,
                    'accepted_at' => Carbon::now(),
                    'temp_point' => $orderPoint + $allowance + $orderFee,
                ],
                false
            );

            ValidateOrder::dispatchNow($this->id);

            return true;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function stop($userId)
    {
        $cast = $this->casts()->withPivot('started_at', 'stopped_at', 'type')->where('user_id', $userId)->first();

        $stoppedAt = Carbon::now();
        $orderStartTime = Carbon::parse($cast->pivot->started_at);
        $orderTotalTime = $orderStartTime->diffInMinutes($stoppedAt);
        $nightTime = $this->nightTime($stoppedAt);
        $extraTime = $this->extraTime($orderStartTime, $stoppedAt);
        $extraPoint = $this->extraPoint($cast, $extraTime);
        $orderPoint = $this->orderPoint($cast, $orderStartTime, $stoppedAt);
        $ordersFee = $this->orderFee($cast, $orderStartTime, $stoppedAt);
        $allowance = $this->allowance($nightTime);
        $totalPoint = $orderPoint + $ordersFee + $allowance + $extraPoint;

        try {
            \DB::beginTransaction();

            $this->casts()->updateExistingPivot($userId, [
                'stopped_at' => $stoppedAt,
                'status' => CastOrderStatus::DONE,
                'order_point' => $orderPoint,
                'order_time' => (60 * $this->duration),
                'night_time' => $nightTime,
                'extra_time' => $extraTime,
                'total_time' => $orderTotalTime,
                'fee_point' => $ordersFee,
                'allowance_point' => $allowance,
                'extra_point' => $extraPoint,
                'total_point' => $totalPoint,
            ], false);

            $paymentRequest = new PaymentRequest;
            $paymentRequest->cast_id = $userId;
            $paymentRequest->guest_id = $this->user_id;
            $paymentRequest->order_id = $cast->pivot->order_id;
            $paymentRequest->order_time = (60 * $this->duration);
            $paymentRequest->order_point = $orderPoint;
            $paymentRequest->allowance_point = $allowance;
            $paymentRequest->fee_point = $ordersFee;
            $paymentRequest->extra_time = $extraTime;
            $paymentRequest->old_extra_time = $extraTime;
            $paymentRequest->extra_point = $extraPoint;
            $paymentRequest->total_point = $totalPoint;
            $paymentRequest->save();

            // Create TEMP point
            $this->createTempPoint($paymentRequest);

            \DB::commit();

            StopOrder::dispatchNow($this->id, $cast);

            return $paymentRequest;
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function createTempPoint($paymentRequest)
    {
        $cast = $paymentRequest->cast;

        $point = new Point;
        $point->point = round($paymentRequest->total_point * $cast->cost_rate);
        $point->user_id = $paymentRequest->cast_id;
        $point->order_id = $this->id;
        $point->payment_request_id = $paymentRequest->id;
        $point->type = PointType::TEMP;
        $point->status = true;
        $point->save();

        // SoftDelete TEMP point
        $point->delete();
    }

    public function start($userId)
    {
        try {
            $this->casts()->updateExistingPivot($userId, [
                'started_at' => Carbon::now(),
                'status' => CastOrderStatus::PROCESSING,
            ], false);

            $cast = User::find($userId);
            ProcessOrder::dispatchNow($this->id, $cast);

            return true;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function isNominated()
    {
        if (Auth::check()) {
            $user = Auth::user();
        } else {
            return null;
        }

        return ($this->nominees()->where('user_id', $user->id)->first()) ? 1 : 0;
    }

    public function nightTime($stoppedAt)
    {
        $order = $this;

        $nightTime = 0;
        $startDate = Carbon::parse($order->date . ' ' . $order->start_time);
        $endDate = Carbon::parse($stoppedAt);

        $allowanceStartTime = Carbon::parse('00:01:00');
        $allowanceEndTime = Carbon::parse('04:00:00');

        $startDay = Carbon::parse($startDate)->startOfDay();
        $endDay = Carbon::parse($endDate)->startOfDay();

        $timeStart = Carbon::parse(Carbon::parse($startDate->format('H:i:s')));
        $timeEnd = Carbon::parse(Carbon::parse($endDate->format('H:i:s')));

        $allowance = false;

        if ($startDay->diffInDays($endDay) != 0 && $endDate->diffInMinutes($endDay) != 0) {
            $allowance = true;
        }

        if ($timeStart->between($allowanceStartTime, $allowanceEndTime) || $timeEnd->between($allowanceStartTime, $allowanceEndTime)) {
            $allowance = true;
        }

        if ($timeStart < $allowanceStartTime && $timeEnd > $allowanceEndTime) {
            $allowance = true;
        }

        if ($allowance) {
            $nightTime = $endDate->diffInMinutes($endDay);
        }

        return $nightTime;
    }

    public function allowance($nightTime)
    {
        if ($nightTime) {
            return 4000;
        }

        return 0;
    }

    public function orderPoint($cast = null, $startedAt = null, $stoppedAt = null, $orderDuration = null)
    {
        if (OrderType::NOMINATION != $this->type) {
            $cost = $this->castClass->cost;
        } else {
            if ($cast) {
                $cost = $cast->pivot->cost;
            } else {
                $cost = $this->castClass->cost;
            }
        }

        if (empty($orderDuration)) {
            $orderDuration = $this->duration * 60;
        }

        return ($cost / 2) * floor($orderDuration / 15);
    }

    public function orderFee($cast, $startedAt, $stoppedAt)
    {
        $order = $this;
        $orderFee = 0;
        $multiplier = 0;

        $startedAt = Carbon::parse($startedAt);
        $stoppedAt = Carbon::parse($stoppedAt);
        $castDuration = $startedAt->diffInMinutes($stoppedAt);
        $orderDuration = $this->duration * 60;
        if (OrderType::NOMINATION != $order->type && CastOrderType::NOMINEE == $cast->pivot->type) {
            if ($castDuration > $orderDuration) {
                while ($castDuration / 15 >= 1) {
                    $multiplier++;
                    $castDuration -= 15;
                }
            } else {
                $multiplier = floor($orderDuration / 15);
            }

            $orderFee = 500 * $multiplier;
            return $orderFee;
        }

        return $orderFee;
    }

    public function extraTime($startedAt, $stoppedAt)
    {
        $extralTime = 0;
        $orderDuration = $this->duration * 60;

        $castStartedAt = Carbon::parse($startedAt);
        $castStoppedAt = Carbon::parse($stoppedAt);
        $castDuration = $castStartedAt->diffInMinutes($castStoppedAt);

        if ($castDuration > $orderDuration) {
            $extralTime = $castDuration - $orderDuration;
        }

        return $extralTime;
    }

    public function extraPoint($cast, $extraTime)
    {
        $order = $this;
        $eTime = $extraTime;

        $extraPoint = 0;
        $multiplier = 0;
        if ($eTime >= 15) {
            while ($eTime / 15 >= 1) {
                $multiplier++;
                $eTime = $eTime - 15;
            }

            if (OrderType::NOMINATION != $order->type) {
                if ($order->castClass->id == CastClassType::BRONZE) {
                    $costPerFifteenMins = $order->castClass->cost / 2;
                } else {
                    $costPerFifteenMins = $cast->castClass->cost / 2;
                }
            } else {
                $costPerFifteenMins = $cast->pivot->cost / 2;
            }

            $extraPoint = ($costPerFifteenMins * 1.4) * $multiplier;
        }

        return $extraPoint;
    }

    public function getUserStatusAttribute()
    {
        if (!Auth::check()) {
            return null;
        }

        $user = Auth::user();

        $order = $this->castOrder->where('id', $user->id)->first();

        if (!$order) {
            return null;
        }

        return $order->pivot->status ?: 0;
    }

    public function getIsMatchingAttribute()
    {
        $matchingStatuses = [
            OrderStatus::ACTIVE,
            OrderStatus::PROCESSING,
            OrderStatus::DONE,
        ];

        return in_array($this->status, $matchingStatuses) ? 1 : 0;
    }

    public function getRoomIdAttribute($value)
    {
        if ($value) {
            return $value;
        }

        if (!$this->is_matching) {
            return '';
        }

        if ($this->total_cast > 1) {
            $room = Room::active()
                ->where('type', RoomType::GROUP)
                ->where('order_id', $this->id)
                ->first();

            if (!$room) {
                return '';
            }

            return $room->id;
        }

        $ownerId = $this->user_id;
        $cast = $this->casts()->first();
        if ($cast) {
            $castId = $cast->id;
            $room = $this->createDirectRoom($ownerId, $castId);

            return $room->id;
        }

        return '';
    }

    public function point()
    {
        return $this->hasOne(Point::class);
    }

    protected function isValidForSettlement()
    {
        if (OrderStatus::DONE == $this->status && OrderPaymentStatus::PAYMENT_FINISHED != $this->payment_status) {
            return true;
        }

        if (OrderStatus::CANCELED == $this->status && $this->cancel_fee_percent > 0
            && OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED != $this->payment_status) {
            return true;
        }

        return false;
    }

    public function settle()
    {
        if (!$this->isValidForSettlement()) {
            return;
        }

        $user = $this->user;
        $totalPoint = $this->total_point;

        if ($this->coupon_id) {
            $totalPoint = $totalPoint - $this->discount_point;
        }

        if ($totalPoint < 0) {
            $totalPoint = 0;
        }

        if ($user->point < $totalPoint) {
            $subPoint = $totalPoint - $user->point;
            $pointAmount = $subPoint;
            $point = $user->autoCharge($pointAmount);

            if (!$point) {
                throw new \Exception('Auto charge failed');
            }
        }

        // Hard delete TEMP point
        Point::withTrashed()->where('order_id', $this->id)->where('type', PointType::TEMP)->forceDelete();

        $point = new Point;
        $point->point = -$totalPoint;
        $point->balance = $user->point - $totalPoint;
        $point->user_id = $user->id;
        $point->order_id = $this->id;
        $point->type = PointType::PAY;
        $point->status = true;
        $point->save();

        $user->point = $point->balance;
        $user->save();

        $subPoint = $totalPoint;
        $points = Point::where('user_id', $user->id)
            ->where('balance', '>', 0)
            ->where(function ($query) {
                $query->whereIn('type', [PointType::BUY, PointType::AUTO_CHARGE, PointType::INVITE_CODE, PointType::DIRECT_TRANSFER])
                    ->orWhere(function ($subQ) {
                        $subQ->where('type', PointType::ADJUSTED)
                            ->where('is_cast_adjusted', false)
                            ->where('point', '>=', 0);
                });
            })
            ->orderBy('created_at')
            ->get();

        foreach ($points as $value) {
            if (0 == $subPoint) {
                break;
            } elseif ($value->balance > $subPoint && $subPoint > 0) {
                $value->balance = $value->balance - $subPoint;
                $value->update();

                $arr = $value->histories;
                if ($arr) {
                    $arr[$this->id] = [
                        'point_id' => $value->id,
                        'point' => $subPoint,
                        'user_id' => $value->user_id,
                        'order_id' => $this->id,
                        'order_type' => $this->type,
                        'created_at' => Carbon::now()->format('Y/m/d H:i'),
                    ];

                    $value->histories = $arr;
                    $value->update();
                } else {
                    $value->histories = [
                        $this->id => [
                            'point_id' => $value->id,
                            'point' => $subPoint,
                            'user_id' => $value->user_id,
                            'order_id' => $this->id,
                            'order_type' => $this->type,
                            'created_at' => Carbon::now()->format('Y/m/d H:i'),
                        ],
                    ];
                    $value->update();
                }

                break;
            } elseif ($value->balance <= $subPoint) {
                $arr = $value->histories;
                if ($arr) {
                    $arr[$this->id] = [
                        'point_id' => $value->id,
                        'point' => $value->balance,
                        'user_id' => $value->user_id,
                        'order_id' => $this->id,
                        'order_type' => $this->type,
                        'created_at' => Carbon::now()->format('Y/m/d H:i'),
                    ];

                    $value->histories = $arr;
                    $value->update();
                } else {
                    $value->histories = [
                        $this->id => [
                            'point_id' => $value->id,
                            'point' => $value->balance,
                            'user_id' => $value->user_id,
                            'order_id' => $this->id,
                            'order_type' => $this->type,
                            'created_at' => Carbon::now()->format('Y/m/d H:i'),
                        ],
                    ];
                    $value->update();
                }

                $subPoint -= $value->balance;

                $value->balance = 0;
                $value->update();
            }
        }

        $inviteCodeHistory = $user->inviteCodeHistory;
        if ($inviteCodeHistory) {
            if (InviteCodeHistoryStatus::PENDING == $inviteCodeHistory->status && $inviteCodeHistory->order_id == $this->id) {
                // $userInvite = $inviteCodeHistory->inviteCode->user;
                // $point = new Point;
                // $point->point = $inviteCodeHistory->point;
                // $point->balance = $inviteCodeHistory->point;
                // $point->user_id = $userInvite->id;
                // $point->order_id = $this->id;
                // $point->type = PointType::INVITE_CODE;
                // $point->invite_code_history_id = $inviteCodeHistory->id;
                // $point->status = true;
                // $point->created_at = now()->addSeconds(3);
                // $point->save();
                // $userInvite->point = $userInvite->point + $inviteCodeHistory->point;
                // $userInvite->save();

                // $point = new Point;
                // $point->point = $inviteCodeHistory->point;
                // $point->balance = $inviteCodeHistory->point;
                // $point->user_id = $user->id;
                // $point->order_id = $this->id;
                // $point->type = PointType::INVITE_CODE;
                // $point->invite_code_history_id = $inviteCodeHistory->id;
                // $point->status = true;
                // $point->created_at = now()->addSeconds(3);
                // $point->save();
                // $user->point = $user->point + $inviteCodeHistory->point;
                // $user->save();

                $inviteCodeHistory->status = InviteCodeHistoryStatus::RECEIVED;
                $inviteCodeHistory->order_id = $this->id;
                $inviteCodeHistory->save();
            }
        }

        return true;
    }

    public function getCallPointAttribute()
    {
        $totalPoint = 0;
        $types = [
            OrderType::CALL,
            OrderType::NOMINATED_CALL,
            OrderType::HYBRID,
        ];

        if (in_array($this->type, $types)) {
            $orderStartedAt = Carbon::parse($this->date . ' ' . $this->start_time);
            $orderStoppedAt = $orderStartedAt->copy()->addMinutes($this->duration * 60);
            $nightTime = $this->nightTime($orderStoppedAt);
            $allowance = $this->allowance($nightTime);
            $cost = $this->castClass->cost;
            $totalPoint += ($cost / 2) * floor(($this->duration * 60) / 15) + $allowance;
        }

        return $totalPoint;
    }

    public function getNomineePointAttribute()
    {
        $orderStartedAt = Carbon::parse($this->date . ' ' . $this->start_time);
        $orderStoppedAt = $orderStartedAt->copy()->addMinutes($this->duration * 60);
        $nightTime = $this->nightTime($orderStoppedAt);
        $allowance = $this->allowance($nightTime);
        $orderDuration = $this->duration * 60;

        try {
            if (OrderType::NOMINATION == $this->type) {
                $nommine = $this->nomineesWithTrashed->first();
                $cost = $nommine->pivot->cost;

                return ($cost / 2) * floor($orderDuration / 15) + $allowance;
            } else {
                $cost = $this->castClass->cost;
                $multiplier = 0;
                while ($orderDuration / 15 >= 1) {
                    $multiplier++;
                    $orderDuration -= 15;
                }
                $orderFee = 500 * $multiplier;
                $totalPoint = ($cost / 2) * floor($this->duration * 60 / 15) + $allowance + $orderFee;
                return $totalPoint;
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog('Nominee Point Error. Order Id: ' . $this->id);
            LogService::writeErrorLog($this->nomineesWithTrashed->first());
        }
    }

    public function getDiscountPointAttribute()
    {
        $discountPoint = 0;
        if ($this->coupon_id) {
            switch ($this->coupon_type) {
                case CouponType::POINT:
                    $discountPoint = (int) $this->coupon_value;
                    break;
                case CouponType::PERCENT:
                    $orderPoint = $this->total_point;
                    if (!isset($orderPoint) || 0 == $orderPoint) {
                        $casts = $this->casts()->get();
                        $orderPoint = 0;
                        $orderDuration = $this->duration * 60;
                        $orderStartedAt = Carbon::parse($this->date . ' ' . $this->start_time);
                        $orderStoppeddAt = $orderStartedAt->copy()->addMinutes($orderDuration);
                        $orderNightTime = $this->nightTime($orderStoppeddAt);
                        $orderAllowance = $this->allowance($orderNightTime);
                        if ($casts->count() == $this->total_cast) {
                            foreach ($casts as $cast) {
                                $orderFee = $this->orderFee($cast, $orderStartedAt, $orderStoppeddAt);
                                $orderPoint += $this->orderPoint($cast) + $orderAllowance + $orderFee;
                            }
                        } else {
                            for ($i = 0; $i < $this->total_cast; $i++) {
                                $cost = $this->castClass->cost;
                                $orderDuration = $this->duration * 60;
                                $orderPoint += ($cost / 2) * floor($orderDuration / 15) + $orderAllowance;
                            }
                        }
                    }

                    $discountPoint = $orderPoint * $this->coupon_value / 100;
                    break;
                case CouponType::TIME:
                    $casts = $this->casts()->get();
                    if ($casts->count() == $this->total_cast) {
                        $discountPoint = $this->orderPointDiscount($casts, $this->coupon_value * 60) + $this->orderFeeDiscount($casts, $this->coupon_value * 60);
                    } else {
                        $orderPoint = 0;
                        if (OrderType::NOMINATION == $this->type) {
                            $cast = \DB::table('cast_order')->where('order_id', $this->id)->first();
                            if ($cast) {
                                $cost = $cast->cost;
                                if (null === $cost) {
                                    $cost = $this->castClass->cost;
                                }
                            } else {
                                $cost = $this->castClass->cost;
                            }
                            $orderDuration = $this->coupon_value * 60;
                            $orderPoint += ($cost / 2) * floor($orderDuration / 15);
                        } else {
                            for ($i = 0; $i < $this->total_cast; $i++) {
                                $cost = $this->castClass->cost;
                                $orderDuration = $this->coupon_value * 60;
                                $orderPoint += ($cost / 2) * floor($orderDuration / 15);
                            }
                        }

                        $discountPoint = $orderPoint;
                    }
                    break;

                default:break;
            }

            if ($this->coupon_max_point) {
                if ($discountPoint > $this->coupon_max_point) {
                    $discountPoint = $this->coupon_max_point;
                }
            }
        }

        return $discountPoint;
    }

    public function orderPointDiscount($casts, $orderDuration)
    {
        $point = 0;

        foreach ($casts as $key => $cast) {
            $point += $this->orderPoint($cast, $startedAt = null, $stoppedAt = null, $orderDuration);
        }

        return $point;
    }

    public function orderFeeDiscount($casts, $orderDuration)
    {
        $point = 0;

        foreach ($casts as $cast) {
            $orderFee = 0;

            if (OrderType::NOMINATION != $this->type && CastOrderType::NOMINEE == $cast->pivot->type) {
                $multiplier = 0;

                while ($orderDuration / 15 >= 1) {
                    $multiplier++;
                    $orderDuration -= 15;
                }

                $orderFee = 500 * $multiplier;
            }

            $point += $orderFee;
        }

        return $point;
    }
}
