<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class InviteCodeHistory extends Model
{
    protected $fillable = [
        'invite_code_id',
        'point',
        'receive_user_id',
    ];

    public function inviteCode()
    {
        return $this->belongsTo(InviteCode::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'receive_user_id')->withTrashed();
    }

    public function order()
    {
        return $this->belongsTo(Order::class)->withTrashed();
    }

    public function points()
    {
        return $this->hasMany(Point::class);
    }
}
