<?php

namespace App;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    const BRANDS = [
        'AMERICAN_EXPRESS',
        // 'DISCOVER_DINERS',
        // 'JCB',
        'MASTERCARD',
        'VISA',
    ];

    protected $guarded = [];

    protected $casts = [
        'is_default' => 'integer',
    ];

    public function getIsExpiredAttribute()
    {
        $time = now();
        $cardExpDate = Carbon::createFromFormat('Y/m', "$this->exp_year/$this->exp_month");

        if ($time->gt($cardExpDate->endOfMonth())) {
            return 1;
        }

        return 0;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
