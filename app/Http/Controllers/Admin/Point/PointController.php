<?php

namespace App\Http\Controllers\Admin\Point;

use App\Enums\PointType;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Payment;
use App\Point;
use App\Services\CSVExport;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;

class PointController extends Controller
{
    public function sumAmount($points)
    {
        $pointIds = $points->where('type', '<>', PointType::ADJUSTED)
            ->where('type', '<>', PointType::INVITE_CODE)
            ->where('type', '<>', PointType::DIRECT_TRANSFER)
            ->pluck('id');
        $sumAmount = Payment::whereIn('point_id', $pointIds)->sum('amount');

        $pointRate = config('common.point_rate');
        $directTransferPointIds = $points->where('type', PointType::DIRECT_TRANSFER)->pluck('id');
        $sumDirectTransferPoint = Point::whereIn('id', $directTransferPointIds)->sum('point');
        $sumDirectTransferAmount = $sumDirectTransferPoint * $pointRate;

        return ($sumDirectTransferAmount + $sumAmount);
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

    public function sumPointIncrease($points)
    {
        return $points->sum(function ($product) {
            $sum = 0;
            if ($product->point > 0) {
                $sum += $product->point;
            }

            return $sum;
        });
    }

    public function sumPointReduction($points)
    {
        return $points->sum(function ($product) {
            $sum = 0;
            if ($product->point < 0) {
                $sum += $product->point;
            }

            return $sum;
        });
    }

    public function index(CheckDateRequest $request)
    {
        $keyword = $request->search_point_type;
        $pointTypes = [
            0 => '全て', // all
            PointType::BUY => 'ポイント購入',
            PointType::AUTO_CHARGE => 'オートチャージ',
            PointType::ADJUSTED => '調整',
        ];

        $with['user'] = function ($query) {
            return $query->withTrashed();
        };

        $points = Point::with($with)->whereIn('type', [
            PointType::BUY,
            PointType::AUTO_CHARGE,
            PointType::ADJUSTED,
            PointType::INVITE_CODE,
            PointType::DIRECT_TRANSFER,
        ])->where('status', true);

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
                    $item->id,
                    Carbon::parse($item->created_at)->format('Y年m月d日'),
                    $item->user_id,
                    isset($item->user->fullname) ? $item->user->fullname : $item->user_id,
                    PointType::getDescription($item->type),
                    $amount,
                    $item->point,
                ];
            })->toArray();

            $sum = [
                '合計',
                '-',
                '-',
                '-',
                '-',
                '¥ ' . number_format($this->sumAmount($pointsExport)),
                $this->sumPointBuy($pointsExport),
            ];

            array_push($data, $sum);

            $header = [
                '購入ID',
                '日付',
                'ユーザーID',
                'ユーザー名',
                '取引種別',
                '購入金額',
                '購入ポイント',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.points.index');
            }

            $file->output('point_buy_history_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.points.index', compact('points', 'pointTypes', 'sumAmount', 'sumPointBuy'));
    }

    public function getTransactionHistory(CheckDateRequest $request)
    {
        $keywordPoint = $request->search_point_type;
        $keywordUser = $request->search_user_type;

        $pointTypes = [
            0 => '全て', // all
            PointType::BUY => 'ポイント購入',
            PointType::AUTO_CHARGE => 'オートチャージ',
            PointType::PAY => 'ポイント決済',
            PointType::EVICT => 'ポイント失効',
            PointType::RECEIVE => 'ポイント受取',
            PointType::TRANSFER => '振込',
            PointType::ADJUSTED => '調整',
        ];

        $userTypes = [
            0 => '全て', // all
            UserType::GUEST => 'ゲスト',
            UserType::CAST => 'キャスト',
        ];

        $with['user'] = function ($query) {
            return $query->withTrashed();
        };
        $points = Point::with($with);

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

        if ($keywordPoint) {
            if ('0' != $keywordPoint) {
                $points->where(function ($query) use ($keywordPoint) {
                    $query->where('type', $keywordPoint);
                });
            }
        }

        if ($keywordUser) {
            if ('0' != $keywordUser) {
                $points = $points
                    ->whereHas('user', function ($query) use ($keywordUser) {
                        $query->where('type', $keywordUser);
                    });
            }
        }

        $points = $points->orderBy('created_at', 'DESC');
        $pointsExport = $points->get();
        $points = $points->paginate($request->limit ?: 10);

        $sumPointIncrease = $this->sumPointIncrease($points);
        $sumPointReduction = $this->sumPointReduction($points);

        if ('export' == $request->submit) {
            $data = collect($pointsExport)->map(function ($item) {
                return [
                    $item->id,
                    Carbon::parse($item->created_at)->format('Y年m月d日'),
                    $item->user_id,
                    $item->user->fullname,
                    UserType::getDescription($item->user->type),
                    PointType::getDescription($item->type),
                    ($item->point > 0) ? number_format($item->point) : '0',
                    ($item->point < 0) ? number_format(-$item->point) : '0',
                ];
            })->toArray();

            $sum = [
                '合計',
                '-',
                '-',
                '-',
                '-',
                '-',
                number_format($this->sumPointIncrease($pointsExport)),
                number_format(-$this->sumPointReduction($pointsExport)),
            ];

            array_push($data, $sum);

            $header = [
                '購入ID',
                '日付',
                'ユーザーID',
                'ユーザー名',
                'ユーザー種別',
                '取引種別',
                'ポイントの増加額',
                'ポイントの減少額',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.points.transaction_history');
            }

            $file->output('point_transaction_history_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.points.transaction_history', compact('points', 'pointTypes', 'userTypes', 'sumPointIncrease', 'sumPointReduction'));
    }

    public function getPointUser(CheckDateRequest $request)
    {
        $userType = $request->user_type;
        $userTypes = [
            UserType::GUEST => UserType::getDescription(UserType::GUEST),
            UserType::CAST => UserType::getDescription(UserType::CAST),
            3 => '全て', //all
        ];

        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        $users = User::withTrashed()->with(['points' => function ($query) use ($fromDate, $toDate) {
            if ($fromDate) {
                $query->where('points.created_at', '>=', $fromDate);
            }

            if ($toDate) {
                $query->where('points.created_at', '<=', $toDate);
            }
        }])
            ->whereHas('points', function ($query) use ($fromDate, $toDate) {
                if ($fromDate) {
                    $query->where('points.created_at', '>=', $fromDate);
                }

                if ($toDate) {
                    $query->where('points.created_at', '<=', $toDate);
                }
            });

        if ($userType) {
            if (3 != $userType) {
                $users->where('type', "$userType");
            }
        }

        $users = $users->orderBy('created_at', 'DESC');
        $pointsExport = $users->get();
        $users = $users->paginate($request->limit ?: 10);

        if ('export' == $request->submit) {
            $data = collect($pointsExport)->map(function ($item) {
                return [
                    $item->id,
                    $item->fullname,
                    UserType::getDescription($item->type),
                    $item->positivePoints($item->points),
                    $item->negativePoints($item->points),
                    $item->totalBalance($item->points),
                ];
            })->toArray();

            $sum = [
                '合計',
                '',
                '',
                $pointsExport->sum(function ($user) {
                    return $user->positivePoints($user->points);
                }),
                $pointsExport->sum(function ($user) {
                    return $user->negativePoints($user->points);
                }),
                $pointsExport->sum(function ($user) {
                    return $user->totalBalance($user->points);
                }),
            ];

            array_push($data, $sum);

            $header = [
                'ユーザーID',
                'ユーザー名',
                'ユーザー種別',
                'ポイントの増加額',
                'ポイントの減少額',
                'ポイントの残高',
            ];
            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);

                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.points.point_users');
            }

            $file->output('point_user_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }

        return view('admin.points.point_user', compact('users', 'userTypes'));
    }
}
