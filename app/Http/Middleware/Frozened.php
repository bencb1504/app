<?php

namespace App\Http\Middleware;

use App\Enums\ResignStatus;
use Closure;
use Twilio\Jwt\JWT;

class Frozened
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
        $user = \Auth::user();
        if ($user) {
            if ($request->is('api/v1/*') && (!$request->is('api/v1/auth*')
                && !$request->is('api/v1/points') && !$request->is('api/v1/receipts'))) {
                if ($user->is_verified == 1 && $user->status == 0) {
                    return response()->json([
                        'status' => false,
                        'error' => trans('messages.freezing_account'),
                    ], 403);
                }
            }

            if (!$request->is('api/v1/*') && $user->is_verified == 1 && $user->status == 0 && !$request->is('admin/*'))
            {
                if (!$request->is('history') && !$request->is('logout')) {
                    return response()->view('web.frozend');
                }
            }
        }


        return $next($request);
    }
}
