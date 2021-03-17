<?php

namespace App\Http\Controllers;

use Auth;
use JWTAuth;
use GuzzleHttp\Client;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;

class RoomController extends Controller
{
    use MakesHttpRequests;

    protected $baseUrl = null;
    protected $app = null;

    public function __construct()
    {
        $this->baseUrl = request()->getSchemeAndHttpHost();
        $this->app = app();
    }

    public function index()
    {
        $accessToken = JWTAuth::fromUser(Auth::user());

        $response = $this
            ->get(route('rooms.list_room'), [
                'HTTP_Authorization' => 'Bearer ' . $accessToken
            ])->getContent();

        $contents = json_decode($response);
        $rooms = $contents->data;

        return view('web.rooms.rooms', compact('rooms'));
    }
}
