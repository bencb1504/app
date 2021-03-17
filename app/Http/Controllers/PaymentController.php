<?php

namespace App\Http\Controllers;

use App\Notifications\OrderDirectTransferChargeFailed;
use App\Order;
use App\Services\LogService;
use Auth;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;

class PaymentController extends Controller
{
    public function history()
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
            $payments = $client->request('GET', '/api/v1/cast/payments');

            $payments = json_decode(($payments->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $payments = $payments['data'];

            return view('web.payments.index', compact('payments'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function loadMore()
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
            $payments = $client->request('GET', request()->next_page);

            $payments = json_decode(($payments->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $payments = $payments['data'];

            return [
                'next_page' => $payments['next_page_url'],
                'view' => view('web.payments.list_payments', compact('payments'))->render(),
            ];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function transfer(Request $request)
    {
        $user = Auth::user();
        if (isset($request->order_id)) {
            $order = $user->orders()->findOrFail($request->order_id);
            if (!$order->send_warning) {
                $user->notify(new OrderDirectTransferChargeFailed($order, $request->point));
                $order->send_warning = true;
                $order->save();
            }
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
            $paymentInfo = $client->get(route('glossaries'), $option);

        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }

        $paymentInfo = json_decode(($paymentInfo->getBody())->getContents(), JSON_NUMERIC_CHECK);
        $paymentInfo = $paymentInfo['data']['direct_transfer_bank_info'];

        return view('web.payments.transfer', compact('paymentInfo'));
    }
}
