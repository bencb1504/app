<?php

namespace App;

use App\Enums\TransferStatus;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    public function scopeOpen($query)
    {
        return $query->where('status', TransferStatus::OPEN);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', TransferStatus::CLOSED);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
