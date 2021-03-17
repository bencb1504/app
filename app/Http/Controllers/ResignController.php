<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Auth;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;

class ResignController extends Controller
{
    public function reason()
    {
        return view('web.resigns.reason');
    }

    public function confirm()
    {
        return view('web.resigns.confirm');
    }

    public function complete()
    {
        return view('web.resigns.complete');
    }
}
