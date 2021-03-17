<?php

namespace App\Http\Controllers\Admin\CostEnterprise;

use App\Enums\PointType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Point;
use App\Services\CSVExport;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class CostEnterpriseController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $pointDescription = [
            'grant' => 'ポイント付与',
            'consumption' => 'ポイント消費',
            'expired' => 'ポイント失効',
        ];

        $orderBy = $request->only('user_id', 'order_id', 'created_at', 'type');
        $keyword = $request->search;
        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        $points = Point::where(function ($q) {
            $q->where('type', PointType::INVITE_CODE)
                ->orWhere([
                   ['type', '=', PointType::EVICT],
                   ['invite_code_history_id', '<>', null],
                ]);
            });

        if ($keyword) {
            $points->where(function ($q) use ($keyword) {
                $q->whereHas('user', function ($sq) use ($keyword) {
                    $sq->where('id', 'like', "$keyword")->orWhere('nickname', 'like', "%$keyword%");
                });
            });
        }

        $points = $points->get();

        $arr = [];
        foreach ($points as $key => $point) {
            array_push($arr, $point);

            $histories = $point->histories;
            if ($histories) {
                foreach ($histories as $value) {
                    array_push($arr, $value);
                }
            }
        }

        $collection = collect($arr);

        $collection = $collection->reject(function ($item) use ($fromDate, $toDate) {
            $bool = false;
            $createdAt = Carbon::parse($item['created_at']);

            if ($fromDate && $toDate) {
                $bool = ($createdAt >= $fromDate && $createdAt <= $toDate) !== true;
            } elseif ($fromDate) {
                $bool = ($createdAt >= $fromDate) !== true;
            } elseif ($toDate) {
                $bool = ($createdAt <= $toDate) !== true;
            }

            return $bool;
        })->values();

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $value) {
                $isDesc = ($value == 'asc') ? false : true;

                switch ($key) {
                    case 'user_id':
                        $collection = $collection->sortBy($key, SORT_REGULAR, $isDesc);
                        break;
                    case 'order_id':
                        $collection = $collection->sortBy($key, SORT_REGULAR, $isDesc);
                        break;
                    case 'created_at':
                        $collection = $collection->sortBy(function ($point, $key) {
                            return Carbon::parse($point['created_at'])->timestamp;
                        }, SORT_REGULAR, $isDesc);
                        break;
                    case 'type':
                        $collection = $collection->sortBy($key, SORT_REGULAR, $isDesc);
                        break;

                    default:break;
                }

            }
        } else {
            $collection = $collection->sortByDesc(function ($point, $key) {
                return Carbon::parse($point['created_at'])->timestamp;
            });
        }

        if ('export' == $request->submit) {
            if (!$collection->count()) {
                return redirect(route('admin.cost_enterprises.index'));
            }

            $data = $collection->map(function ($item) use ($pointDescription) {
                if (is_array($item)) {
                    return [
                        $item['point_id'],
                        $item['user_id'],
                        $item['order_id'],
                        Carbon::parse($item['created_at'])->format('Y/m/d H:i'),
                        $pointDescription['consumption'],
                        '-',
                        $item['point'],
                    ];
                } else {
                    switch ($item->type) {
                        case PointType::INVITE_CODE:
                            $type = $pointDescription['grant'];
                            $pointIncrease = $item->point;
                            $pointDecrease = '-';

                            break;
                        case PointType::EVICT:
                            $type = $pointDescription['expired'];
                            $pointIncrease = '-';
                            $pointDecrease = -$item->point;
                            break;

                        default:break;
                    }

                    return [
                        $item->id,
                        $item->user_id,
                        (!$item->order_id) ? '-' : $item->order_id,
                        Carbon::parse($item->created_at)->format('Y/m/d H:i'),
                        $type,
                        $pointIncrease,
                        $pointDecrease,
                    ];
                }

            })->toArray();

            $header = [
                '購入ID',
                'ゲストID',
                '予約ID',
                '日時',
                '種別',
                '増加ポイント',
                '減少ポイント',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.cost_enterprises.index');
            }

            $file->output('cost_enterprises_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        $total = $collection->count();
        $costEnterprises = $collection->forPage($request->page, $request->limit ?: 10);

        $costEnterprises = new LengthAwarePaginator($costEnterprises, $total, $request->limit ?: 10);
        $costEnterprises = $costEnterprises->withPath('');

        return view('admin.cost_enterprises.index', compact('costEnterprises', 'pointDescription'));
    }
}
