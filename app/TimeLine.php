<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class TimeLine extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'image',
        'location',
        'hidden',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function favorites()
    {
        return $this->hasMany(TimeLineFavorite::class);
    }

    public function getImageAttribute($value)
    {
        if (empty($value)) {
            return '';
        }

        if (strpos($value, 'https') !== false) {
            return $value;
        }

        return Storage::url($value);
    }

    public function getCountFavoritesAttribute()
    {
        return $this->favorites()->count();
    }

    public function getIsFavouritedAttribute()
    {
        $user = \Auth::user();

        return (int)$this->favorites()->where('user_id', $user->id)->exists();
    }
}
