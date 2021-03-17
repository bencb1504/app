<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\ResignStatus;
use App\Services\LogService;
use Auth;
use Illuminate\Http\Request;

class ResignController extends ApiController
{
    public function create(Request $request)
    {
        $user = Auth::user();

        if ($user->resign_status) {
            return $this->respondErrorMessage(trans('messages.created_request_resign'), 409);
        }

        $isUnpaidOrder = $user->orders()->whereIn('status', [
            OrderStatus::OPEN,
            OrderStatus::ACTIVE,
            OrderStatus::PROCESSING,
        ])
            ->orWhere(function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', OrderStatus::DONE)
                    ->where(function ($subQuery) {
                        $subQuery->whereNull('payment_status')
                            ->orWhere(function($s) {
                               $s->where('payment_status', '!=', OrderPaymentStatus::PAYMENT_FINISHED)
                                   ->orWhere('payment_status', OrderPaymentStatus::PAYMENT_FAILED);
                            });
                    });
            })
            ->orWhere(function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', OrderStatus::CANCELED)
                    ->where(function ($subQuery) {
                        $subQuery->where(function($sQ) {
                            $sQ->where('payment_status', null)
                                ->orWhere('payment_status', '<>', OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED);
                        })->where('cancel_fee_percent', '>', 0);
                    });

            })
            ->exists();

        if ($isUnpaidOrder || !$user->status) {
            return $this->respondErrorMessage(trans('messages.order_exist_can_not_resign'), 422);
        }

        $input = $request->only('reason1', 'reason2', 'reason3');

        try {
            $firstResignDescription = null;
            foreach ($input as $key => $value) {
                if (null != $value) {
                    if ('reason3' == $key) {
                        $firstResignDescription = $firstResignDescription . $value;
                    } else {
                        $firstResignDescription = $firstResignDescription . $value . '|';
                    }
                }
            }

            $user->resign_status = ResignStatus::PENDING;
            $user->first_resign_description = $firstResignDescription;
            $user->second_resign_description = $request->other_reason;
            $user->resign_date = now();

            $user->save();
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('message.resign_success'));
    }
}
