<?php

namespace App\Http\Middleware;

use Closure;
use Auth;

class IsActive
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
            return redirect()->route('web.login');
        }

        if (!Auth::user()->status) {
            if (!$request->is('history*')) {
                return redirect()->route('web.index')->with('no_active', true);
            }
        }

        return $next($request);
    }
}
