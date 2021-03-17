<?php

namespace App\Http\Controllers;

use App\Cast;
use App\Enums\OfferStatus;
use App\Enums\OrderPaymentMethod;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentRequestStatus;
use App\Enums\PointType;
use App\Enums\TagType;
use App\Enums\UserType;
use App\Notifications\AutoChargeFailedLineNotify;
use App\Notifications\AutoChargeFailedWorkchatNotify;
use App\Offer;
use App\Order;
use App\Point;
use App\Services\LogService;
use App\Transfer;
use App\User;
use Auth;
use Carbon\Carbon;
use DB;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;
use Session;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $client = new Client(['base_uri' => config('common.api_url')]);
        $user = Auth::user();

        $accessToken = JWTAuth::fromUser($user);

        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        try {
            $response = $client->get(route('guest.index', ['status' => OrderStatus::ACTIVE]), $option);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $result = $response->getBody();
        $contents = $result->getContents();
        $contents = json_decode($contents, JSON_NUMERIC_CHECK);
        $orders = $contents['data'];

        return view('web.orders.list', compact('orders'));
    }

    public function call(Request $request)
    {
        $client = new Client(['base_uri' => config('common.api_url')]);
        $user = Auth::user();

        $accessToken = JWTAuth::fromUser($user);

        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        try {
            $orderOptions = $client->get(route('glossaries'), $option);

            $prefectures = $client->get(route('prefectures', ['filter' => 'supported']));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $orderOptions = json_decode(($orderOptions->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $orderOptions = $orderOptions['data']['order_options'];

        $prefectures = json_decode(($prefectures->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $prefectures = $prefectures['data'];

        return view('web.orders.create_call', compact('orderOptions', 'prefectures'));
    }

    public function selectTags(Request $request)
    {
        $client = new Client(['base_uri' => config('common.api_url')]);

        try {
            $desires = $client->get(route('tags', ['type' => TagType::DESIRE]));

            $desires = json_decode(($desires->getBody())->getContents(), JSON_NUMERIC_CHECK);

            $situations = $client->get(route('tags', ['type' => TagType::SITUATION]));

            $situations = json_decode(($situations->getBody())->getContents(), JSON_NUMERIC_CHECK);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        return view('web.orders.set_tags', compact('desires', 'situations'));
    }

    public function selectCasts(Request $request)
    {
        return view('web.orders.select_casts');
    }

    public function attention(Request $request)
    {
        return view('web.orders.attention');
    }

    public function nominateAttention()
    {
        return view('web.orders.nominate_attention');
    }

    public function confirm(Request $request)
    {
        return view('web.orders.confirm_orders');
    }

    public function cancel()
    {
        return view('web.orders.cancel');
    }

    public function history(Request $request, $orderId)
    {
        $user = Auth::user();
        $accessToken = JWTAuth::fromUser(Auth::user());
        $client = new Client();
        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        $response = $client->get(route('guest.get_payment_requests', ['id' => $orderId]), $option);
        $response = json_decode($response->getBody()->getContents());

        if (!$response->status) {
            return redirect()->back();
        }
        $order = $response->data;

        return view('web.orders.history', compact('order', 'user'));
    }

    public function pointSettlement(Request $request, $id)
    {
        $user = Auth::user();

        $order = Order::where(function ($query) {
            $query->where('payment_status', OrderPaymentStatus::REQUESTING)
                ->orWhere('payment_status', OrderPaymentStatus::PAYMENT_FAILED);
        })->find($id);

        if (!$order) {
            return redirect()->back();
        }

        if ($order && (OrderPaymentMethod::CREDIT_CARD == $order->payment_method)) {
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

            return response()->json(['success' => true, 'message' => trans('messages.payment_completed')], 200);
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
            return response()->json(['success' => false], 500);
        }
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

    public function nominate(Request $request)
    {
        $id = $request->id;
        $user = Auth::user();
        $token = JWTAuth::fromUser($user);

        $authorization = empty($token) ?: 'Bearer ' . $token;
        $client = new Client([
            'base_uri' => config('common.api_url'),
            'http_errors' => false,
            'debug' => false,
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => $authorization,
                'Content-Type' => 'application/json',
            ],
        ]);

        try {
            $cast = $client->get(route('users.show', $id));
            $cast = json_decode(($cast->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $cast = $cast['data'];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
        $user = \Auth::user();

        if (UserType::CAST != $cast['type']) {
            return redirect()->route('web.index');
        }

        $client = new Client(['base_uri' => config('common.api_url')]);
        $user = Auth::user();

        $accessToken = JWTAuth::fromUser($user);

        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        try {
            $orderOptions = $client->get(route('glossaries'), $option);
            $prefectures = $client->get(route('prefectures', ['filter' => 'supported']));

            $prefectureId = 13;
            if ($cast['prefecture_id']) {
                $prefectureId = $cast['prefecture_id'];
            }

            $municipalities = $client->get(route('municipalities', ['prefecture_id' => $prefectureId]));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $orderOptions = json_decode(($orderOptions->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $orderOptions = $orderOptions['data']['order_options'];

        $municipalities = json_decode(($municipalities->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $municipalities = $municipalities['data'];

        $prefectures = json_decode(($prefectures->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $prefectures = $prefectures['data'];

        return view('web.orders.nomination', compact('cast', 'user', 'orderOptions', 'municipalities', 'prefectures'));
    }

    public function createNominate(Request $request)
    {
        $user = Auth::user();

        $accessToken = JWTAuth::fromUser($user);

        $client = new Client([
            'base_uri' => config('common.api_url'),
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $accessToken,
            ],
        ]);

        $tempPoint = $request->current_temp_point;
        $transfer = $request->transfer_order_nominate;

        if (isset($transfer)) {
            if (OrderPaymentMethod::CREDIT_CARD == $transfer || OrderPaymentMethod::DIRECT_PAYMENT == $transfer) {
                if (OrderPaymentMethod::DIRECT_PAYMENT == $transfer) {
                    try {
                        $pointUsed = $client->request('GET', route('guest.points_used'));

                        $pointUsed = json_decode(($pointUsed->getBody())->getContents(), JSON_NUMERIC_CHECK);
                        $pointUsed = $pointUsed['data'];
                    } catch (\Exception $e) {
                        LogService::writeErrorLog($e);
                        return redirect()->route('web.login');
                    }

                    if ((int) ($tempPoint + $pointUsed) > (int) $user->point) {
                        if ((int) $pointUsed > (int) $user->point) {
                            $point = $tempPoint;
                        } else {
                            $point = (int) ($tempPoint + $pointUsed) - (int) $user->point;
                        }

                        return redirect()->route('guest.transfer', ['point' => $point]);
                    }
                }
            } else {
                return redirect()->route('web.login');
            }
        }

        $prefecture = $request->prefecture_nomination;
        $area = $request->nomination_area;
        $otherArea = $request->other_area_nomination;
        if (!isset($area)) {
            return redirect()->back();
        }

        if ('その他' == $area && !$otherArea) {
            return redirect()->back();
        }

        if ('その他' == $area && $otherArea) {
            $area = $otherArea;
        }

        if (!$request->time_join_nomination) {
            return redirect()->back();
        }

        $now = Carbon::now();
        if ('other_time' == $request->time_join_nomination) {
            $checkMonth = $now->month;
            if ($checkMonth > $request->sl_month_nomination) {
                $year = $now->year + 1;
            } else {
                $year = $now->year;
            }

            if ($request->sl_month_nomination < 10) {
                $month = '0' . $request->sl_month_nomination;
            } else {
                $month = $request->sl_month_nomination;
            }

            if ($request->sl_date_nomination < 10) {
                $date = '0' . $request->sl_date_nomination;
            } else {
                $date = $request->sl_date_nomination;
            }

            if ($request->sl_hour_nomination < 10) {
                $hour = '0' . $request->sl_hour_nomination;
            } else {
                $hour = $request->sl_hour_nomination;
            }

            if ($request->sl_minute_nomination < 10) {
                $minute = '0' . $request->sl_minute_nomination;
            } else {
                $minute = $request->sl_minute_nomination;
            }

            $date = $year . '-' . $month . '-' . $date;
            $time = $hour . ':' . $minute;
        } else {
            $now->addMinutes($request->time_join_nomination);

            $date = $now->format('Y-m-d');
            $time = $now->format('H:i');
        }

        $classId = $request->class_id;

        //duration
        $duration = $request->time_set_nomination;

        if (!$duration || ('other_time_set' != $duration && $duration <= 0)) {
            return redirect()->back();
        }

        if ('other_time_set' == $duration) {
            if ($request->sl_duration < 0) {
                return redirect()->back();
            }

            $duration = $request->sl_duration_nominition;
        }

        $input = [
            'prefecture_id' => $prefecture,
            'address' => $area,
            'type' => OrderType::NOMINATION,
            'class_id' => $classId,
            'duration' => $duration,
            'date' => $date,
            'start_time' => $time,
            'temp_point' => $tempPoint,
            'total_cast' => 1,
            'nominee_ids' => $request->cast_id,
        ];

        if ($request->select_coupon) {
            $input['coupon_id'] = $request->select_coupon;
            $input['coupon_name'] = $request->name_coupon;
            $input['coupon_value'] = $request->value_coupon;
            $input['coupon_type'] = $request->type_coupon;

            $input['coupon_max_point'] = null;
            if ($request->max_point_coupon) {
                $input['coupon_max_point'] = $request->max_point_coupon;
            }
        }

        if (isset($transfer)) {
            $input['payment_method'] = $transfer;
        }

        try {
            $order = $client->request('POST', route('orders.create'), [
                'form_params' => $input,
            ]);

            $order = json_decode(($order->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $order = $order['data'];

            return redirect()->route('message.messages', ['room' => $order['room_id']]);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            $statusCode = $e->getResponse()->getStatusCode();

            if (401 == $statusCode) {
                return redirect()->route('web.login');
            } else {
                $request->session()->flash('status_code', $statusCode);

                return redirect()->back();
            }
        }
    }

    public function loadMoreListOrder(Request $request)
    {
        try {
            $user = Auth::user();
            $token = JWTAuth::fromUser($user);

            $authorization = empty($token) ?: 'Bearer ' . $token;
            $client = new Client([
                'base_uri' => config('common.api_url'),
                'http_errors' => false,
                'debug' => false,
                'headers' => [
                    'Accept' => 'application/json',
                    'Authorization' => $authorization,
                    'Content-Type' => 'application/json',
                ],
            ]);
            $orders = $client->request('GET', request()->next_page);

            $orders = json_decode(($orders->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $orders = $orders['data'];

            return [
                'next_page' => $orders['next_page_url'],
                'view' => view('web.orders.load_more_list_orders', compact('orders'))->render(),
            ];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function loadMoreListCast(Request $request)
    {
        try {
            $user = Auth::user();
            $token = JWTAuth::fromUser($user);

            $authorization = empty($token) ?: 'Bearer ' . $token;
            $client = new Client([
                'base_uri' => config('common.api_url'),
                'http_errors' => false,
                'debug' => false,
                'headers' => [
                    'Accept' => 'application/json',
                    'Authorization' => $authorization,
                    'Content-Type' => 'application/json',
                ],
            ]);
            $casts = $client->request('GET', request()->next_page);

            $casts = json_decode(($casts->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $casts = $casts['data'];

            return [
                'next_page' => $casts['next_page_url'],
                'view' => view('web.orders.load_more_list_casts', compact('casts'))->render(),
            ];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function castDetail($id)
    {
        try {
            $client = new Client(['base_uri' => config('common.api_url')]);
            $user = Auth::user();

            $accessToken = JWTAuth::fromUser($user);

            $option = [
                'headers' => ['Authorization' => 'Bearer ' . $accessToken],
                'form_params' => [],
                'allow_redirects' => false,
            ];

            try {
                $params = [
                    'id' => $id,
                ];

                $casts = $client->get(route('users.show', $params), $option);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                abort(500);
            }

            $cast = json_decode(($casts->getBody())->getContents(), JSON_NUMERIC_CHECK);

            $cast = $cast['data'];

            return view('web.orders.cast_detail', compact('cast'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function offer(Request $request)
    {
        $client = new Client(['base_uri' => config('common.api_url')]);
        $user = Auth::user();
        if ($user->is_cast) {
            abort(500);
        }

        try {
            $id = $request->id;
            $offer = Offer::withTrashed()->where('id', $id)->whereIn('status', [OfferStatus::ACTIVE, OfferStatus::DONE, OfferStatus::TIMEOUT])->first()
            ;

            if (!isset($offer)) {
                return redirect()->route('web.index');
            }

            $casts = Cast::whereIn('id', $offer->cast_ids)->with('castClass')->get();
            $prefectures = $client->get(route('prefectures', ['filter' => 'supported']));
            $municipalities = $client->get(route('municipalities', ['prefecture_id' => $offer->prefecture_id]));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $prefectures = json_decode(($prefectures->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $prefectures = $prefectures['data'];

        $municipalities = json_decode(($municipalities->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $municipalities = $municipalities['data'];

        return view('web.orders.offer', compact('offer', 'casts', 'prefectures', 'municipalities'));
    }

    public function offerAttention()
    {
        return view('web.orders.nominate_attention');
    }
}
