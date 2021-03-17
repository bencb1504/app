<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class InviteCode extends Model
{
    protected $fillable = [
        'code'
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function histories()
    {
        return $this->hasMany(InviteCodeHistory::class);
    }
}
