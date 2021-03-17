<?php

namespace App\Http\Controllers\Admin\Cast;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Cast;
use Carbon\Carbon;
class ShiftController extends Controller
{
    public function index($userId)
    {
        $user = Cast::withTrashed()->find($userId);
        $from = now()->copy()->startOfDay();
        $to = now()->copy()->addDays(13)->startOfDay();
        $updateShiftLatest = $user->shifts()->orderBy('shift_user.updated_at', 'DESC')->first();
        $shifts = $user->shifts()->whereBetween('date', [$from, $to])->get();

        return view('admin.casts.schedule', compact('user', 'shifts', 'updateShiftLatest'));
    }
}
