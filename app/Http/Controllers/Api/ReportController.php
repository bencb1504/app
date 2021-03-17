<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoomType;
use App\Notifications\CreatedReport;
use App\Notifications\CreateReportLineNotify;
use App\Report;
use App\Room;
use App\Services\LogService;
use App\User;
use Illuminate\Http\Request;

class ReportController extends ApiController
{
    public function report(Request $request, User $user)
    {
        $rules = [
            'reported_id' => 'required|numeric|exists:users,id',
            'content' => 'required',
        ];

        $data = array_merge($request->all(), [
            'reported_id' => $request->route('id'),
        ]);

        $validator = validator($data, $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $input = $request->only([
            'content',
        ]);
        $input['reported_id'] = $request->route('id');
        $input['user_id'] = $this->guard()->id();

        $user = $this->guard()->user();
        $reportedId = $input['reported_id'];

        $room = Room::where('type', RoomType::DIRECT)->where(function ($q) use ($user, $reportedId) {
            $q->where('owner_id', $user->id)->whereHas('users', function ($subQuery) use ($reportedId) {
                $subQuery->where('user_id', $reportedId);
            });
        })->orWhere(function ($q) use ($user, $reportedId) {
            $q->where('owner_id', $reportedId)->whereHas('users', function ($subQuery) use ($user) {
                $subQuery->where('user_id', $user->id);
            });
        })->first();

        if (!$room) {
            return $this->respondErrorMessage(trans('messages.room_not_found'), 404);
        }

        $input['room_id'] = $room->id;
        try {
            $report = Report::create($input);
            $delay = now()->addSeconds(3);
            $user->notify(
                (new CreatedReport())->delay($delay)
            );
            $user->notify((new CreateReportLineNotify())->delay($delay));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e->getMessage());

            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('messages.report_success'));
    }
}
