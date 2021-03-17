<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PaymentRequest extends Model
{
    public function cast()
    {
        return $this->belongsTo(Cast::class)->withTrashed();
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class)->withTrashed();
    }
}
