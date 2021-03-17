<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Resources\CastResource;
use App\Http\Resources\GuestResource;
use Auth;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ApiController extends Controller
{
    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token, $user)
    {
        if (UserType::GUEST == $user->type) {
            $userResource = GuestResource::make($user);
        } else {
            $userResource = CastResource::make($user);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $this->guard()->factory()->getTTL() * 60,
            'user' => $userResource,
        ]);
    }

    /**
     * Get the guard to be used during authentication.
     *
     * @return \Illuminate\Contracts\Auth\Guard
     */
    public function guard()
    {
        return Auth::guard('api');
    }

    protected function respondWithValidationError(array $errors)
    {
        return response()->json([
            'status' => false,
            'error' => $errors,
        ], 400);
    }

    protected function respondServerError()
    {
        return response()->json([
            'status' => false,
            'error' => trans('messages.server_error'),
        ], 500);
    }

    protected function respondErrorMessage($message, $statusCode = 400)
    {
        return response()->json([
            'status' => false,
            'error' => $message,
        ], $statusCode);
    }

    protected function respondWithData($data)
    {
        if ($data instanceof AnonymousResourceCollection) {
            $data = $data->resource;
        }

        return response()->json([
            'status' => true,
            'data' => $data,
        ]);
    }

    protected function respondWithNoData($message)
    {
        return response()->json([
            'status' => true,
            'data' => [],
            'message' => $message,
        ]);
    }
}
