<?php

namespace App\Http\Controllers\Api;

use App\Enums\PointType;
use App\Http\Resources\PointResource;
use Illuminate\Http\Request;

class PointController extends ApiController
{
    public function points(Request $request)
    {
        $user = $this->guard()->user();

        $types = [
            PointType::BUY, 
            PointType::PAY, 
            PointType::AUTO_CHARGE, 
            PointType::EVICT, 
            PointType::INVITE_CODE, 
            PointType::DIRECT_TRANSFER
        ];

        $points = $user->points()
            ->whereIn('type', $types)
            ->where('status', true)
            ->with('receipt', 'order')->latest()->paginate($request->per_page)->appends($request->query());

        return $this->respondWithData(PointResource::collection($points));
    }
}
