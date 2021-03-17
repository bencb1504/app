<?php

namespace App\Http\Controllers\Admin\Report;

use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckDateRequest;
use App\Notification;
use App\Report;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(CheckDateRequest $request)
    {
        $keyword = $request->search;
        if ($request->has('notification_id')) {
            $notification = Notification::find($request->notification_id);
            if (null == $notification->read_at) {
                $now = Carbon::now();
                try {
                    $notification->read_at = $now;
                    $notification->save();
                } catch (\Exception $e) {
                    LogService::writeErrorLog($e);

                    return $this->respondServerError();
                }
            }
        }

        $reports = Report::query();

        if ($request->has('from_date') && !empty($request->from_date)) {
            $fromDate = Carbon::parse($request->from_date)->startOfDay();
            $reports->where('created_at', '>=', $fromDate);
        }

        if ($request->has('to_date') && !empty($request->to_date)) {
            $toDate = Carbon::parse($request->to_date)->endOfDay();
            $reports->where('created_at', '<=', $toDate);
        }

        if ($request->has('search') && $request->search) {
            $reports->where('content', 'like', "%$keyword%");
            $reports->orwhereHas('user', function ($q) use ($keyword) {
                $q->where('fullname', 'like', "%$keyword%");
            });
        }

        $reports = $reports->orderBy('status')->orderBy('created_at', 'DESC')->paginate($request->limit ?: 10);

        return view('admin.reports.index', compact('reports'));
    }

    public function makeReportDone(Request $request)
    {
        $listReportIds = $request->report_ids;
        if ($listReportIds) {
            try {
                $reports = Report::whereIn('id', $listReportIds)->update(['status' => ReportStatus::DONE]);
            } catch (\Exception $e) {
                LogService::writeErrorLog($e);
                return $this->respondServerError();
            }
        }

        return redirect(route('admin.reports.index'));
    }
}
