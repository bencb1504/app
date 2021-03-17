<?php

namespace App\Http\Controllers\Api;

use App\Cast;
use App\CastClass;
use App\Coupon;
use App\Enums\CastClassType;
use App\Enums\CastOrderStatus;
use App\Enums\CastOrderType;
use App\Enums\CouponType;
use App\Enums\InviteCodeHistoryStatus;
use App\Enums\OfferStatus;
use App\Enums\OrderPaymentMethod;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\ResignStatus;
use App\Enums\RoomType;
use App\Enums\TagType;
use App\Http\Resources\OrderResource;
use App\Notifications\AcceptedOffer;
use App\Notifications\CallOrdersCreated;
use App\Notifications\CreateNominatedOrdersForCast;
use App\Notifications\CreateNominationOrdersForCast;
use App\Offer;
use App\Order;
use App\Room;
use App\Services\LogService;
use App\Tag;
use App\Traits\DirectRoom;
use Carbon\Carbon;
use DB;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;

class OrderController extends ApiController
{
    use DirectRoom;

    public function create(Request $request)
    {
        $user = $this->guard()->user();

        if ($user->resign_status == ResignStatus::PENDING) {
            return $this->respondErrorMessage(trans('messages.order_resign_status_pending'), 412);
        }

        $rules = [
            'prefecture_id' => 'nullable|exists:prefectures,id',
            'address' => 'required',
            'date' => 'required|date|date_format:Y-m-d|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'duration' => 'required|numeric|min:1|max:10',
            'total_cast' => 'required|numeric|min:1',
            'temp_point' => 'required',
            'class_id' => 'required|exists:cast_classes,id',
            'type' => 'required|in:1,2,3,4',
            'tags' => '',
            'nominee_ids' => '',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        // Popup expired code invite
        $inviteCodeHistory = $user->inviteCodeHistory;
        if ($inviteCodeHistory && InviteCodeHistoryStatus::PENDING == $inviteCodeHistory->status) {
            $inviteCodeHistory->status = InviteCodeHistoryStatus::RECEIVED;
            $inviteCodeHistory->save();

            return $this->respondErrorMessage(trans('messages.friend_invitation_campaign_has_expired'), 405);
        }

        $transfer = $request->payment_method;
        if (isset($transfer)) {
            if (OrderPaymentMethod::CREDIT_CARD == $transfer || OrderPaymentMethod::DIRECT_PAYMENT == $transfer) {
                if (OrderPaymentMethod::DIRECT_PAYMENT == $transfer) {
                    $accessToken = JWTAuth::fromUser($user);

                    $client = new Client([
                        'base_uri' => config('common.api_url'),
                        'headers' => [
                            'Content-Type' => 'application/json',
                            'Authorization' => 'Bearer ' . $accessToken,
                        ],
                    ]);

                    try {
                        $pointUsed = $client->request('GET', route('guest.points_used'));

                        $pointUsed = json_decode(($pointUsed->getBody())->getContents(), JSON_NUMERIC_CHECK);
                        $pointUsed = $pointUsed['data'];
                    } catch (\Exception $e) {
                        return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
                    }

                    if ((float) ($request->temp_point + $pointUsed) > (float) $user->point) {
                        return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
                    }
                }
            } else {
                return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
            }
        }

        $input = $request->only([
            'prefecture_id',
            'address',
            'date',
            'start_time',
            'duration',
            'total_cast',
            'temp_point',
            'class_id',
            'type',
        ]);

        $start_time = Carbon::parse($request->date . ' ' . $request->start_time);
        $end_time = $start_time->copy()->addHours($input['duration']);

        if (now()->second(0)->diffInMinutes($start_time, false) < 29) {
            return $this->respondErrorMessage(trans('messages.time_invalid'), 400);
        }

        if (!$request->payment_method || OrderPaymentMethod::DIRECT_PAYMENT != $request->payment_method) {
            if (!$user->is_card_registered) {
                return $this->respondErrorMessage(trans('messages.card_not_exist'), 404);
            }
        }

        if (!$request->nominee_ids) {
            $input['type'] = OrderType::CALL;
        } else {
            $listNomineeIds = explode(",", trim($request->nominee_ids, ","));
            $counter = Cast::whereIn('id', $listNomineeIds)->count();

            if ($request->total_cast != $counter) {
                $input['type'] = OrderType::HYBRID;
            }
        }

        $input['end_time'] = $end_time->format('H:i');

        if (!$request->prefecture_id) {
            $input['prefecture_id'] = 13;
        }

        $coupon = null;
        if ($request->coupon_id) {
            $coupon = $user->coupons()
                ->where('coupon_id', $request->coupon_id)
                ->where('is_active', true)
                ->first();

            if ($coupon) {
                return $this->respondErrorMessage(trans('messages.coupon_invalid'), 409);
            }

            $coupon = Coupon::find($request->coupon_id);
            if (!$this->isValidCoupon($coupon, $user, $request->all())) {
                return $this->respondErrorMessage(trans('messages.coupon_invalid'), 409);
            }
        }

        $input['status'] = OrderStatus::OPEN;

        if ($request->payment_method) {
            $input['payment_method'] = $request->payment_method;
        }

        try {
            $when = Carbon::now()->addSeconds(3);
            DB::beginTransaction();
            $order = $user->orders()->create($input);

            if ($coupon) {
                $order->coupon_id = $request->coupon_id;
                $order->coupon_name = $request->coupon_name;
                $order->coupon_type = $request->coupon_type;
                $order->coupon_value = $request->coupon_value;
                $order->coupon_max_point = $request->coupon_max_point;
                $order->save();
                $user->coupons()->attach($request->coupon_id, ['order_id' => $order->id]);
            }

            if ($request->tags) {
                $listTags = explode(",", trim($request->tags, ","));
                $tagIds = Tag::whereIn('name', $listTags)->whereIn('type', [TagType::DESIRE, TagType::SITUATION])->pluck('id');
                $order->tags()->attach($tagIds);
            }

            if (OrderType::CALL != $input['type']) {
                if (count($listNomineeIds) != $counter) {
                    return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
                }

                $order->nominees()->attach($listNomineeIds, [
                    'type' => CastOrderType::NOMINEE,
                    'status' => CastOrderStatus::OPEN,
                ]);

                if (1 == $request->total_cast && 1 == $counter) {
                    $ownerId = $order->user_id;
                    $nominee = $order->nominees()->first();
                    $room = $this->createDirectRoom($ownerId, $nominee->id);

                    $order->room_id = $room->id;
                    $order->save();

                    if (OrderType::NOMINATION == $order->type) {
                        $order->nominees()->updateExistingPivot(
                            $nominee->id,
                            [
                                'cost' => $nominee->cost,
                            ],
                            false
                        );

                        $nominee->notify(
                            (new CreateNominationOrdersForCast($order->id))->delay(now()->addSeconds(3))
                        );
                    }
                }

                if (OrderType::NOMINATED_CALL == $order->type || OrderType::HYBRID == $order->type) {
                    $nominees = $order->nominees;

                    \Notification::send(
                        $nominees,
                        (new CreateNominatedOrdersForCast($order->id))->delay(now()->addSeconds(3))
                    );
                }
            } else {
                if ($request->class_id == CastClassType::BRONZE) {
                    $casts = Cast::whereIn('class_id', [CastClassType::BRONZE, CastClassType::PLANTIUM])->get();
                } else {
                    $casts = Cast::where('class_id', $request->class_id)->get();
                }

                \Notification::send(
                    $casts,
                    (new CallOrdersCreated($order->id))->delay(now()->addSeconds(3))
                );
            }

            $inviteCodeHistory = $user->inviteCodeHistory;
            if ($inviteCodeHistory) {
                if (InviteCodeHistoryStatus::PENDING == $inviteCodeHistory->status && null == $inviteCodeHistory->order_id) {
                    $inviteCodeHistory->order_id = $order->id;
                    $inviteCodeHistory->save();
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithData(OrderResource::make($order));
    }

    public function show($id)
    {
        $order = Order::with('tags', 'user', 'casts')->find($id);

        if (!$order) {
            return $this->respondErrorMessage(trans('messages.order_not_found'), 404);
        }

        return $this->respondWithData(new OrderResource($order));
    }

    public function price(Request $request, $offer = null)
    {
        if (isset($request->offer)) {
            $offer = $request->offer;
        }

        $couponDuration = 0;
        if (isset($request->duration_coupon)) {
            $couponDuration = $request->duration_coupon;
        }

        $rules = [
            'date' => 'required|date|date_format:Y-m-d|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'duration' => 'numeric|min:1|max:10',
            'class_id' => 'exists:cast_classes,id',
            'type' => 'required|in:1,2,3,4',
            'nominee_ids' => '',
            'total_cast' => 'required|numeric|min:1',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $orderStartTime = Carbon::parse($request->date . ' ' . $request->start_time);
        $stoppedAt = $orderStartTime->copy()->addHours($request->duration);

        //nightTime

        $nightTime = 0;
        $allowanceStartTime = Carbon::parse('00:01:00');
        $allowanceEndTime = Carbon::parse('04:00:00');

        $startDay = Carbon::parse($orderStartTime)->startOfDay();
        $endDay = Carbon::parse($stoppedAt)->startOfDay();

        $timeStart = Carbon::parse(Carbon::parse($orderStartTime->format('H:i:s')));
        $timeEnd = Carbon::parse(Carbon::parse($stoppedAt->format('H:i:s')));

        $allowance = false;

        if ($startDay->diffInDays($endDay) != 0 && $stoppedAt->diffInMinutes($endDay) != 0) {
            $allowance = true;
        }

        if ($timeStart->between($allowanceStartTime, $allowanceEndTime) || $timeEnd->between($allowanceStartTime, $allowanceEndTime)) {
            $allowance = true;
        }

        if ($timeStart < $allowanceStartTime && $timeEnd > $allowanceEndTime) {
            $allowance = true;
        }

        if ($allowance) {
            $nightTime = $stoppedAt->diffInMinutes($endDay);
        }

        //allowance

        $totalCast = $request->total_cast;
        $allowancePoint = 0;
        if ($nightTime) {
            $allowancePoint = $totalCast * 4000;
        }

        //orderPoint
        $orderPointCoupon = 0;
        $orderPoint = 0;
        $orderDuration = $request->duration * 60;
        $nomineeIds = explode(",", trim($request->nominee_ids, ","));

        if (OrderType::NOMINATION != $request->type) {
            $cost = CastClass::find($request->class_id)->cost;
            $orderPoint = $totalCast * (($cost / 2) * floor($orderDuration / 15));

            if ($couponDuration) {
                $orderPointCoupon = $totalCast * (($cost / 2) * floor(($couponDuration * 60) / 15));
            }
        } else {
            $cost = Cast::find($nomineeIds[0])->cost;
            $orderPoint = ($cost / 2) * floor($orderDuration / 15);

            if ($couponDuration) {
                $orderPointCoupon = ($cost / 2) * floor(($couponDuration * 60) / 15);
            }
        }

        //ordersFee

        $orderFee = 0;
        $orderFeeCoupon = 0;
        if (OrderType::NOMINATION != $request->type) {
            if (!isset($offer)) {
                if (!empty($nomineeIds[0])) {
                    $multiplier = floor($orderDuration / 15);
                    $orderFee = 500 * $multiplier * count($nomineeIds);

                    if ($couponDuration) {
                        $multiplierCoupon = floor($couponDuration / 15);
                        $orderFeeCoupon = 500 * $multiplierCoupon * count($nomineeIds);
                    }
                }
            }
        }

        if (isset($offer)) {
            return $this->respondWithData([
                'order_point' => $orderPoint,
                'order_fee' => $orderFee,
                'allowance_point' => $allowancePoint,
                'order_point_coupon' => $orderPointCoupon,
                'order_fee_coupon' => $orderFeeCoupon,
            ]);
        } else {
            if ($couponDuration) {
                return $this->respondWithData([
                    'order_point_coupon' => $orderPointCoupon,
                    'order_fee_coupon' => $orderFeeCoupon,
                    'allowance_point' => $allowancePoint,
                    'total_point' => $orderPoint + $orderFee + $allowancePoint,
                ]);
            } else {

                return $this->respondWithData($orderPoint + $orderFee + $allowancePoint);
            }
        }
    }

    public function getDayOfMonth(Request $request)
    {
        $month = $request->month;

        return getDay($month);
    }

    public function createOrderOffer(Request $request)
    {
        $user = $this->guard()->user();

        if ($user->resign_status == ResignStatus::PENDING) {
            return $this->respondErrorMessage(trans('messages.order_resign_status_pending'), 412);
        }

        $input = $request->only([
            'prefecture_id',
            'address',
            'date',
            'start_time',
            'duration',
            'total_cast',
            'temp_point',
            'class_id',
            'type',
            'offer_id',
        ]);

        $offer = Offer::find($request->offer_id);

        if (!$offer || OfferStatus::ACTIVE != $offer->status) {
            return $this->respondErrorMessage(trans('messages.order_timeout'), 422);
        }

        if (!$request->payment_method || OrderPaymentMethod::DIRECT_PAYMENT != $request->payment_method) {
            if (!$user->is_card_registered) {
                return $this->respondErrorMessage(trans('messages.card_not_exist'), 404);
            }
        }

        if ($offer->total_cast != $request->total_cast) {
            return $this->respondErrorMessage(trans('messages.admin_edited_order'), 406);
        }

        $castIds = explode(",", trim($request->nominee_ids, ","));
        foreach ($castIds as $castId) {
            if (!in_array($castId, $offer->cast_ids)) {
                return $this->respondErrorMessage(trans('messages.admin_edited_order'), 406);
            }
        }

        if ($offer->class_id != $request->class_id) {
            return $this->respondErrorMessage(trans('messages.admin_edited_order'), 406);
        }

        if ($offer->duration != $request->duration) {
            return $this->respondErrorMessage(trans('messages.admin_edited_order'), 406);
        }

        if ($offer->prefecture_id != $request->prefecture_id) {
            return $this->respondErrorMessage(trans('messages.admin_edited_order'), 406);
        }

        $now = Carbon::now()->second(0);

        $start_time = Carbon::parse($request->date . ' ' . $request->start_time);

        $end_time = $start_time->copy()->addHours($input['duration']);

        $startHourFrom = (int) Carbon::parse($offer->start_time_from)->format('H');
        $startHourTo = (int) Carbon::parse($offer->start_time_to)->format('H');

        $startTimeTo = Carbon::createFromFormat('Y-m-d H:i:s', $offer->date . ' ' . $offer->start_time_to);
        if ($startHourTo < $startHourFrom) {
            $startTimeTo = $startTimeTo->copy()->addDay();
        }

        $startTimeFrom = Carbon::createFromFormat('Y-m-d H:i:s', $offer->date . ' ' . $offer->start_time_from);

        if (!$start_time->between($startTimeFrom, $startTimeTo)) {
            return $this->respondErrorMessage(trans('messages.admin_edited_order'), 406);
        }

        if ($now->second(0)->diffInMinutes($start_time, false) < 29) {
            return $this->respondErrorMessage(trans('messages.time_invalid'), 400);
        }

        $coupon = null;
        if ($request->coupon_id) {
            $coupon = $user->coupons()->where('coupon_id', $request->coupon_id)->first();

            if ($coupon) {
                return $this->respondErrorMessage(trans('messages.coupon_invalid'), 409);
            }

            $coupon = Coupon::find($request->coupon_id);
            if (!$this->isValidCoupon($coupon, $user, $request->all())) {
                return $this->respondErrorMessage(trans('messages.coupon_invalid'), 409);
            }
        }

        $input['end_time'] = $end_time->format('H:i');

        $input['status'] = OrderStatus::ACTIVE;

        if ($request->payment_method) {
            $input['payment_method'] = $request->payment_method;
        }

        try {
            DB::beginTransaction();
            $order = $user->orders()->create($input);
            $order->nominees()->attach($castIds, [
                'type' => CastOrderType::CANDIDATE,
                'status' => CastOrderStatus::ACCEPTED,
                'accepted_at' => Carbon::now(),
            ]);

            $orderStartTime = Carbon::parse($order->date . ' ' . $order->start_time);
            $orderEndTime = $orderStartTime->copy()->addMinutes($order->duration * 60);
            $nightTime = $order->nightTime($orderEndTime);
            $allowance = $order->allowance($nightTime);

            foreach ($castIds as $castId) {
                $orderPoint = $order->orderPoint();
                $order->nominees()->updateExistingPivot(
                    $castId,
                    [
                        'temp_point' => $orderPoint + $allowance,
                    ],
                    false
                );
            }

            if (1 == count($castIds)) {
                $room = $this->createDirectRoom($user->id, $castIds[0]);
            } else {
                $room = new Room;
                $room->order_id = $order->id;
                $room->owner_id = $order->user_id;
                $room->type = RoomType::GROUP;
                $room->save();

                $casts = $order->casts()->get();

                $data = [$order->user_id];
                foreach ($casts as $cast) {
                    $data = array_merge($data, [$cast->pivot->user_id]);
                }

                $room->users()->attach($data);
            }

            $order->room_id = $room->id;
            if ($coupon) {
                $order->coupon_id = $request->coupon_id;
                $order->coupon_name = $request->coupon_name;
                $order->coupon_type = $request->coupon_type;
                $order->coupon_value = $request->coupon_value;
                $order->coupon_max_point = $request->coupon_max_point;

                $user->coupons()->attach($request->coupon_id, ['order_id' => $order->id]);
            }

            $order->update();

            $offer->status = OfferStatus::DONE;
            $offer->update();
            $delay = Carbon::now()->addSeconds(3);
            $order->user->notify((new AcceptedOffer($order->id))->delay($delay));

            $inviteCodeHistory = $user->inviteCodeHistory;
            if ($inviteCodeHistory) {
                if (InviteCodeHistoryStatus::PENDING == $inviteCodeHistory->status && null == $inviteCodeHistory->order_id) {
                    $inviteCodeHistory->order_id = $order->id;
                    $inviteCodeHistory->save();
                }
            }
            DB::commit();

            return $this->respondWithData(new OrderResource($order));
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    private function isValidCoupon($coupon, $user, $input)
    {
        if (!isset($input['coupon_max_point']) || 'null' == $input['coupon_max_point']) {
            $input['coupon_max_point'] = null;
        }

        $now = now();
        $createdAtOfUser = Carbon::parse($user->created_at);
        $isValid = true;
        if ($coupon->is_filter_after_created_date && $coupon->filter_after_created_date) {
            if ($now->diffInDays($createdAtOfUser) > $coupon->filter_after_created_date) {
                $isValid = false;
            }
        }

        if ($coupon->type != $input['coupon_type'] || trim($coupon->name) != trim($input['coupon_name']) || $coupon->max_point
            != $input['coupon_max_point']) {
            $isValid = false;
        }

        switch ($coupon->type) {
            case CouponType::POINT:
                if ($coupon->point != $input['coupon_value']) {
                    $isValid = false;
                }
                break;
            case CouponType::TIME:
                if ($coupon->time != $input['coupon_value']) {
                    $isValid = false;
                }
                break;
            case CouponType::PERCENT:
                if ($coupon->percent != $input['coupon_value']) {
                    $isValid = false;
                }
                break;
            default:break;
        }

        return $isValid;
    }
}
