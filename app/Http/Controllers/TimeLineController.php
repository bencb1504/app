<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use App\User;
use Auth;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;

class TimeLineController extends Controller
{
    public function getApi($url, $query = [])
    {
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
        $apiRequest = $client->request('GET', $url, [
            'query' => $query,
        ]);

        $result = $apiRequest->getBody();
        $contents = $result->getContents();
        $contents = json_decode($contents, JSON_NUMERIC_CHECK);

        return $contents;
    }

    public function index(Request $request)
    {
        $userId = null;
        if ($request->user_id) {
            $userId = $request->user_id;

            if (!User::find($userId)) {
                return redirect()->route('web.index');
            }
        }

        return view('web.timelines.index', compact('userId'));
    }

    public function show($id)
    {
        try {
            $user = Auth::user();

            $contentTimeline = $this->getApi('/api/v1/timelines/' . $id);
            if (false == $contentTimeline['status']) {
                return redirect()->back();
            }

            $timeline = $contentTimeline['data'];

            $contentFavorites = $this->getApi('/api/v1/timelines/' . $id . '/favorites');
            $favorites = $contentFavorites['data'];

            return view('web.timelines.show', compact('user', 'timeline', 'favorites'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function create(Request $request)
    {
        return view('web.timelines.create');
    }

    public function loadMoreListTimelines(Request $request)
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

            $timelines = $client->request('GET', request()->next_page);

            $timelines = json_decode(($timelines->getBody())->getContents(), JSON_NUMERIC_CHECK);
            $timelines = $timelines['data'];

            return [
                'next_page' => $timelines['next_page_url'],
                'view' => view('web.timelines.load_more_timelines', compact('timelines'))->render(),
            ];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function loadMoreFavorites(Request $request)
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

            $apiRequest = $client->request('GET', $request->next_page);

            $result = $apiRequest->getBody();
            $contents = $result->getContents();
            $contents = json_decode($contents, JSON_NUMERIC_CHECK);
            $favorites = isset($contents['data']) ? $contents['data'] : $contents;

            return [
                'next_page' => (array_key_exists('next_page_url', $contents)) ? $contents['next_page_url'] :
                $contents['data']['next_page_url'],
                'view' => view('web.timelines.load_more_favorites', compact('favorites', 'user'))->render(),
            ];
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }
}
