<?php

namespace App\Http\Controllers\Api\Guest;

use App\Enums\ResignStatus;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ApiController;

class PointController extends ApiController
{
    public function buy(Request $request)
    {
        $user = $this->guard()->user();
        if ($user->resign_status == ResignStatus::PENDING) {
            return $this->respondErrorMessage(trans('messages.buy_point_resign_status_pending'), 403);
        }

        $rules = [
            'amount' => 'required|numeric',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        if (!$user->is_card_registered) {
            return $this->respondErrorMessage(trans('messages.card_not_exist'), 404);
        }

        $point = $user->buyPoint($request->amount);

        if (!$point) {
            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('messages.buy_point_success'));
    }
}
