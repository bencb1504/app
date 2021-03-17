<?php

namespace App\Http\Controllers\Admin\RequestTransfer;

use App\CastClass;
use App\Enums\CastTransferStatus;
use App\Enums\UserGender;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Notifications\RequestTransferNotify;
use App\Services\LogService;
use App\Shift;
use App\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RequestTransferController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $keyword = $request->search;
        $orderBy = $request->only('nickname', 'request_transfer_date');
        $castTransferStatus = $request->cast_transfer_status;
        if (!$castTransferStatus) {
            return redirect()->route('admin.request_transfer.index', ['cast_transfer_status' => CastTransferStatus::PENDING]);
        }

        $casts = User::where([
            'cast_transfer_status' => $castTransferStatus,
        ]);

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $casts->where(function ($query) use ($fromDate) {
                $query->whereDate('request_transfer_date', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $casts->where(function ($query) use ($toDate) {
                $query->whereDate('request_transfer_date', '<=', $toDate);
            });
        }

        if ($request->has('search') && $request->search) {
            $casts->where(function ($query) use ($keyword) {
                $query->where('fullname', 'like', "%$keyword%")
                    ->orWhere('id', $keyword);
            });
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $value) {
                $casts->orderBy($key, $value);
            }
        } else {
            $casts->orderBy('created_at', 'DESC');
        }

        $casts = $casts->paginate($request->limit ?: 10);

        return view('admin.request_transfer.index', compact('casts'));
    }

    public function show(User $cast)
    {
        return view('admin.request_transfer.show', compact('cast'));
    }

    public function update(User $cast, Request $request)
    {
        try {
            if ($request->has('transfer_request_status')) {
                switch ($request->transfer_request_status) {
                    case 'approved':
                        $castClass = CastClass::findOrFail(1);

                        $cast->cast_transfer_status = CastTransferStatus::APPROVED;
                        $cast->gender = UserGender::FEMALE;
                        $cast->type = UserType::CAST;
                        $cast->class_id = $castClass->id;
                        $cast->cost = config('common.cost_default');
                        $cast->accept_request_transfer_date = now();
                        $cast->save();

                        if (count($cast->shifts)) {
                            $castLatestShift = $cast->shifts()->orderBy('id', 'desc')->first();
                            $castShiftDate = Carbon::parse($castLatestShift->date);
                            $shifts = Shift::whereDate('date', '>', $castShiftDate)->pluck('id');
                            if (count($shifts)) {
                                $cast->shifts()->attach($shifts);
                            }
                        } else {
                            $now = now()->startOfDay();
                            $shifts = Shift::whereDate('date', '>=', $now)->pluck('id');
                            $cast->shifts()->attach($shifts);
                        }
                        break;

                    case 'verified-step-one':
                        $castClass = CastClass::findOrFail(1);

                        $cast->cast_transfer_status = CastTransferStatus::VERIFIED_STEP_ONE;
                        $cast->type = UserType::CAST;
                        $cast->class_id = $castClass->id;
                        $cast->cost = config('common.cost_default');
                        $cast->accept_verified_step_one_date = now();
                        $cast->save();
                        break;

                    case 'denied-female':
                        $castClass = CastClass::findOrFail(1);

                        $cast->cast_transfer_status = CastTransferStatus::DENIED;
                        $cast->gender = UserGender::FEMALE;
                        $cast->type = UserType::CAST;
                        $cast->class_id = $castClass->id;
                        $cast->save();
                        break;

                    case 'denied-male':
                        $cast->cast_transfer_status = CastTransferStatus::DENIED;
                        $cast->gender = UserGender::MALE;
                        $cast->type = UserType::GUEST;
                        $cast->is_guest_active = false;
                        $cast->save();
                        break;

                    default:break;
                }

                $cast->notify(new RequestTransferNotify());

                switch ($request->transfer_request_status) {
                    case 'verified-step-one':
                        return redirect(route('admin.request_transfer.index', ['cast_transfer_status' => CastTransferStatus::VERIFIED_STEP_ONE]));
                        break;
                    case 'approved':
                        return redirect(route('admin.casts.index'));
                        break;

                    default:break;
                }

                return redirect(route('admin.request_transfer.index', ['cast_transfer_status' => CastTransferStatus::DENIED]));
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            $request->session()->flash('err', trans('messages.server_error'));

            return redirect(route('admin.request_transfer.show', ['cast' => $cast->id]));
        }
    }
}
