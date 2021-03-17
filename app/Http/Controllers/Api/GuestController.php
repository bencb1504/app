<?php

namespace App\Http\Controllers\Api;

use App\Guest;
use App\Http\Resources\GuestResource;
use Illuminate\Http\Request;

class GuestController extends ApiController
{
    public function index(Request $request)
    {
        $rules = [
            'per_page' => 'numeric|min:1',
            'favorited' => 'boolean',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();
        if (!$user->status) {
            return $this->respondErrorMessage(trans('messages.freezing_account'), 403);
        }

        $guests = Guest::orderBy('last_active_at', 'DESC');

        if ($request->favorited) {
            $guests->whereHas('favoriters', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });
        }

        if ($request->prefecture_id) {
            $guests->where('prefecture_id', $request->prefecture_id);
        }

        if ($request->salary_id) {
            $guests->where('salary_id', $request->salary_id);
        }

        if ($request->age) {
            $rangeAge = explode('-', $request->age);
            $min = $rangeAge[0];
            $max = $rangeAge[1];
            $guests->whereRaw( 'timestampdiff(year, date_of_birth, curdate()) between ? and ?', [$min, $max]);
        }

        $guests = $guests->latest()->active()->WhereDoesntHave('blockers', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->WhereDoesntHave('blocks', function ($q) use ($user) {
            $q->where('blocked_id', $user->id);
        })->paginate($request->per_page)->appends($request->query());

        return $this->respondWithData(GuestResource::collection($guests));
    }
}
