<?php

namespace App\Http\Controllers\Admin\Timeline;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Enums\TimelineStatus;
use App\Services\LogService;
use App\TimeLine;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class TimelineController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $hidden = isset($request->hidden) ? $request->hidden : TimelineStatus::PUBLIC;
        $timelines = TimeLine::with('user')->where('hidden', $hidden);

        $keyword = $request->search;
        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($keyword) {
            if ('0' != $keyword) {
                $timelines->where(function($query) use ($keyword) {
                    $query->where('user_id', 'like', $keyword)
                        ->orWhereHas('user', function($subQuery) use ($keyword) {
                            $subQuery->where('nickname', 'like', "%$keyword%");
                        });
                });
            }
        }

        if ($fromDate) {
            $timelines->where(function($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $timelines->where(function($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        $orderBy = $request->only('user_id', 'type', 'created_at');
        if (!empty($orderBy)) {
            $timelines = $timelines->get();

            foreach ($orderBy as $key => $value) {
                $isDesc = ($value == 'asc') ? false : true;

                switch ($key) {
                    case 'user_id':
                        $timelines = $timelines->sortBy($key, SORT_REGULAR, $isDesc);
                        break;
                    case 'type':
                        $timelines = $timelines->sortBy('user.type', SORT_REGULAR, $isDesc);
                        break;
                    case 'created_at':
                        $timelines = $timelines->sortBy($key, SORT_REGULAR, $isDesc);
                        break;

                    default:break;
                }
            }

            $total = $timelines->count();
            $timelines = $timelines->forPage($request->page, $request->limit ?: 10);

            $timelines = new LengthAwarePaginator($timelines, $total, $request->limit ?: 10);
            $timelines = $timelines->withPath('');
        } else {
            $timelines = $timelines->orderByDesc('created_at')->paginate($request->limit ?: 10);
        }

        return view('admin.timelines.index', compact('timelines', 'hidden'));
    }

    public function changeStatusHidden(TimeLine $timeline)
    {
        try {
            $timeline->hidden = !$timeline->hidden;
            $timeline->update();
            $hidden = $timeline->hidden;

            return redirect()->route('admin.timelines.index', compact('hidden'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }
}
