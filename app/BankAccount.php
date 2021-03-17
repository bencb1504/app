<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    protected $fillable = [
        'user_id',
        'bank_name',
        'bank_department',
        'number',
        'holder_name',
        'holder_type',
        'routing_number',
        'type',
        'bank_code',
        'branch_name',
        'branch_code',
    ];

    const TYPES = [
        'normal' => 1,
        'checking' => 2,
    ];
}
