<?php

namespace App\Http\Controllers\Api;

use App\User;

class BlockController extends ApiController
{
    public function block($id)
    {
        $user = $this->guard()->user();

        if (!User::find($id)) {
            return $this->respondErrorMessage(trans('messages.user_not_found'), 404);
        }

        if ($user->isBlockedUser($id)) {
            $user->blocks()->detach($id);

            return $this->respondWithNoData(trans('messages.unblock_success'));
        }

        $user->blocks()->attach($id);

        return $this->respondWithNoData(trans('messages.block_success'));
    }
}
