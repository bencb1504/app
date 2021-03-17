<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Favorite;
use App\Enums\UserType;
use Carbon\Carbon;

class FavoriteController extends Controller
{
    public function guest(CheckDateRequest $request)
    {
        $favorites = Favorite::whereHas('user', function ($query) {
            $query->where('type', UserType::GUEST);
        })
        ->whereHas('favorited', function ($query) {
            $query->where('type', UserType::CAST);
        });

        $keyword = $request->search;

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $favorites->where(function ($query) use ($fromDate) {
                $query->whereDate('created_at', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $favorites->where(function ($query) use ($toDate) {
                $query->whereDate('created_at', '<=', $toDate);
            });
        }

        if ($request->has('search') && $request->search) {
            $favorites->where(function ($query) use ($keyword) {
                $query->where('user_id', 'like', "%$keyword%")
                    ->orWhere('favorited_id', 'like', "%$keyword%")
                    ->orWhereHas('user', function ($query) use ($keyword) {
                        $query->where('nickname', 'like', "%$keyword%");
                    })
                    ->orwhereHas('favorited', function ($query) use ($keyword) {
                        $query->where('nickname', 'like', "%$keyword%");
                    });
            });
        }

        $favorites = $favorites->orderByDesc('created_at')->paginate($request->limit ?: 10);

        return view('admin.favorites.guest', compact('favorites'));
    }

    public function cast(CheckDateRequest $request)
    {
        $favorites = Favorite::whereHas('user', function ($query) {
            $query->where('type', UserType::CAST);
        })
        ->whereHas('favorited', function ($query) {
            $query->where('type', UserType::GUEST);
        });

        $keyword = $request->search;

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $favorites->where(function ($query) use ($fromDate) {
                $query->whereDate('created_at', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $favorites->where(function ($query) use ($toDate) {
                $query->whereDate('created_at', '<=', $toDate);
            });
        }

        if ($request->has('search') && $request->search) {
            $favorites->where(function ($query) use ($keyword) {
                $query->where('user_id', 'like', "%$keyword%")
                    ->orWhere('favorited_id', 'like', "%$keyword%")
                    ->orWhereHas('user', function ($query) use ($keyword) {
                        $query->where('nickname', 'like', "%$keyword%");
                    })
                    ->orwhereHas('favorited', function ($query) use ($keyword) {
                        $query->where('nickname', 'like', "%$keyword%");
                    });
            });
        }

        $favorites = $favorites->orderByDesc('created_at')->paginate($request->limit ?: 10);

        return view('admin.favorites.cast', compact('favorites'));
    }
}
