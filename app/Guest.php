<?php

namespace App;

use App\Enums\UserType;
use App\Traits\HasParentModel;

class Guest extends User
{
    use HasParentModel;

    public static function boot()
    {
        parent::boot();

        static::addGlobalScope(function ($query) {
            $query->where('users.type', UserType::GUEST);
        });
    }
}
