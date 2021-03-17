<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Resources\CastResource;
use App\Http\Resources\GuestResource;
use App\User;
use Illuminate\Http\Request;

class UserController extends ApiController
{

    public function show(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->respondErrorMessage(trans('messages.user_not_found'), 404);
        }
        if (UserType::CAST == $user->type) {
            return $this->respondWithData(new CastResource($user));
        }
        return $this->respondWithData(new GuestResource($user));
    }
}
