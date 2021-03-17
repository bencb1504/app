<?php

namespace App\Http\Controllers\Api\Cast;

use App\Enums\PointType;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\TransferResource;
use App\Point;
use Illuminate\Http\Request;

class PaymentController extends ApiController
{
    public function payments(Request $request)
    {
        $user = $this->guard()->user();

        $payments = Point::where('user_id', $user->id)
            ->where('type', PointType::RECEIVE)
            ->where('is_transfered', true)
            ->groupBy('updated_at')->selectRaw('sum(point) as point, updated_at')
            ->orderByDesc('updated_at');

        $payments = $payments->latest()->paginate($request->per_page)->appends($request->query());

        return $this->respondWithData(TransferResource::collection($payments));
    }
}
