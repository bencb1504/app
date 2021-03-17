<?php

namespace App\Services;

use Log;

class LogService
{
    public static function writeErrorLog($error)
    {
        $now = now();
        config(['logging.channels.custom.path' => storage_path('logs/'.$now->format('Y_m_d').'.log')]);
        Log::channel('custom')->error($error);
    }
}
