<?php

namespace App\Http\Controllers;

use Auth;
use App\Services\LogService;
use App\InviteCode;
class InviteCodeController extends Controller
{
    public function inviteCode()
    {
        try {
            $user = Auth::user();
            $inviteCode = $user->inviteCode;
            if (!$inviteCode) {
                do {
                    $code = generateInviteCode();
                    $checkCodeExist = InviteCode::where('code', $code)->first();
                } while($checkCodeExist);

                $data = [
                    'code' => $code,
                ];

                $user->inviteCode()->create($data);
                $inviteCode = $user->inviteCode()->first();
            }

            return view('web.invite_codes.get_invite_code', compact('inviteCode'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }
}
