<?php

namespace App\Http\Controllers\Admin;

use App\Cast;
use App\CastRanking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CastRankingController extends Controller
{
    public function index(Request $request)
    {

        $keyword = $request->search;
        $casts = Cast::query();

        if ($request->has('search')) {
            $casts->where(function ($query) use ($keyword) {
                $query->where('users.id', "$keyword")
                    ->orWhere('users.nickname', 'like', "%$keyword%");
            });
        }

        $casts = $casts
            ->select('users.id', 'users.nickname', 'users.total_point', 'users.point')
            ->selectRaw('cast_rankings.ranking as rank')
            ->join('cast_rankings', 'users.id', '=', 'cast_rankings.user_id')
            ->orderBy('rank', 'asc')
            ->paginate();

        return view('admin.cast_ranking.index', compact('casts'));
    }
}
