<?php

namespace App\Http\Controllers\Admin\Sales;

use App\Enums\PointType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Point;
use App\Services\CSVExport;
use App\Services\LogService;
use Carbon\Carbon;

class SaleController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $pointType = $request->search_point_type;

        $pointTypes = [
            0 => '全て', // all
            PointType::PAY => 'ポイント決済',
            PointType::ADJUSTED => '調整',
            PointType::EVICT => 'ポイント失効',
        ];

        $sales = Point::whereIn('type', [PointType::PAY, PointType::ADJUSTED, PointType::EVICT]);

        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($fromDate) {
            $sales->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $sales->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($pointType) {
            if ('0' != $pointType) {
                $sales->where(function ($query) use ($pointType) {
                    $query->where('type', $pointType);
                });
            }
        }

        $sales = $sales->orderBy('created_at', 'DESC');
        $salesExport = $sales->get();
        $sales = $sales->paginate($request->limit ?: 10);

        $totalPoint = $sales->sum('point');

        if ('export' == $request->submit) {
            $data = collect($salesExport)->map(function ($item) {
                return [
                    $item->order_id,
                    Carbon::parse($item->created_at)->format('Y年m月d日'),
                    $item->user_id,
                    ($item->user) ? $item->user->fullname : "",
                    PointType::getDescription($item->type),
                    number_format($item->point),
                ];
            })->toArray();

            $sum = [
                '合計',
                '-',
                '-',
                '-',
                '-',
                number_format($salesExport->sum('point')),
            ];

            array_push($data, $sum);

            $header = [
                '予約ID',
                '日付',
                'ユーザーID',
                'ユーザー名',
                '取引種別',
                '消費ポイント',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.sales.index');
            }
            $file->output('Revenue_list_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.sales.index', compact('sales', 'totalPoint', 'pointTypes'));
    }
}
