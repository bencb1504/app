<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Cast;
use App\Enums\OrderStatus;
use App\Order;
use App\RankSchedule;
use App\Services\CSVExport;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class RankScheduleController extends Controller
{
    public function getRankSchedule()
    {
        $rankSchedule = RankSchedule::first();

        return view('admin.rank_schedules.index', compact('rankSchedule'));
    }

    public function setRankSchedule(Request $request)
    {
        try {
            $rankSchedule = RankSchedule::first();

            $rules = [
                'from_date' => 'required|date',
                'to_date' => 'required|date|after_or_equal:from_date',
                'num_of_attend_platium' => 'required|numeric',
                'num_of_avg_rate_platium' => 'required|numeric',
                'num_of_attend_up_platium' => 'required|numeric',
                'num_of_avg_rate_up_platium' => 'required|numeric',
            ];

            $validator = validator($request->all(), $rules);

            if ($validator->fails()) {
                return back()->withErrors($validator->errors())->withInput();
            }

            $input = request()->only([
                'from_date',
                'to_date',
                'num_of_attend_platium',
                'num_of_avg_rate_platium',
                'num_of_attend_up_platium',
                'num_of_avg_rate_up_platium',
            ]);

            if (!$rankSchedule) {
                $rankSchedule = new RankSchedule;
                $rankSchedule = $rankSchedule->create($input);

                return redirect()->route('admin.rank_schedules.index');
            }

            $rankSchedule->update($input);

            return redirect()->route('admin.rank_schedules.index');
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }

    public function getListCast(CheckDateRequest $request)
    {
        $fromDate = '';
        $toDate = '';
        $keyword = $request->search;

        $rankSchedule = RankSchedule::first();
        if ($rankSchedule) {
            $fromDate = $rankSchedule->from_date;
            $toDate = $rankSchedule->to_date;
        }

        if ($request->from_date) {
            $fromDate = $request->from_date;
        }

        if ($request->to_date) {
            $toDate = $request->to_date;
        }

        $fromDate = $fromDate ? Carbon::parse($fromDate)->startOfDay() : null;
        $toDate = $toDate ? Carbon::parse($toDate)->endOfDay() : null;

        if ($fromDate > $toDate || (!$rankSchedule && $fromDate == null && $toDate == null)) {
            $casts = collect([]);
            return view('admin.rank_schedules.casts', compact('casts', 'rankSchedule'));
        }

        $casts = Cast::with([
                'orders' => function($q) use ($fromDate, $toDate) {
                    $q->where('orders.status', OrderStatus::DONE)
                        ->whereBetween('orders.date', [$fromDate, $toDate]);
                }
            ])
            ->with([
                'ratings' => function($q) use ($fromDate, $toDate) {
                    $q->whereBetween('ratings.created_at', [$fromDate, $toDate])
                        ->where('ratings.is_valid', true)
                        ->whereNotNull('ratings.satisfaction')
                        ->whereNotNull('ratings.appearance')
                        ->whereNotNull('ratings.friendliness');
                }
            ]);

        // Search castId, nickname
        if ($keyword) {
            $casts->where(function ($q) use ($keyword) {
                $q->where('id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%");
            });
        }

        // Sort by cast class
        if ($request->class_id) {
           $casts->orderBy('class_id', $request->class_id);
        }

        // Casts collection
        // Count order of the cast
        // Calculate average rate of the cast
        $collection = $casts->get()->transform(function ($cast) {
            $cast->total_order = $cast->orders->count();
            $ratings = $cast->ratings;
            $avgOfRate = 0;
            $sumOfScore = 0;

            if ($numOfScores = $ratings->count()) {
                foreach ($ratings as $rating) {
                    $sumOfScore = $rating->score + $sumOfScore;
                }

                $avgOfRate = $sumOfScore / $numOfScores;
            }

            $cast->avg_rate = $avgOfRate ?? 0;

            return $cast;
        });

        // Search total order
        // Search average rate
        if ($request->avg_rate || $request->total_order) {
            $casts = $collection;

            if ($request->total_order) {
                $sortByTotalOrder = ($request->total_order == 'desc') ? true : false;

                $casts = $casts->sortBy(function ($cast, $key) {
                    return $cast['total_order'];
                }, SORT_REGULAR, $sortByTotalOrder);
            }

            if ($request->avg_rate) {
                $sortByAvgRate = ($request->avg_rate == 'desc') ? true : false;

                $casts = $casts->sortBy(function ($cast, $key) {
                    return $cast['avg_rate'];
                }, SORT_REGULAR, $sortByAvgRate);
            }

            $total = $casts->count();
            $casts = $casts->values()->forPage($request->page, $request->limit ?: 10);

            $casts = new LengthAwarePaginator($casts, $total, $request->limit ?: 10);
            $casts = $casts->withPath('');
        } else {
            $casts = $casts->paginate($request->limit ?: 10);
        }

        // Export rank schedules of casts
        if ('export' == $request->submit) {
            if (!$casts->count()) {
                return redirect(route('admin.rank_schedules.casts'));
            }

            $data = $casts->map(function ($item) {
                return [
                    $item->id,
                    $item->nickname,
                    $item->castClass->name,
                    $item->orders->count(),
                    $item->ratings->avg('score') ? round($item->ratings->avg('score'), 2) : 0,
                ];
            })->toArray();

            $header = [
                'キャストID',
                'キャスト名',
                'キャストクラス',
                '参加回数',
                '平均評価',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.rank_schedules.casts');
            }

            $file->output('rank_schedule_casts_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.rank_schedules.casts', compact('casts', 'rankSchedule'));
    }
}
