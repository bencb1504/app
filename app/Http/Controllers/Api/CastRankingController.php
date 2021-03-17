<?php

namespace App\Http\Controllers\Api;

use App\CastRanking;
use App\Http\Resources\CastRankingResource;
use App\User;

class CastRankingController extends ApiController
{
    public function index()
    {
        $castRankings = CastRanking::get()->pluck('user_id');
        $ids = implode(',', $castRankings->toArray());

        $users = User::whereIn('id', $castRankings)
            ->orderByRaw(\DB::raw("FIELD(id, $ids)"))
            ->get();

        return $this->respondWithData(CastRankingResource::collection($users));
    }
}
