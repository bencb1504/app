<?php

namespace App\Traits;

use App\FailedPayment;

trait FailedPaymentHandle
{
    public function createFailedPaymentRecord($paymentId, $type, $error = null, $message = null)
    {
        $attributes = [
            'payment_id' => $paymentId,
            'type' => $error['type'] ?? null,
            'code' => $error['code'] ?? null,
            'param' => $error['param'] ?? null,
            'message' => $error['message'] ?? $message,
            'payment_type' => $type ? : 1,
        ];

        return FailedPayment::create($attributes);
    }
}
