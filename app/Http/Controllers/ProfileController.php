<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use App\Http\Resources\CastResource;
use App\Http\Resources\GuestResource;
use App\Http\Controllers\Controller;
use App\Rules\CheckHeight;
use App\Services\LogService;
use Auth;
use Illuminate\Http\Request;
use JWTAuth;
use GuzzleHttp\Client;

class ProfileController extends Controller
{
    public function getApi($url)
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
        $apiRequest = $client->request('GET', $url, []);

        $result = $apiRequest->getBody();
        $contents = $result->getContents();
        $contents = json_decode($contents, JSON_NUMERIC_CHECK);

        return $contents;
    }

    public function edit()
    {
        try {
            $glossaries = $this->getApi('/api/v1/glossaries')['data'];
            $contents = $this->getApi('/api/v1/auth/me');
            $profile = $contents['data'];

            return view('web.profile.edit', compact('profile', 'glossaries'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function index()
    {
        try {
            $contents = $this->getApi('/api/v1/auth/me');
            $profile = $contents['data'];

            return view('web.profile.index', compact('profile'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            abort(500);
        }
    }

    public function verify()
    {
        $contents = $this->getApi('/api/v1/auth/me');
        $phone = $contents['data']['phone'];

        return view('web.profile.verification_phone', compact('phone'));
    }
}
