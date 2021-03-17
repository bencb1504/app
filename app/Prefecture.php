<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Prefecture extends Model
{
    const SUPPORTED_IDS = [13, 14, 11, 27, 28, 26];

    public static function getIdByName($name)
    {
        $prefecture = Prefecture::where('name', $name)->first();

        if (!$prefecture) {
            return null;
        }

        return $prefecture->id;
    }

    public function municipalities()
    {
        return $this->hasMany(Municipality::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function scopeSupported($query)
    {
        return $query->whereIn('id', self::SUPPORTED_IDS)
            ->orderByRaw("FIELD(id, " . implode(',', Prefecture::SUPPORTED_IDS) . " )");
    }
}
