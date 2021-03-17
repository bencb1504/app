<?php

namespace App\Http\Controllers\Api\Cast;

use App\Enums\CastTransferStatus;
use App\Enums\Status;
use App\Http\Controllers\Api\ApiController;
use App\Notifications\CreateCast;
use Illuminate\Http\Request;

class CastController extends ApiController
{
    public function confirmTransfer(Request $request)
    {
        $cast = $this->guard()->user();
        if ($cast->cast_transfer_status != CastTransferStatus::APPROVED) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        $cast->cast_transfer_status = CastTransferStatus::OFFICIAL;
        $cast->status = Status::ACTIVE;
        $cast->is_verified = Status::ACTIVE;
        $cast->save();
        $cast->notify(new CreateCast());

        return $this->respondWithNoData(trans('messages.transfer_to_cast_succeed'));
    }
}
