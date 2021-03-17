<?php

namespace App\Services;

use App\Exceptions\LineConfigNotFoundException;
use GuzzleHttp\Client;

class Line {

    public $pushUrl;
    public $liffUrl;
    protected $access_token;
    private $headers;
    private $client;


    public function __construct($accessToken = null)
    {
        if ($accessToken) {
            $this->access_token = $accessToken;
        } else {
            $this->access_token = env('LINE_BOT_CHANNEL_ACCESS_TOKEN');
        }

        $this->pushUrl = env('LINE_PUSH_URL');
        $this->liffUrl = env('LINE_LIFF_URL');
        if (!$this->access_token && !$this->pushUrl && !$this->liffUrl) {
            throw new LineConfigNotFoundException('ENV configurations not found');
        }

        $this->headers = [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $this->access_token
        ];
        $this->client = new Client([ 'headers' => $this->headers ]);
    }

    public function getLiffId($url, $type = 'full') {
        try {
            $body = [
                'view' => [
                    'type' => $type,
                    'url' => $url
                ]
            ];
            $body = \GuzzleHttp\json_encode($body);
            $response = $this->client->post($this->liffUrl, [
                'body' => $body
            ]);

            $response = \GuzzleHttp\json_decode($response->getBody()->getContents());
            return $response->liffId;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }

        return;
    }

    public function push($lineId, $messages = []) {
        try {
            $body = [
                'to' => $lineId,
                'messages' => $messages
            ];
            $body = \GuzzleHttp\json_encode($body);
            $response = $this->client->post(env('LINE_PUSH_URL'),
                ['body' => $body]
            );

            return $response;
        } catch (\Exception $e) {

            LogService::writeErrorLog('-----------------PUSH ERROR-----------------');
            LogService::writeErrorLog($lineId);
            LogService::writeErrorLog($messages);
            LogService::writeErrorLog($e);
            LogService::writeErrorLog('-----------------PUSH ERROR-----------------');
        }

        return;
    }
}