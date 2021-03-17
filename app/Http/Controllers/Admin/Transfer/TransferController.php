<?php

namespace App\Http\Controllers\Admin\Transfer;

use App\Enums\PointType;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Point;
use App\Services\CSVExport;
use App\Services\LogService;
use App\Transfer;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function getTransferedList(CheckDateRequest $request)
    {
        if ($request->from_date && $request->to_date) {
            if ($request->from_date > $request->to_date) {
                return redirect()->back();
            }
        }

        $adminType = UserType::ADMIN;
        $keyword = $request->search;
        $with['user'] = function ($query) {
            return $query->withTrashed();
        };
        $with[] = 'order';

        $transfers = Point::with($with)
            ->where('is_transfered', true)
            ->whereHas('user', function ($q) use ($adminType) {
                $q->withTrashed()->where('type', '<>', $adminType);
            })
            ->where(function ($q) {
                $q->whereHas('order', function ($sq) {
                    $sq->whereNull('deleted_at')
                        ->where('points.type', PointType::RECEIVE);
                });

                $q->orWhere(function ($sq) {
                    $sq->doesntHave('order');

                    $sq->where([
                        ['points.type', '=', PointType::ADJUSTED],
                        ['points.is_cast_adjusted', '=', true],
                    ]);

                });
            })
            ->orderBy('updated_at', 'DESC');

        if (!empty($request->from_date) || !empty($request->to_date)) {
            $transfers->where(function ($query) use ($request) {
                if (!empty($request->from_date)) {
                    $fromDate = Carbon::parse($request->from_date)->startOfDay();
                    $query->where('created_at', '>=', $fromDate);
                }

                if (!empty($request->to_date)) {
                    $toDate = Carbon::parse($request->to_date)->endOfDay();
                    $query->where('created_at', '<=', $toDate);
                }
            });
        }

        if ($keyword) {
            $transfers->whereHas('user', function ($q) use ($keyword) {
                $q->withTrashed()
                    ->where('id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%");
            });
        }

        if ('export' == $request->submit) {
            $transfersExport = $transfers->get();

            if (!$transfersExport->count()) {
                return redirect(route('admin.transfers.non_transfers'));
            }

            $data = collect($transfersExport)->map(function ($item) {
                return [
                    $item->order_id,
                    $item->order ? Carbon::parse($item->order->created_at)->format('Y年m月d日') : Carbon::parse($item->created_at)->format('Y年m月d日'),
                    $item->user_id,
                    $item->user ? $item->user->nickname : " ",
                    '￥'.number_format($item->point),
                ];
            })->toArray();

            $sum = [
                '合計',
                '',
                '',
                '',
                '¥ ' . $transfersExport->sum('point'),
            ];

            array_push($data, $sum);

            $header = [
                '予約ID',
                '予約開始日時',
                'ユーザーID',
                'ユーザー名',
                '振込金額',
            ];

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                $request->session()->flash('msg', trans('messages.server_error'));

                return redirect()->route('admin.points.transfered');
            }

            $file->output('transfered_list_' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }
        $transfers = $transfers->paginate($request->limit ?: 10);

        return view('admin.transfers.transfered', compact('transfers'));
    }

    public function getNotTransferedList(CheckDateRequest $request)
    {
        if ($request->from_date && $request->to_date) {
            if ($request->from_date > $request->to_date) {
                return redirect()->back();
            }
        }

        $keyword = $request->search;
        $adminType = UserType::ADMIN;
        $with['user'] = function ($query) {
            return $query->withTrashed();
        };
        $with[] = 'order';

        $transfers = Point::with($with)
            ->where('is_transfered', false)
            ->whereHas('user', function ($q) use ($adminType) {
                $q->withTrashed()->where('type', '<>', $adminType);
            })
            ->where(function ($q) {
                $q->whereHas('order', function ($sq) {
                    $sq->whereNull('deleted_at')
                        ->where('points.type', PointType::RECEIVE);
                });

                $q->orWhere(function ($sq) {
                    $sq->doesntHave('order');

                    $sq->where([
                        ['points.type', '=', PointType::ADJUSTED],
                        ['points.is_cast_adjusted', '=', true],
                    ]);

                });
            })
            ->orderBy('updated_at', 'DESC');

        if (!empty($request->from_date) || !empty($request->to_date)) {
            $transfers->where(function ($query) use ($request) {
                if (!empty($request->from_date)) {
                    $fromDate = Carbon::parse($request->from_date)->startOfDay();
                    $query->where('created_at', '>=', $fromDate);
                }

                if (!empty($request->to_date)) {
                    $toDate = Carbon::parse($request->to_date)->endOfDay();
                    $query->where('created_at', '<=', $toDate);
                }
            });
        }

        if ($keyword) {
            $transfers->whereHas('user', function ($q) use ($keyword) {
                $q->withTrashed()
                    ->where('id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%");
            });
        }

        if ('transfers' == $request->submit) {
            $nonTransfersExport = $transfers->get();

            $header = [
                '予約ID',
                '予約開始日時',
                'ユーザーID',
                'ユーザー名',
                '振込金額',
            ];

            $data = collect($nonTransfersExport)->map(function ($item) {
                return [
                    $item->order_id,
                    $item->order ? Carbon::parse($item->order->created_at)->format('Y年m月d日') : Carbon::parse($item->created_at)->format('Y年m月d日'),
                    $item->user_id,
                    $item->user ? $item->user->nickname : " ",
                    '￥'.number_format($item->point),
                ];
            })->toArray();

            $end = [
                '合計',
                '',
                '',
                '',
                '¥'.number_format($nonTransfersExport->sum('point')),
            ];

            array_push($data, $end);

            try {
                $file = CSVExport::toCSV($data, $header);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
            }

            $file->output('non_transfered_list' . Carbon::now()->format('Ymd_Hi') . '.csv');

            return;
        }
        $transfers = $transfers->paginate($request->limit ?: 10);

        return view('admin.transfers.non_transfer', compact('transfers'));
    }

    public function changeTransfers(Request $request)
    {
        if ($request->has('transfer_ids')) {
            $transferIds = $request->transfer_ids;

            $checkTransferExist = Point::whereIn('id', $transferIds)
                ->where('is_transfered', false)
                ->where(function ($query) {
                    $query->where('type', PointType::RECEIVE)
                        ->orWhere([
                            ['points.type', '=', PointType::ADJUSTED],
                            ['points.is_cast_adjusted', '=', true],
                        ]);
                })
                ->exists();

            try {
                if ($checkTransferExist) {
                    \DB::beginTransaction();
                    $transfers = Point::whereIn('id', $transferIds);
                    $transfers->update(['is_transfered' => true]);

                    $transfers = $transfers->groupBy('user_id')->selectRaw('sum(point) as sum, user_id');

                    foreach ($transfers->cursor() as $transfer) {
                        $user = $transfer->user;
                        $user->total_point += $transfer->sum;
                        $user->point -= $transfer->sum;
                        $user->save();

                        $data['point'] = -$transfer->sum;
                        $data['balance'] = $user->point;
                        $data['user_id'] = $transfer->user_id;
                        $data['type'] = PointType::TRANSFER;

                        $point = new Point;

                        $point->createPoint($data, true);
                    }

                    \DB::commit();

                    return redirect(route('admin.transfers.transfered'));
                } else {
                    \DB::beginTransaction();
                    $transfers = Point::whereIn('id', $transferIds);
                    $transfers->update(['is_transfered' => false]);
                    $transfers = $transfers->groupBy('user_id')->selectRaw('sum(point) as sum, user_id');

                    foreach ($transfers->cursor() as $transfer) {
                        $user = $transfer->user;
                        $user->total_point -= $transfer->sum;
                        $user->point += $transfer->sum;
                        $user->save();

                        $data['point'] = $transfer->sum;
                        $data['balance'] = $user->point;
                        $data['user_id'] = $transfer->user_id;
                        $data['type'] = PointType::ADJUSTED;

                        $point = new Point;
                        $point->createPoint($data, true);
                    }

                    \DB::commit();

                    return redirect(route('admin.transfers.non_transfers'));
                }
            } catch (\Exception $e) {
                \DB::rollBack();
                LogService::writeErrorLog($e);
            }
        }
    }
}
