<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class NotificationSchedule extends Model
{
    protected $fillable = [
        'title',
        'content',
        'type',
        'send_date',
        'status',
        'send_to',
        'cast_ids'
    ];

    protected $casts = [
        'cast_ids' => 'array',
    ];
}
