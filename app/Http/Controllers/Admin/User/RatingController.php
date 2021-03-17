<?php

namespace App\Http\Controllers\Admin\User;

use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function ratings(Request $request, $userId)
    {
        $user = User::withTrashed()->find($userId);
        $ratings = $user->ratings()->with('order', 'user')->orderBy('created_at', 'DESC')->paginate($request->limit ?: 10);
        $score = round($ratings->avg('score'), 1);

        return view('admin.users.rating', compact('ratings', 'user', 'score'));
    }
}
