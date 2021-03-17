<?php

namespace App\Http\Controllers\Api\Cast;

use App\Http\Controllers\Api\ApiController;
use App\Services\LogService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ShiftController extends ApiController
{
    public function update(Request $request) {
        $user = $this->guard()->user();
        $today = Carbon::today();
        try {
            $user->shifts()->syncWithoutDetaching($request->shifts);

            $shiftToday = $user->shifts()->where('date', $today)->where(function ($q) {
                $q->where('shift_user.day_shift', true);
                $q->orWhere('shift_user.night_shift', true);
            })->first();

            if ($shiftToday) {
                $user->working_today = true;
            } else {
                $user->working_today = false;
            }
            $user->save();

            return $this->respondWithNoData(trans('messages.update_shifts_success'));
        }catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }
    }
}
