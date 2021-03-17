<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'type',
        'point',
        'time',
        'percent',
        'max_point',
        'note',
        'is_filter_after_created_date',
        'filter_after_created_date',
        'is_filter_order_duration',
        'filter_order_duration',
        'is_active',
        'sort_index',
    ];
    public function users()
    {
        return $this->belongsToMany('App\User', 'coupon_users', 'coupon_id','user_id')->withTimestamps();
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'coupon_id');
    }
}
