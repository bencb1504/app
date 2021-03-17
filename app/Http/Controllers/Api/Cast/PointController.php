<?php

namespace App\Http\Controllers\Api\Cast;

use App\Enums\PointType;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\PointCastResource;
use App\Point;
use Illuminate\Http\Request;

class PointController extends ApiController
{
    public function points(Request $request)
    {
        $user = $this->guard()->user();

        $points = Point::withTrashed()
            ->where('user_id', $user->id)
            ->whereIn('type', [PointType::RECEIVE, PointType::ADJUSTED, PointType::TEMP])
            ->with([
                'order.casts',
                'order.paymentRequests' => function ($query) use ($user) {
                    return $query->where('cast_id', $user->id);
                }
            ]);

        $nickName = $request->nickname;
        if ($nickName) {
            if (str_is('*' . strtolower($nickName) . '*', strtolower('cheers'))) {
                $points->where(function ($query) {
                    $query->where('type', PointType::ADJUSTED);
                });
            } else {
                $points->whereHas('order.user', function ($query) use ($nickName) {
                    $query->where('nickname', 'like', "%$nickName%");
                });
            }
        }
        $points = $points->latest()->paginate($request->per_page)->appends($request->query());

        return $this->respondWithData(PointCastResource::collection($points));
    }
}
