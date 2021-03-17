<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class FailedPayment extends Model
{
    protected $fillable = [
        'payment_id',
        'type',
        'code',
        'param',
        'message',
        'payment_type',
    ];
}
