<?php

namespace App\Http\Controllers\Admin\InviteCodeHistory;

use App\InviteCodeHistory;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class InviteCodeHistoryController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $orderBy = $request->only('user_id', 'receive_user_id', 'created_at', 'order_id', 'status');

        $inviteCodeHistories = InviteCodeHistory::with('inviteCode', 'user', 'order', 'points');

        $keyword = $request->search;
        $fromDate = $request->from_date ? Carbon::parse($request->from_date)->startOfDay() : null;
        $toDate = $request->to_date ? Carbon::parse($request->to_date)->endOfDay() : null;

        if ($fromDate) {
            $inviteCodeHistories->where(function ($query) use ($fromDate) {
                $query->where('created_at', '>=', $fromDate);
            });
        }

        if ($toDate) {
            $inviteCodeHistories->where(function ($query) use ($toDate) {
                $query->where('created_at', '<=', $toDate);
            });
        }

        if ($keyword) {
            $inviteCodeHistories->where(function ($query) use ($keyword) {
                $query->where('receive_user_id', 'like', "$keyword")
                    ->orWhereHas('user', function ($q) use ($keyword) {
                        $q->where('nickname', 'like', "%$keyword%");
                    })
                    ->orWhereHas('inviteCode', function ($q) use ($keyword) {
                        $q->where('user_id', 'like', "$keyword")
                            ->orWhereHas('user', function ($sq) use ($keyword) {
                                $sq->where('nickname', 'like', "%$keyword%");
                            });
                    });
            });
        }

        if (!empty($orderBy)) {
            $inviteCodeHistories = $inviteCodeHistories->get();

            foreach ($orderBy as $key => $value) {
                $isDesc = ($value == 'asc') ? false : true;

                switch ($key) {
                    case 'user_id':
                        $inviteCodeHistories = $inviteCodeHistories->sortBy('inviteCode.user_id', SORT_REGULAR, $isDesc);
                        break;
                    case 'receive_user_id':
                        $inviteCodeHistories = $inviteCodeHistories->sortBy($key, SORT_REGULAR, $isDesc);
                        break;
                    case 'created_at':
                        $inviteCodeHistories = $inviteCodeHistories->sortBy($key, SORT_REGULAR, $isDesc);
                        break;
                    case 'order_id':
                        $inviteCodeHistories = $inviteCodeHistories->sortBy($key, SORT_REGULAR, $isDesc);
                        break;
                    case 'status':
                        $inviteCodeHistories = $inviteCodeHistories->sortBy($key, SORT_REGULAR, $isDesc);
                        break;

                    default:break;
                }

            }

            $total = $inviteCodeHistories->count();
            $inviteCodeHistories = $inviteCodeHistories->forPage($request->page, $request->limit ?: 10);

            $inviteCodeHistories = new LengthAwarePaginator($inviteCodeHistories, $total, $request->limit ?: 10);
            $inviteCodeHistories = $inviteCodeHistories->withPath('');
        } else {
            $inviteCodeHistories = $inviteCodeHistories->orderByDesc('created_at')->paginate($request->limit ?: 10);
        }

        return view('admin.invite_code_histories.index', compact('inviteCodeHistories'));
    }

    public function show(InviteCodeHistory $inviteCodeHistory)
    {
        return view('admin.invite_code_histories.show', compact('inviteCodeHistory'));
    }
}
