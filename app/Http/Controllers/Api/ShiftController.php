<?php

namespace App\Http\Controllers\Api;

use App\Cast;
use App\Enums\UserType;
use App\Http\Resources\ShiftResource;
use Illuminate\Http\Request;

class ShiftController extends ApiController
{

    public function index(Request $request)
    {
        if ($request->cast_id) {
            $user = Cast::find($request->cast_id);

            if (!$user) {
                return $this->respondErrorMessage('Unauthorized.', 401);
            }
        } else {
            $user = $this->guard()->user();

            if ($user->type != UserType::CAST) {
                return $this->respondErrorMessage('Unauthorized.', 401);
            }
        }

        $from = now()->copy()->startOfDay();
        $to = now()->copy()->addDays(14)->startOfDay();
        $shifts = $user->shifts()->whereBetween('date', [$from, $to])->limit(14)->get();

        return $this->respondWithData(ShiftResource::collection($shifts));
    }
}
