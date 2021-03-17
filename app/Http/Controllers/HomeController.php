<?php

namespace App\Http\Controllers;

use App\Cast;
use App\CastClass;
use App\Enums\CastTransferStatus;
use App\Enums\OrderStatus;
use App\Enums\UserGender;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Order;
use App\Prefecture;
use App\RankSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class HomeController extends Controller
{
    public function ld()
    {
        return view('web.ld');
    }

    public function index(Request $request)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $token = JWTAuth::fromUser($user);

            $verification = $user->verification;
            if (!$user->is_verified && $verification && !$verification->status) {
                return redirect()->route('verify.code');
            }

            if (!$user->is_verified && !$user->status) {
                return view('web.users.verification', compact('token'));
            }

            if ($user->is_guest) {
                $prefectures = Prefecture::supported()->get();

                if (empty($user->date_of_birth) && $user->is_verified) {
                    return view('web.users.guest_register', compact('prefectures', 'token'));
                }

                $order = Order::with('casts')
                    ->where('user_id', Auth::user()->id)
                    ->where('status', OrderStatus::PROCESSING)
                    ->with(['user', 'casts', 'nominees', 'tags'])
                    ->orderBy('date')
                    ->orderBy('start_time')->first();

                if (!$order) {
                    $order = Order::with('casts')
                        ->where('user_id', Auth::user()->id)
                        ->whereIn('status', [OrderStatus::OPEN, OrderStatus::ACTIVE])
                        ->with(['user', 'casts', 'nominees', 'tags'])
                        ->orderBy('date')
                        ->orderBy('start_time')->first();
                }

                $order = OrderResource::make($order);

                $newIntros = Cast::active()->whereNotNull('intro')->orderByDesc('intro_updated_at')->limit(10)->get();
                return view('web.index', compact('token', 'order', 'newIntros', 'prefectures'));
            }

            if ($user->is_cast) {
                return redirect()->route('web.cast_index');
            }
        }

        return redirect()->route('web.login');
    }

    public function castMypage()
    {
        if (Auth::check()) {
            $user = Auth::user();
            $token = '';
            $token = JWTAuth::fromUser($user);

            if ($user->is_cast && CastTransferStatus::PENDING == $user->cast_transfer_status) {
                return view('web.cast.wait_review');
            }

            if ($user->is_cast && CastTransferStatus::DENIED == $user->cast_transfer_status && UserGender::FEMALE == $user->gender) {
                return view('web.cast.deny_review');
            }

            if ($user->is_cast) {
                $castClass = CastClass::find($user->class_id);
                $today = now()->format('Y-m-d');
                $rankSchedule = RankSchedule::where('from_date', '<=', $today)->where('to_date', '>=', $today)->first();
                $sumOrders = 0;
                $ratingScore = 0;
                if ($rankSchedule) {
                    $sumOrders = Cast::find($user->id)->orders()->where(
                        [
                            ['orders.status', '=', 4],
                            ['orders.created_at', '>=', $rankSchedule->from_date],
                            ['orders.created_at', '<=', $rankSchedule->to_date],

                        ]
                    )->count();
                    $ratingScore = \App\Rating::where([
                        ['rated_id', '=', $user->id],
                        ['created_at', '>=', $rankSchedule->from_date],
                        ['created_at', '<=', $rankSchedule->to_date],
                        ['is_valid', '=', true],
                    ])->avg('score');

                    if (!$ratingScore) {
                        $ratingScore = 0;
                    } else {
                        $ratingScore = round($ratingScore, 2);
                    }
                }

                return view('web.cast.index', compact('token', 'user', 'castClass', 'rankSchedule', 'sumOrders', 'ratingScore'));
            } else {
                return redirect()->route('web.login');
            }
        }

        return redirect()->route('web.login');
    }

    public function login(Order $order)
    {
        dd($order->test());
        if (Auth::check()) {
            return redirect()->route('web.index');
        }

        return view('web.login');
    }

    public function logout()
    {
        Auth::logout();

        return redirect()->route('web.index');
    }
}
