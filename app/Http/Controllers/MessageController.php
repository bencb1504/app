<?php

namespace App\Http\Controllers;

use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Message;
use App\Order;
use App\Room;
use Auth;
use GuzzleHttp\Client;
use JWTAuth;

class MessageController extends Controller
{
    public function message(Room $room)
    {
        $accessToken = JWTAuth::fromUser(Auth::user());
        $client = new Client(['base_uri' => config('common.api_url')]);
        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];

        $response = $client->get(route('rooms.index', ['id' => $room->id]), $option);
        $getContents = json_decode($response->getBody()->getContents(), JSON_NUMERIC_CHECK);
        $messages = $getContents['data'];

        if ($messages['order'] && OrderStatus::DONE == $messages['order']['status']) {
            $order = Order::where('status', OrderStatus::DONE)->find($messages['order']['id']);
            $cast = $order->casts()->wherePivot('guest_rated', false)->first();
            if ($cast && $order->payment_status && $order->paymentRequests->count()) {
                return redirect(route('evaluation.index', ['order_id' => $order->id]));
            }

            if (in_array($messages['order']['payment_status'], [OrderPaymentStatus::WAITING, OrderPaymentStatus::REQUESTING, OrderPaymentStatus::EDIT_REQUESTING, OrderPaymentStatus::PAYMENT_FAILED])) {
                return redirect(route('history.show', ['orderId' => $order->id]));
            }

            return view('web.message', compact('room', 'messages'));
        } else {
            return view('web.message', compact('room', 'messages'));
        }
    }
}
