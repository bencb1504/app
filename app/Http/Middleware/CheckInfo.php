<?php

namespace App\Http\Middleware;

use Closure;
use Auth;

class CheckInfo
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
        $user = Auth::user();

        $verification = $user->verification;
        if (!$user->is_verified && $verification && !$verification->status) {
            return redirect()->route('verify.code');
        }

        if (empty($user->date_of_birth)) {
            return redirect()->route('web.index');
        }

        return $next($request);
    }
}
