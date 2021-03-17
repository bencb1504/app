<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Verification;
use Carbon\Carbon;

class VerificationController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $verifications = Verification::whereNull('status')->where('is_resend', true);

        $keyword = $request->search;

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $verifications->where(function ($query) use ($fromDate) {
                $query->whereDate('created_at', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $verifications->where(function ($query) use ($toDate) {
                $query->whereDate('created_at', '<=', $toDate);
            });
        }

        if ($request->has('search') && $request->search) {
            $verifications->where(function ($query) use ($keyword) {
                $query->where('phone', 'like', "%$keyword%")
                    ->orWhere('user_id', 'like', "%$keyword%");
            });
        }

        $verifications = $verifications->orderByDesc('created_at')->paginate($request->limit ?: 10);

        return view('admin.verifications.index', compact('verifications'));
    }
}
