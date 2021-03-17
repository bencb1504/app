<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $touches = ['room'];

    protected $fillable = [
        'room_id',
        'user_id',
        'order_id',
        'offer_id',
        'thumbnail',
        'message',
        'image',
        'type',
        'system_type',
        'is_manual',
        'created_at',
        'missing_point',
        'cast_order_id',
    ];

    protected $casts = [
        'room_id' => 'integer',
        'type' => 'integer',
    ];

    public function getImageAttribute($value)
    {
        if ($value) {
            return Storage::url($value);
        }
    }

    public function getThumbnailAttribute($value)
    {
        if (empty($value)) {
            return $this->image;
        }

        if (strpos($value, 'https') !== false) {
            return $value;
        }

        return Storage::url($value);
    }

    public function unread()
    {
        return null === $this->read_at;
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function recipients()
    {
        return $this->belongsToMany(User::class, 'message_recipient')
            ->withPivot('room_id', 'read_at')
            ->withTimestamps();
    }
}
