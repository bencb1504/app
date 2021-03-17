<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\TimelineFavoritesResource;
use App\Http\Resources\TimeLineResource;
use App\Notifications\NotifyFavouriteTimeline;
use App\Services\LogService;
use App\TimeLine;
use App\TimeLineFavorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Webpatser\Uuid\Uuid;

class TimeLineController extends ApiController
{
    public function index(Request $request)
    {
        $user = $this->guard()->user();

        $id = $user->id;

        $timeLine = TimeLine::query();

        if ($request->user_id) {
            if ($id == $request->user_id) {
                $timeLine = $timeLine->where('user_id', $id);
            } else {
                $timeLine = $timeLine->where('user_id', $request->user_id)->where('hidden', false);
            }
        } else {
            $timeLine = $timeLine->where('hidden', false)
                ->orWhere(function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
        }

        $perPage = 10;
        if ($request->per_page) {
            $perPage = $request->per_page;
        }

        $timeLine = $timeLine->latest()->paginate($perPage)->appends($request->query());

        return $this->respondWithData(TimeLineResource::collection($timeLine));
    }

    public function show($id)
    {
        $timeline = TimeLine::find($id);
        if (!$timeline) {
            return $this->respondErrorMessage(trans('messages.timeline_not_found'), 404);
        }

        return $this->respondWithData(TimeLineResource::make($timeline));
    }

    public function favorites(Request $request, $id)
    {
        $timeLine = TimeLine::find($id);
        if (!$timeLine) {
            return $this->respondErrorMessage(trans('messages.timeline_not_found'));
        }

        $perPage = 10;
        if ($request->per_page) {
            $perPage = $request->per_page;
        }

        $timelineFavorites = $timeLine->favorites()->latest()->paginate($perPage);

        return $this->respondWithData(TimelineFavoritesResource::collection($timelineFavorites));
    }

    public function create(Request $request)
    {
        $rules = [
            'image' => 'image|mimes:jpeg,png,jpg,gif,svg',
            'location' => 'max:20',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        try {
            $input = [
                'user_id' => $user->id,
                'content' => $request->content,
                'location' => $request->location,
            ];

            if ($request->has('image')) {
                $image = $request->file('image');
                $imageName = Uuid::generate()->string . '.jpg';
                $image = \Image::make($image)->orientate()->encode('jpg', 75);
                $fileUploaded = Storage::put($imageName, $image->__toString(), 'public');

                if ($fileUploaded) {
                    $input['image'] = $imageName;
                }
            }

            $timeLine = TimeLine::create($input);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithData(TimeLineResource::make($timeLine));
    }

    public function updateFavorite($id)
    {
        $timeline = TimeLine::find($id);
        if (!$timeline) {
            return $this->respondErrorMessage(trans('messages.timeline_not_found'), 404);
        }

        $user = $this->guard()->user();

        try {
            $favorite = $timeline->favorites()->where('user_id', $user->id);

            if ($favorite->exists()) {
                $favorite->delete();

                return $this->respondWithData(TimeLineResource::make($timeline));
            } else {
                $favorite = new TimeLineFavorite();
                $favorite->time_line_id = $timeline->id;
                $favorite->user_id = $user->id;
                $favorite->save();
                if ($timeline->user_id != $user->id) {
                    $timeline->user->notify(new NotifyFavouriteTimeline($user, $timeline));
                }
            }
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithData(TimeLineResource::make($timeline));
    }

    public function delete($id)
    {
        $user = $this->guard()->user();
        $timeline = $user->timelines()->find($id);

        if (!$timeline) {
            return $this->respondErrorMessage(trans('messages.timeline_not_found'), 404);
        }

        $timeline->delete();

        return $this->respondWithNoData(trans('messages.timeline_deleted'));
    }
}
