<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TimeLineFavorite extends Model
{

    public function timeLine()
    {
        return $this->belongsTo(TimeLine::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
