<?php

namespace App\Http\Controllers\Api;

use Cache;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

class PostCodeController extends ApiController
{
    protected $client;

    public function __construct()
    {
        $this->client = app(Client::class);
    }

    public function find(Request $request)
    {
        $validator = validator($request->only('post_code'), ['post_code' => 'required']);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        //$pattern = '/^([1-2][0-9]|3[3-6]|5[3-9]|6[5-7])\d{1}[-]?\d{4}$/';
        //only Tokyo

        $subject = $request->post_code;
        $count = strlen($subject);

        if ($count < 7) {
            return $this->respondErrorMessage(trans('messages.postcode_invalid'), 400);
        }

//        $pattern = '/^(1[0-9]|20)\d{1}[-]?\d{4}$/';
        //
        //        if (preg_match($pattern, $subject) == false) {
        //            return $this->respondErrorMessage(trans('messages.postcode_not_support'), 422);
        //        }

        $address = '';
        $cacheKey = "post_code_{$request->post_code}";

        if (!Cache::has($cacheKey)) {
            $response = $this->client->request('GET', 'http://zipcloud.ibsnet.co.jp/api/search', [
                'query' => [
                    'zipcode' => $request->post_code,
                    'limit' => 1,
                ],
            ]);

            if ($response->getStatusCode() == 200) {
                $content = json_decode($response->getBody()->getContents(), true);
                if (200 == $content['status'] && isset($content['results'][0])) {
                    $address = [
                        'address1' => $content['results'][0]['address1'],
                        'address2' => $content['results'][0]['address2'],
                        'address3' => $content['results'][0]['address3'],
                    ];

                    // cache post code info for 3 months
                    $expiresAt = now()->addMonths(3);
                    Cache::put($cacheKey, $address, $expiresAt);
                }
            }
        } else {
            $address = Cache::get($cacheKey);
        }

        if (!$address) {
            return $this->respondErrorMessage(trans('messages.postcode_error'));
        }

        return $this->respondWithData($address);
    }
}
