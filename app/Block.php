<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    protected $fillable = [
        'user_id',
        'blocked_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function blocked()
    {
        return $this->belongsTo(User::class);
    }
}
