<?php

namespace App\Services;

use GuzzleHttp\Client;

class TelecomCredit extends Service
{
    protected $client;

    public function __construct()
    {
        $telecomCreditClientIp = env('TELECOM_CREDIT_CLIENT_IP');

        if (!$telecomCreditClientIp) {
            throw new \Exception('Telecom Credit Cliend IP not found');
        }

        $this->client = new Client();
    }

    public function charge($sendId, $request)
    {
        $settlementUrl = env('TELECOM_CREDIT_SETTLEMENT_URL');

        $params = [
            'clientip' => env('TELECOM_CREDIT_CLIENT_IP'),
            'sendid' => $sendId,
            'money' => $request['amount'],
            'user_id' => $request['user_id'] ?? '',
            'payment_id' => $request['payment_id'] ?? '',
            'order_id' => $request['order_id'] ?? '',
        ];

        $response = $this->client->post($settlementUrl, [
            'form_params' => $params
        ]);

        $content = $response->getBody()->getContents();

        logger()->info('Settlement response:');
        logger($content);

        $parsedContent = strtolower($content);
        if (strpos($parsedContent, 'success_order') !== false) {
            return true;
        }

        return false;
    }
}
