<?php

namespace App\Http\Controllers\Admin\Cast;

use App\Http\Controllers\Controller;
use App\User;
use App\Rating;
use App\Services\LogService;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function ratings(Request $request, $userId)
    {
        $user = User::withTrashed()->find($userId);
        $ratings = $user->ratings()->with('order', 'user');

        $keyword = $request->search;
        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($keyword) {
            $ratings->where(function($query) use ($keyword) {
                $query->where('user_id', 'like', $keyword)
                    ->orWhere('order_id', 'like', $keyword)
                    ->orWhereHas('user', function($subQuery) use ($keyword) {
                        $subQuery->where('nickname', 'like', "%$keyword%");
                    });
            });
        }

        if ($fromDate) {
            $ratings->where(function($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $ratings->where(function($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        $ratings = $ratings->orderBy('created_at', 'DESC')->paginate($request->limit ?: 10);

        return view('admin.casts.rating', compact('ratings', 'user'));
    }

    public function detail($user, $rating)
    {
        $rating = Rating::find($rating);

        return view('admin.casts.rating_detail', compact('rating'));
    }

    public function update(User $user, Rating $rating, Request $request)
    {
        try {
            $rules = [
                'memo' => 'required|max:350',
            ];

            $validator = validator($request->all(), $rules);

            if ($validator->fails()) {
                return back()->withErrors($validator->errors())->withInput();
            }

            DB::beginTransaction();

            $rating->memo = $request->memo;
            $rating->is_valid = $request->is_valid;
            $rating->save();

            // Update rating_score for cast
            $avgScore = $user->ratings()->where('is_valid', true)->avg('score');
            $user->rating_score = round($avgScore, 1);
            $user->save();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            return back();
        }

        return redirect()->route('admin.casts.guest_rating_detail', compact('user', 'rating'));
    }
}
