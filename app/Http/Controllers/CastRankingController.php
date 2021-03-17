<?php

namespace App\Http\Controllers;

use Auth;
use GuzzleHttp\Client;
use JWTAuth;

class CastRankingController extends Controller
{
    public function index()
    {
        $accessToken = JWTAuth::fromUser(Auth::user());
        $client = new Client(['base_uri' => config('common.api_url')]);
        $option = [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            'form_params' => [],
            'allow_redirects' => false,
        ];
        $response = $client->get(route('cast_rankings'), $option);
        $castRankings = json_decode($response->getBody()->getContents());
        $castRankings = collect($castRankings->data)->take(10);

        return view('web.cast_ranking.index', compact('castRankings'));
    }
}
