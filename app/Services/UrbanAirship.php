<?php

namespace App\Services;

use App\Exceptions\UrbanAirshipConfigNotFoundException;
use Carbon\Carbon;
use GuzzleHttp\Client;

class UrbanAirship {

    public $pushUrl;
    public $scheduleUrl;
    public $channelsTagsUrl;
    public $namedUsersTagsUrl;

    protected $masterAuthStr;
    protected $appKey;
    protected $masterSecret;

    private $headers;
    private $client;


    public function __construct($appKey, $masterSecret)
    {
        $this->appKey = $appKey;
        $this->masterSecret = $masterSecret;

        if (!($this->appKey && $this->masterSecret)) {
            throw new UrbanAirshipConfigNotFoundException('ENV configurations not found');
        }

        $urbanAirshipApiUrl = config('urbanairship.api_url');
        $this->pushUrl = $urbanAirshipApiUrl . '/push';
        $this->scheduleUrl = $urbanAirshipApiUrl . '/schedules';
        $this->channelsTagsUrl = $urbanAirshipApiUrl . '/channels/tags';
        $this->namedUsersTagsUrl = $urbanAirshipApiUrl . '/named_users/tags';


        $this->masterAuthStr = base64_encode($this->appKey . ':' . $this->masterSecret);
        $this->headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/vnd.urbanairship+json; version=3;',
            'Authorization' => "Basic $this->masterAuthStr"
        ];
        $this->client = new Client([ 'headers' => $this->headers ]);
    }

    public function push($audienceOptions = [], $notificationOptions = [], $devices = ['android', 'ios', 'web']) {
        $body = [
            'audience' => $audienceOptions,
            'device_types' => $devices,
            'notification' => $notificationOptions
        ];
        $body = \GuzzleHttp\json_encode($body);

        try {

            $response = $this->client->post($this->pushUrl,
                ['body' => $body]
            );
        } catch (\Exception $e) {
            LogService::writeErrorLog('-----------------PUSH URBAN ERROR-----------------');
            LogService::writeErrorLog($body);
            LogService::writeErrorLog($e);
            LogService::writeErrorLog('-----------------PUSH URBAN ERROR-----------------');
            return ['error' => $e->getMessage()];
        }

        $response = [
            'status_code' => $response->getStatusCode(),
            'info' => \GuzzleHttp\json_decode($response->getBody()->getContents())
        ];
        return (object)$response;
    }

    public function schedule($scheduleTime, $audienceOptions, $notificationOptions, $devices = ['android', 'ios', 'web']) {
        if ($scheduleTime && $audienceOptions && $notificationOptions) {
            $scheduleTime = substr(Carbon::parse($scheduleTime)->setTimezone('UTC')->toIso8601String(), 0, -6);

            $body = [
                'schedule' => [
                    'scheduled_time' => $scheduleTime
                ],
                'push' => [
                    'audience' => $audienceOptions,
                    'device_types' => $devices,
                    'notification' => $notificationOptions
                ]
            ];
            $body = \GuzzleHttp\json_encode($body);

            try {
                $response = $this->client->post($this->scheduleUrl,
                    ['body' => $body]
                );
            } catch (\Exception $e) {
                LogService::writeErrorLog('-----------------PUSH URBAN ERROR-----------------');
                LogService::writeErrorLog($body);
                LogService::writeErrorLog($e);
                LogService::writeErrorLog('-----------------PUSH URBAN ERROR-----------------');
                return ['error' => $e->getMessage()];
            }

            $response = [
                'status_code' => $response->getStatusCode(),
                'info' => \GuzzleHttp\json_decode($response->getBody()->getContents())
            ];
            return (object)$response;
        }

        return;
    }

    public function addOrRemoveTags($audienceOptions = [], $addTagOptions = [], $removeTagOptions = [], $type) {
        if ($type == 'channel') {
            $url = $this->channelsTagsUrl;
        } else if ($type == 'named_users') {
            $url = $this->namedUsersTagsUrl;
        }

        $body = [
            'audience' => $audienceOptions
        ];

        if ($addTagOptions) {
            $body['add'] = $addTagOptions;
        }

        if ($removeTagOptions) {

            $body['remove'] = $removeTagOptions;
        }

        $body = \GuzzleHttp\json_encode($body);

        try {
            $response = $this->client->post($url,
                ['body' => $body]
            );
        } catch (\Exception $e) {
            LogService::writeErrorLog('-----------------PUSH URBAN ERROR-----------------');
            LogService::writeErrorLog($body);
            LogService::writeErrorLog($e);
            LogService::writeErrorLog('-----------------PUSH URBAN ERROR-----------------');
            return ['error' => $e->getMessage()];
        }

        $response = [
            'status_code' => $response->getStatusCode(),
            'info' => \GuzzleHttp\json_decode($response->getBody()->getContents())
        ];
        return (object)$response;
    }
}