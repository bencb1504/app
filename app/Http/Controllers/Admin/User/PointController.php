<?php

namespace App\Http\Controllers\Admin\User;

use App\Enums\PointCorrectionType;
use App\Enums\PointType;
use App\Enums\Status;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Payment;
use App\Point;
use App\Services\CSVExport;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class PointController extends Controller
{
    public function sumAmount($points)
    {
        $pointRate = config('common.point_rate');
        $directTransferPointIds = $points->where('type', PointType::DIRECT_TRANSFER)->pluck('id');
        $sumDirectTransferPoint = Point::whereIn('id', $directTransferPointIds)->sum('point');
        $sumDirectTransferAmount = $sumDirectTransferPoint * $pointRate;

        $pointIds = $points->whereNotIn('type', [
            PointType::ADJUSTED,
            PointType::INVITE_CODE,
            PointType::DIRECT_TRANSFER
            ])->pluck('id');
        $sumAmount = Payment::whereIn('point_id', $pointIds)->sum('amount');

        return ($sumDirectTransferAmount + $sumAmount);
    }

    public function sumPointPay($points)
    {
        return $points->sum(function ($product) {
            $sum = 0;
            if ($product->is_pay) {
                $sum += $product->point;
            }

            return $sum;
        });
    }

    public function sumPointBuy($points)
    {
        return $points->sum(function ($product) {
            $sum = 0;
            if ($product->is_buy) {
                $sum += $product->point;
            }

            if ($product->is_auto_charge) {
                $sum += $product->point;
            }

            if ($product->is_adjusted) {
                $sum += $product->point;
            }

            if ($product->is_invite_code) {
                $sum += $product->point;
            }

            if ($product->is_direct_transfer) {
                $sum += $product->point;
            }

            return $sum;
        });
    }

    public function getPointHistory($userId, CheckDateRequest $request)
    {
        $keyword = $request->search_point_type;
        $pointTypes = [
            0 => '全て', // all
            PointType::BUY => 'ポイント購入',
            PointType::PAY => 'ポイント決済',
            PointType::AUTO_CHARGE => 'オートチャージ',
            PointType::ADJUSTED => '調整',
            PointType::EVICT => 'ポイント失効',
        ];

        $pointCorrectionTypes = [
            PointCorrectionType::ACQUISITION => '取得ポイント',
            PointCorrectionType::CONSUMPTION => '消費ポイント',
        ];

        $user = User::withTrashed()->find($userId);

        if ($user->is_multi_payment_method) {
            $pointCorrectionTypes[PointType::DIRECT_TRANSFER] = 'ポイント付与';
        }

        $points = $user->points()->with('payment', 'order')
            ->where(function ($query) {
                $query->whereIn('type',
                    [
                        PointType::BUY,
                        PointType::PAY,
                        PointType::AUTO_CHARGE,
                        PointType::EVICT,
                        PointType::INVITE_CODE,
                        PointType::DIRECT_TRANSFER,
                    ])
                    ->orWhere(function ($subQ) {
                        $subQ->where('type', PointType::ADJUSTED)
                            ->where('is_cast_adjusted', false);
                    });
                })
            ->where('status', Status::ACTIVE);

        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($fromDate) {
            $points->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $points->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($keyword) {
            if ('0' != $keyword) {
                $points->where(function ($query) use ($keyword) {
                    $query->where('type', $keyword);
                });
            }
        }

        $points = $points->orderBy('created_at', 'DESC');
        $pointsExport = $points->get();
        $points = $points->paginate($request->limit ?: 10);

        $sumAmount = $this->sumAmount($points);
        $sumPointBuy = $this->sumPointBuy($points);
        $sumPointPay = -$this->sumPointPay($points);
        $sumNonTransfer = $sumPointBuy - $sumPointPay;

        if ('export' == $request->submit) {
            $data = collect($pointsExport)->map(function ($item) {
                $amount = '-';
                if ($item->is_direct_transfer) {
                    $amount = '¥ ' . number_format($item->point * config('common.point_rate'));
                } else {
                    if ($item->is_adjusted || !$item->payment || $item->is_invite_code) {
                        //
                    } else {
                        $amount = '¥ ' . number_format($item->payment ? $item->payment->amount : 0);
                    }
                }

                return [
                    Carbon::parse($item->created_at)->format('Y年m月d日'),
                    PointType::getDescription($item->type),
                    ($item->is_buy || $item->is_auto_charge || $item->is_direct_transfer || $item->is_invite_code) ? $item->id : '-',
                    ($item->is_pay) ? $item->order->id : '-',
                    $amount,
                    ($item->is_buy || $item->is_auto_charge || $item->is_adjusted || $item->is_direct_transfer || $item->is_invite_code) ? $item->point : '',
                    ($item->is_pay) ? (-$item->point) : '-',
                    $item->balance,
                ];
            })->toArray();

            $sumPointBuyExport = $this->sumPointBuy($pointsExport);
            $sumPointPayExport = -$this->sumPointPay($pointsExport);
            $sumNonTransferExport = $sumPointBuyExport - $sumPointPayExport;

            $sum = [
                '合計',
                '-',
                '-',
                '-',
                '¥ ' . number_format($this->sumAmount($pointsExport)),
                $sumPointBuyExport,
                $sumPointPayExport,
                $sumNonTransferExport,
            ];

            array_push($data, $sum);

            $header = [
                '日付',
                '取引タイプ',
                '購入ID',
                '予約ID',
                '請求金額',
                '購入ポイント',
                '決済ポイント',
                '残高',
            ];
            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.users.points_history', compact('user'));
            }
            $file->output('history_point_of_user_' . $user->fullname . '_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.users.points_history', compact(
            'user', 'points', 'sumAmount',
            'sumPointPay', 'sumPointBuy', 'sumNonTransfer',
            'pointTypes', 'pointCorrectionTypes')
        );
    }

    public function changePoint(User $user, Request $request)
    {
        $rules = [
            'point' => 'regex:/^[0-9]+$/',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->all()], 400);
        }

        switch ($request->correction_type) {
            case PointCorrectionType::ACQUISITION:
                $point = $request->point;
                $type = PointType::ADJUSTED;
                break;
            case PointCorrectionType::CONSUMPTION:
                $point = -$request->point;
                $type = PointType::ADJUSTED;
                break;
            case PointType::DIRECT_TRANSFER:
                $point = $request->point;
                $type = PointType::DIRECT_TRANSFER;
                break;

            default:break;
        }

        $newPoint = $user->point + $point;
        $balance = ($point < 0) ? $newPoint : $point;

        $input = [
            'point' => $point,
            'balance' => $balance,
            'type' => $type,
            'status' => Status::ACTIVE,
        ];

        try {
            DB::beginTransaction();

            $user->points()->create($input);

            $user->point = $newPoint;
            $user->save();

            if ($request->correction_type == PointCorrectionType::CONSUMPTION) {
                $subPoint = $request->point;
                $points = Point::where('user_id', $user->id)
                    ->where('balance', '>', 0)
                    ->where(function ($query) {
                        $query->whereIn('type',
                            [
                                PointType::BUY,
                                PointType::AUTO_CHARGE,
                                PointType::INVITE_CODE, 
                                PointType::DIRECT_TRANSFER,
                            ])
                            ->orWhere(function ($subQ) {
                                $subQ->where('type', PointType::ADJUSTED)
                                    ->where('is_cast_adjusted', false)
                                    ->where('point', '>=', 0);
                            });
                        })
                    ->orderBy('created_at')
                    ->get();

                foreach ($points as $value) {
                    if (0 == $subPoint) {
                        break;
                    } elseif ($value->balance > $subPoint && $subPoint > 0) {
                        $value->balance = $value->balance - $subPoint;
                        $value->update();

                        break;
                    } elseif ($value->balance <= $subPoint) {
                        $subPoint -= $value->balance;
                        
                        $value->balance = 0;
                        $value->update();
                    }
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);

            $request->session()->flash('msg', trans('messages.server_error'));
        }

        return response()->json(['success' => true]);
    }
}
