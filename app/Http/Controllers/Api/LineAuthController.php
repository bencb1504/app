<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeviceType;
use App\Enums\ProviderType;
use App\Enums\Status;
use App\Enums\UserType;
use App\Notifications\CreateGuest;
use App\Services\LogService;
use App\User;
use Illuminate\Http\Request;
use Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;

class LineAuthController extends ApiController
{
    public function login(Request $request)
    {
        $validator = validator($request->all(), [
            'access_token' => 'required',
            'device_type' => 'integer|min:1|max:3',
        ]);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $token = $request->access_token;

        try {
            $line = Socialite::driver('line')
                ->stateless()
                ->userFromToken($token);
            $user = $this->findOrCreate($line, $request->device_type);

            $token = JWTAuth::fromUser($user);

            return $this->respondWithData($this->respondWithToken($token, $user)->getData());
        } catch (\Exception $e) {
            if ($e->getCode() == 400) {
                return $this->respondErrorMessage(trans('messages.line_invalid_token'), $e->getCode());
            }
            
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }
    }

    protected function findOrCreate($lineResponse, $deviceType = null)
    {
        $user = User::where('line_user_id', $lineResponse->id)->where('provider', ProviderType::LINE)->first();

        if (!$user) {
            $data = [
                'email' => (isset($lineResponse->email)) ? $lineResponse->email : null,
                'fullname' => $lineResponse->name,
                'nickname' => ($lineResponse->nickname) ? $lineResponse->nickname : $lineResponse->name,
                'line_user_id' => $lineResponse->id,
                'cost' => config('common.cost_default'),
                'type' => UserType::GUEST,
                'status' => Status::INACTIVE,
                'provider' => ProviderType::LINE,
                'device_type' => ($deviceType) ? $deviceType : DeviceType::WEB,
            ];

            $user = User::create($data);

            if ($lineResponse->avatar) {
                $user->avatars()->create([
                    'path' => $lineResponse->avatar,
                    'thumbnail' => $lineResponse->avatar,
                    'is_default' => true,
                ]);
            }

            $user->notify(
                (new CreateGuest())->delay(now()->addSeconds(3))
            );

            return $user;
        }

        $user->device_type = ($deviceType) ? $deviceType : DeviceType::WEB;
        $user->save();

        return $user;
    }
}
