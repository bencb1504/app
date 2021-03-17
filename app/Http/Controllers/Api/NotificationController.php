<?php

namespace App\Http\Controllers\Api;

use App\Cast;
use App\Enums\UserType;
use App\Http\Resources\NotificationResource;
use App\Services\LogService;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function show($id)
    {
        $user = $this->guard()->user();
        if (UserType::CAST == $user->type) {
            $user = Cast::find($user->id);
        }

        $notify = $user->notifications()->find($id);

        if (!$notify) {
            return $this->respondErrorMessage(trans('messages.notify_not_found'), 404);
        }

        try {
            if (!$notify->read_at) {
                $notify->markAsRead();
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithData(NotificationResource::make($notify));
    }

    public function index(Request $request)
    {
        $rules = [
            'per_page' => 'numeric|min:1',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();
        if (UserType::CAST == $user->type) {
            $user = Cast::find($user->id);
        }

        $notifications = $user->notifications()->latest()->paginate($request->per_page)
            ->appends($request->query());

        return $this->respondWithData(NotificationResource::collection($notifications));
    }
}
