<?php

namespace App\Http\Controllers\Auth;

use App\Services\LogService;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LineNotifyController extends Controller
{
    public function webhook(Request $request)
    {
        try {
            if ($request->events[0]['type'] == 'join') {
                $header = [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . env('LINE_BOT_NOTIFY_CHANNEL_ACCESS_TOKEN')
                ];
                $client = new Client(['headers' => $header]);

                $body = [
                    'replyToken' => $request->events[0]['replyToken'],
                    'messages' => [
                        [
                            'type' => 'text',
                            'text' => 'Bot Joined.',
                        ]
                    ]
                ];

                $body = \GuzzleHttp\json_encode($body);
                $client->post(env('LINE_REPLY_URL'),
                    ['body' => $body]
                );
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog('----------------------- BOT NOTIFY ERROR -------------------------------');
            LogService::writeErrorLog($e->getMessage());
            LogService::writeErrorLog('----------------------- BOT NOTIFY ERROR -------------------------------');
        }
    }
}
