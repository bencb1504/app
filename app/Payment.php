<?php

namespace App;

use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Services\LogService;
use App\Traits\FailedPaymentHandle;
use Illuminate\Database\Eloquent\Model;
use App\Services\TelecomCredit;
use App\Services\Square;

class Payment extends Model
{
    use FailedPaymentHandle;

    public function scopeOpen($query)
    {
        return $query->where('status', PaymentStatus::OPEN);
    }

    public function charge()
    {
        if (PaymentStatus::OPEN == $this->status) {
            $this->load(['user']);
            $user = $this->user;

            // return if user haven't registered credit card
            if (!$user->is_card_registered) {
                return false;
            }

            $request = [
                'amount' => $this->amount,
                'customer' => $user->payment_id,
                'user_id' => $user->id,
                'payment_id' => $this->id,
            ];

            $service = config('common.payment_service');

            if ($service == 'square') {
                $request['card_id'] = $user->card->card_id;
                $request['email'] = $user->email;
            }

            try {
                if ($service == 'square') {
                    $paymentService = new Square;
                } else {
                    $paymentService = new TelecomCredit;
                }

                $charge = $paymentService->charge($user->payment_id, $request);

                if (!$charge) {
                    return false;
                }

                // update order payment status
                $this->charge_at = now();
                // $this->charge_id = $charge->id;
                $this->status = PaymentStatus::DONE;
                $this->save();

                $user->orders()->where(function($query) {
                    $query->where(function($q) {
                        $q->where('status', OrderStatus::CANCELED)
                            ->where(function ($sq) {
                                $sq->where('payment_status', null)
                                    ->orWhere('payment_status', OrderPaymentStatus::PAYMENT_FAILED);
                            });
                    })->orWhereIn('payment_status', [OrderPaymentStatus::PAYMENT_FAILED, OrderPaymentStatus::REQUESTING]);
                })->where('send_warning', 1)->update(['send_warning' => null]);
                $user->payment_suspended = false;
                $user->save();

                return true;
            } catch (\Exception $e) {
                // Something else happened, completely unrelated to Stripe
                LogService::writeErrorLog($e);

                return false;
            }
        }

        return false;
    }

    protected function handleStripeException($e)
    {
        $body = $e->getJsonBody();
        $error = $body['error'];

        $this->createFailedPaymentRecord($this->id, 1, $error);
    }

    public function point()
    {
        return $this->belongsTo(Point::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = (int)$value;
    }
}
