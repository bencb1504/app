<?php

namespace App\Http\Controllers;

use App\User;
use App\Point;
use App\Payment;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;

class TelecomCreditController extends Controller
{
    public function webhook(Request $request)
    {
        logger($request->all());

        // verification
        if ($request->cont == 'no') {
            $userId = $request->user_id;

            if ($userId) {
                $user = User::findOrFail($userId);
                $user->payment_id = $request->sendid;

                if ($user->payment_suspended) {
                    $user->payment_suspended = false;
                }

                $user->save();
            }
        }

        // settlement
        if ($request->cont == 'yes') {
            $paymentId = $request->payment_id;

            if ($paymentId) {
                $payment = Payment::findOrFail($paymentId);

                if (!$payment->status) {
                    $payment->charge_at = now();
                    $payment->status = PaymentStatus::DONE;
                    $payment->save();

                    // update point status
                    $point = Point::findOrFail($payment->point_id);
                    $point->status = true;
                    $point->balance = $point->point;
                    $point->save();

                    // update user's point
                    $user = User::findOrFail($payment->user_id);
                    $user->point = $user->point + $point->point;
                    $user->save();
                }
            }
        }

        return response()->json(['message' => 'SuccessOK']);
    }
}
