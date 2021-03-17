<?php

namespace App\Http\Controllers;

use App\Order;
use App\Services\LogService;
use Auth;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;

class CastOfferController extends Controller
{
    public function index(Request $request)
    {
        if ($request->id) {
            $order = Order::find($request->id);

            if (!isset($order)) {
                return redirect()->route('web.index');
            }
        } else {
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
            $coupons = $client->get(route('coupons.index', ['duration' => $order->duration]), $option);
            $coupons = json_decode(($coupons->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $coupons = $coupons['data'];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        return view('web.orders.cast_offer', compact('order', 'coupons'));
    }
}
