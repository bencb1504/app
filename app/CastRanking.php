<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CastRanking extends Model
{
    public function cast()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
