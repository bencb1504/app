<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class VoiceController extends Controller
{
    public function code(Request $request)
    {
        $phone = str_split($request->phone);
        $codes = str_split($request->code);
        $repeatUrl = route('voice_code_repeat', ['code' => $request->code, 'phone' => $request->phone]);

        return response()->view('voices.verification', [
            'codes' => $codes,
            'phone' => $phone,
            'repeatUrl' => $repeatUrl
        ])->header('Content-Type', 'text/xml');
    }

    public function repeat(Request $request)
    {
        $phone = str_split($request->phone);
        $codes = str_split($request->code);

        return response()->view('voices.verification_repeat', [
            'codes' => $codes,
            'phone' => $phone,
        ])->header('Content-Type', 'text/xml');
    }
}
