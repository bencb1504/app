<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class LastActiveAt
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (!Auth::check()) {
            return $next($request);
        }
        Cache::forever('last_active_at_' . Auth::id(), now());
        Cache::forever('is_online_' . Auth::id(), true);

        $user = Auth::user();
        $user->last_active_at = now();
        $user->save();

        return $next($request);
    }
}
