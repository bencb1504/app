<?php

namespace App\Http\Controllers\Admin\Resigns;

use App\Enums\ResignStatus;
use App\Enums\Status;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Services\CSVExport;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use App\Traits\DeleteUser;

class ResignController extends Controller
{
    use DeleteUser;

    public function index(CheckDateRequest $request)
    {
        $keyword = $request->search;

        if ($request->resign_status == ResignStatus::PENDING) {
            $users = User::where('resign_status', ResignStatus::PENDING);
        } else {
            $users = User::onlyTrashed()->where('resign_status', ResignStatus::APPROVED);
        }
        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $users->where(function ($query) use ($fromDate) {
                $query->where('resign_date', '>=', $fromDate);
            });
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $users->where(function ($query) use ($toDate) {
                $query->where('resign_date', '<=', $toDate);
            });
        }

        if ($request->has('search')) {
            $users->where(function ($query) use ($keyword) {
                $query->where('id', "$keyword")
                    ->orWhere('nickname', 'like', "%$keyword%");
            });
        }

        $users = $users->orderBy('resign_date', 'DESC');

        // Export resign
        if ($request->has('is_export_resign')) {
            $resignExport = $users->get();

            return $this->exportResign($resignExport);
        }

        $users = $users->paginate($request->limit ?: 10);

        return view('admin.resigns.index', compact('users'));
    }

    public function show(Request $request, $id)
    {
        $user = User::withTrashed()->where('resign_status', '<>', ResignStatus::NOT_RESIGN)->find($id);

        return view('admin.resigns.show', compact('user'));
    }

    public function resign(Request $request) {

        try {
            if ($request->has('user_ids')) {
                $userIds = array_map('intval', explode(',', $request->user_ids));

                $checkUserIdExist = User::whereIn('id', $userIds)->where('resign_status', ResignStatus::PENDING)->whereNull('deleted_at')->exists();

                if ($checkUserIdExist) {
                    $users = User::whereIn('id', $userIds)->get();

                    foreach ($users as $user) {
                        DB::beginTransaction();

                        $this->deleteUser($user);

                        DB::commit();
                    }
                }
            }

            return redirect(route('admin.resigns.index', ['resign_status'=> ResignStatus::PENDING]));
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);
        }
    }

    public function exportResign($resignExport)
    {
        $data = collect($resignExport)->map(function ($item) {
            return [
                $item->id,
                $item->nickname,
                Carbon::parse($item->deleted_at)->format('Y年m月d日　H:i'),
                $item->first_resign_description,
                $item->second_resign_description,
            ];
        })->toArray();

        $header = [
            'ユーザーID',
            'ユーザー名',
            '退会日時',
            '退会理由',
            '退会理由(フリー入力)',
        ];

        try {
            $file = CSVExport::toCSV($data, $header);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            request()->session()->flash('msg', trans('messages.server_error'));

            return redirect()->route('admin.resigns.index', ['resign_status' => ResignStatus::APPROVED]);
        }
        $file->output('resigns_' . Carbon::now()->format('Ymd_Hi') . '.csv');

        return;
    }

    public function revertRequest($resign)
    {
        $user = User::findOrFail($resign);

        try {
            $user->resign_status = ResignStatus::NOT_RESIGN;
            $user->resign_date = null;
            $user->first_resign_description = null;
            $user->second_resign_description = null;

            $user->save();

            return redirect(route('admin.resigns.index', ['resign_status'=> ResignStatus::PENDING]));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
        }
    }
}
