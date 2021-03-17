<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class RankSchedule extends Model
{
    protected $fillable = [
        'from_date',
        'to_date',
        'num_of_attend_platium',
        'num_of_avg_rate_platium',
        'num_of_attend_up_platium',
        'num_of_avg_rate_up_platium',
    ];
}
