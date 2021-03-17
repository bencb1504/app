<?php

namespace App\Http\Controllers;

use App\Enums\OrderPaymentStatus;
use App\Order;
use Illuminate\Http\Request;

class RedirectController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->page;

        switch ($page) {
            case 'call':
                return \Redirect::to(route('guest.orders.call'));
            case 'room':
                return \Redirect::to(route('message.messages', ['room' => $request->room_id, 'matching_completed' =>
                    true, 'order_id' => $request->order_id]));
            case 'evaluation':
                $order = Order::find($request->order_id);
                $casts = $order->casts;

                $rated = true;
                foreach ($casts as $cast) {
                    if (!$cast->pivot->guest_rated) {
                        $rated = false;
                        break;
                    }
                }

                if (OrderPaymentStatus::PAYMENT_FINISHED == $order->payment_status && $rated) {
                    return \Redirect::to(route('history.show', ['orderId' => $request->order_id]));
                }

                return \Redirect::to(route('evaluation.index', ['order_id' => $request->order_id]));
            case 'message':
                return \Redirect::to(route('message.index'));
            case 'credit_card':
                $paymentService = config('common.payment_service');

                if ('telecom_credit' != $paymentService) {
                    \Session::put('order_history', $request->order_id);

                    return \Redirect::to(route('credit_card.update'));
                } else {
                    $paramsArray = [
                        'clientip' => env('TELECOM_CREDIT_CLIENT_IP'),
                        'usrtel' => auth()->user()->phone,
                        'usrmail' => 'question.cheers@gmail.com',
                        'user_id' => auth()->user()->id,
                        'redirect_url' => route('history.show', ['orderId' => $request->order_id]),
                    ];

                    $queryString = http_build_query($paramsArray);

                    return \Redirect::to(env('TELECOM_CREDIT_VERIFICATION_URL') . '?' . $queryString);
                }
            case 'cast':
                return \Redirect::to(route('cast.show', ['id' => $request->cast_id]));
            case 'offers':
                return \Redirect::to(route('guest.orders.offers', ['id' => $request->offer_id]));
            case 'purchase':
                return \Redirect::to(route('purchase.index'));
            case 'require_transfer_point':
                return \Redirect::to(route('guest.transfer', ['point' => $request->point, 'order_id' => $request->order_id]));
            case 'cast_offer':
                return \Redirect::to(route('guest.cast_offers.index', ['id' => $request->cast_offer_id]));
            default:
                return \Redirect::to(route('web.index'));
        }
    }
}
