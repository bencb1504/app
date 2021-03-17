<?php

namespace App\Http\Controllers\Admin\Offer;

use App\Cast;
use App\CastClass;
use App\Enums\OfferStatus;
use App\Enums\OrderType;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Notifications\OfferMessageNotifyToAndroidGuest;
use App\Notifications\OfferMessageNotifyToLine;
use App\Offer;
use App\Prefecture;
use App\Services\LogService;
use App\User;
use Auth;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use JWTAuth;
use Session;

class OfferController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $offers = Offer::with('order');

        $keyword = $request->search;

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $offers->where(function ($query) use ($fromDate) {
                $query->whereDate('date', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $offers->where(function ($query) use ($toDate) {
                $query->whereDate('date', '<=', $toDate);
            });
        }

        $offers = $offers->orderByDesc('created_at')->get();

        if ($keyword) {
            $offers = $offers->filter(function ($offer) use ($keyword) {
                $casts = $offer->casts;
                $castsNickname = $casts->reject(function ($cast) use ($keyword) {
                    return str_is('*' . strtolower($keyword) . '*', strtolower($cast->nickname)) === false;
                });

                $offerId = strpos($offer->id, $keyword) !== false;

                $castId = in_array($keyword, $offer->cast_ids) !== false;

                $orderId = strpos($offer->order['id'], $keyword) !== false;

                return $castsNickname->count() > 0 || $offerId || $castId || $orderId;
            });
        }

        $total = $offers->count();
        $offers = $offers->forPage($request->page, $request->limit ?: 10);

        $offers = new LengthAwarePaginator($offers, $total, $request->limit ?: 10);
        $offers = $offers->withPath('');

        return view('admin.offers.index', compact('offers'));
    }

    public function create(Request $request)
    {
        $castClasses = CastClass::all();

        $client = new Client(['base_uri' => config('common.api_url')]);
        $user = Auth::user();

        $accessToken = JWTAuth::fromUser($user);

        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        $classId = $request->cast_class;
        if (!isset($classId)) {
            $classId = 1;
        }
        $params = [
            'page' => $request->get('page', 1),
            'latest' => 1,
            'class_id' => $classId,
            'per_page' => 18,
        ];

        if ($request->search) {
            $params['search'] = $request->search;
        }

        try {
            $casts = $client->get(route('casts.index', $params), $option);
            $prefectures = $client->get(route('prefectures', ['filter' => 'supported']));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $prefectures = json_decode(($prefectures->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $prefectures = $prefectures['data'];

        $casts = json_decode(($casts->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $casts = $casts['data'];
        $casts = new LengthAwarePaginator(
            $casts['data'],
            $casts['total'],
            $casts['per_page'],
            $casts['current_page'],
            [
                'query' => $request->all(),
                'path' => env('APP_URL') . '/admin/offers/create',
            ]
        );

        return view('admin.offers.create', compact('casts', 'castClasses', 'prefectures'));
    }

    public function confirm(Request $request)
    {
        if (!isset($request->cast_ids_offer)) {
            $request->session()->flash('cast_not_found', 'cast_not_found');

            if (isset($request->offer_id)) {
                return redirect()->route('admin.offers.edit', ['offer' => $request->offer_id, 'cast_class' => $request->class_id_offer]);
            }

            return redirect()->route('admin.offers.create', ['cast_class' => $request->class_id_offer]);
        }

        $data['cast_ids'] = explode(",", trim($request->cast_ids_offer, ","));

        $data['comment_offer'] = $request->comment_offer;
        if (!isset($data['comment_offer'])) {
            $request->session()->flash('message_exits', 'message_exits');

            if (isset($request->offer_id)) {
                return redirect()->route('admin.offers.edit', ['offer' => $request->offer_id, 'cast_class' => $request->class_id_offer]);
            }

            return redirect()->route('admin.offers.create', ['cast_class' => $request->class_id_offer]);
        }

        if (80 < mb_strlen($data['comment_offer'], 'UTF-8')) {
            $request->session()->flash('message_invalid', 'message_invalid');

            if (isset($request->offer_id)) {
                return redirect()->route('admin.offers.edit', ['offer' => $request->offer_id, 'cast_class' => $request->class_id_offer]);
            }

            return redirect()->route('admin.offers.create', ['cast_class' => $request->class_id_offer]);
        }

        $data['start_time'] = $request->start_time_offer;
        $data['end_time'] = $request->end_time_offer;
        $data['date_offer'] = $request->date_offer;
        $data['expired_date'] = $request->expired_date_offer . ' ' . $request->expired_time_offer;

        if (Carbon::now()->second(0)->addMinutes(30)->gt(Carbon::parse($data['expired_date']))) {
            $request->session()->flash('expired_date_not_valid', '開始時間は現在以降の時間を指定してください');

            if (isset($request->offer_id)) {
                return redirect()->route('admin.offers.edit', ['offer' => $request->offer_id, 'cast_class' => $request->class_id_offer]);
            }

            return redirect()->route('admin.offers.create', ['cast_class' => $request->class_id_offer]);
        }

        if (Carbon::now()->second(0)->addWeek()->lt(Carbon::parse($data['expired_date']))) {
            $request->session()->flash('time_out', '応募締切期限は最大で1週間までしか設定できません。');

            if (isset($request->offer_id)) {
                return redirect()->route('admin.offers.edit', ['offer' => $request->offer_id, 'cast_class' => $request->class_id_offer]);
            }

            return redirect()->route('admin.offers.create', ['cast_class' => $request->class_id_offer]);
        }

        $startTimeTo = explode(":", $data['end_time']);
        $hour = $startTimeTo[0];
        if (23 < $startTimeTo[0]) {
            switch ($startTimeTo[0]) {
                case 24:
                    $hour = '00';
                    break;
                case 25:
                    $hour = '01';
                    break;
                case 26:
                    $hour = '02';
                    break;
            }

            $validDate = Carbon::parse($data['date_offer'] . ' ' . $hour . ':' . $startTimeTo[1])->addDay();
        } else {
            $validDate = Carbon::parse($data['date_offer'] . ' ' . $data['end_time']);
        }

        if (Carbon::parse($data['expired_date'])->gt($validDate)) {
            $request->session()->flash('expired_date_not_valid', '開始時間は現在以降の時間を指定してください');

            if (isset($request->offer_id)) {
                return redirect()->route('admin.offers.edit', ['offer' => $request->offer_id, 'cast_class' => $request->class_id_offer]);
            }

            return redirect()->route('admin.offers.create', ['cast_class' => $request->class_id_offer]);
        }

        $data['duration_offer'] = $request->duration_offer;
        $data['area_offer'] = $request->area_offer;
        $data['current_point_offer'] = $request->current_point_offer;
        $data['class_id_offer'] = $request->class_id_offer;

        if (isset($request->offer_id)) {
            $data['offer_id'] = $request->offer_id;

            $offer = Offer::findOrFail($request->offer_id);

            if ($offer->guest_ids) {
                $data['guest_ids'] = implode(",", $offer->guest_ids);
            }
        }

        Session::put('offer', $data);

        $casts = Cast::whereIn('id', $data['cast_ids'])->get();
        $prefecture = Prefecture::find($request->area_offer)->name;

        return view('admin.offers.confirm', compact('casts', 'data', 'prefecture'));
    }

    public function price(Request $request, $offer = null)
    {
        $rules = $this->validate($request,
            [
                'date' => 'required|date|date_format:Y-m-d|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'duration' => 'numeric|min:1|max:10',
                'class_id' => 'exists:cast_classes,id',
                'type' => 'required|in:1,2,3,4',

                'nominee_ids' => '',
                'total_cast' => 'required|numeric|min:1',
            ]
        );

        if (isset($request->offer)) {
            $offer = $request->offer;
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

        $orderPoint = 0;
        $orderDuration = $request->duration * 60;
        $nomineeIds = explode(",", trim($request->nominee_ids, ","));

        if (OrderType::NOMINATION != $request->type) {
            $cost = CastClass::find($request->class_id)->cost;
            $orderPoint = $totalCast * (($cost / 2) * floor($orderDuration / 15));
        } else {
            $cost = Cast::find($nomineeIds[0])->cost;
            $orderPoint = ($cost / 2) * floor($orderDuration / 15);
        }

        //ordersFee

        $orderFee = 0;
        if (OrderType::NOMINATION != $request->type) {
            if (!isset($offer)) {
                if (!empty($nomineeIds[0])) {
                    $multiplier = floor($orderDuration / 15);
                    $orderFee = 500 * $multiplier * count($nomineeIds);
                }
            }
        }

        return ($orderPoint + $orderFee + $allowancePoint);
    }

    public function store(Request $request)
    {
        if (!$request->session()->has('offer')) {
            return redirect()->route('admin.offers.create');
        }

        $data = Session::get('offer');

        if (isset($data['offer_id'])) {
            $offer = Offer::findOrFail($data['offer_id']);
        } else {
            $offer = new Offer;
        }

        $startTimeTo = explode(":", $data['end_time']);
        if (23 < $startTimeTo[0]) {
            switch ($startTimeTo[0]) {
                case 24:
                    $hour = '00';
                    break;
                case 25:
                    $hour = '01';
                    break;
                case 26:
                    $hour = '02';
                    break;
            }

            $time = $hour . ':' . $startTimeTo[1];
        } else {
            $time = $data['end_time'];
        }

        $offer->start_time_to = $data['end_time'];

        $offer->comment = $data['comment_offer'];
        $offer->date = $data['date_offer'];
        $offer->start_time_from = $data['start_time'];
        $offer->start_time_to = $time;
        $offer->duration = $data['duration_offer'];
        $offer->total_cast = count($data['cast_ids']);
        $offer->prefecture_id = $data['area_offer'];
        $offer->temp_point = $data['current_point_offer'];
        $offer->class_id = $data['class_id_offer'];
        $offer->cast_ids = $data['cast_ids'];
        $offer->expired_date = $data['expired_date'];

        if (isset($request->save_temporarily)) {
            $offer->status = OfferStatus::INACTIVE;
        } else {
            $offer->status = OfferStatus::ACTIVE;
        }

        if ($request->device_type) {
            if ($request->choose_guest) {
                $arrIds = explode(",", trim($request->choose_guest, ","));
                $offer->guest_ids = $arrIds;

                $listGuests = User::whereIn('id', $arrIds)->get();
            } else {
                return redirect()->route('admin.offers.index');
            }
        }

        $offer->save();

        if (isset($request->line_offer)) {
            $guests = User::where('type', UserType::GUEST)->get();
            \Notification::send($guests, new OfferMessageNotifyToLine($offer->id));
        }

        if (isset($listGuests)) {
            \Notification::send($listGuests, new OfferMessageNotifyToAndroidGuest($offer->id));
        }

        if ($request->session()->has('offer')) {
            $request->session()->forget('offer');
        }

        return redirect()->route('admin.offers.index');
    }

    public function detail(Offer $offer)
    {
        $casts = Cast::whereIn('id', $offer->cast_ids)->get();

        $prefecture = Prefecture::find($offer->prefecture_id)->name;

        return view('admin.offers.detail', compact('offer', 'casts', 'prefecture'));
    }

    public function delete(Offer $offer)
    {
        $offer = Offer::findOrFail($offer->id);

        $offer->delete();

        return redirect()->route('admin.offers.index');
    }

    public function edit(Request $request, Offer $offer)
    {
        $castClasses = CastClass::all();

        $client = new Client(['base_uri' => config('common.api_url')]);
        $user = Auth::user();

        $accessToken = JWTAuth::fromUser($user);

        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        $classId = $request->cast_class;
        if (!isset($classId)) {
            $classId = $offer->class_id;
        }
        $params = [
            'page' => $request->get('page', 1),
            'latest' => 1,
            'class_id' => $classId,
            'per_page' => 18,
        ];

        if ($request->search) {
            $params['search'] = $request->search;
        }

        try {
            $casts = $client->get(route('casts.index', $params), $option);
            $prefectures = $client->get(route('prefectures', ['filter' => 'supported']));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $prefectures = json_decode(($prefectures->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $prefectures = $prefectures['data'];

        $casts = json_decode(($casts->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $casts = $casts['data'];
        $casts = new LengthAwarePaginator(
            $casts['data'],
            $casts['total'],
            $casts['per_page'],
            $casts['current_page'],
            [
                'query' => $request->all(),
                'path' => env('APP_URL') . '/admin/offers/edit/' . $offer->id,
            ]
        );

        return view('admin.offers.edit', compact('offer', 'casts', 'castClasses', 'prefectures'));
    }
}
