<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeviceType;
use App\Enums\ProviderType;
use App\Enums\Status;
use App\Enums\UserGender;
use App\Enums\UserType;
use App\Notifications\CreateGuest;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;

class FacebookAuthController extends ApiController
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
            $fbResponse = Socialite::driver('facebook')
                ->fields([
                    'email', 'name', 'first_name', 'last_name', 'gender',
                    'picture.width(400).height(400)', 'age_range', 'birthday', 'location',
                    'link'
                ])->stateless()
                ->userFromToken($token);

            $avatar = $fbResponse->avatar;
            $pos = strpos($avatar, 'asid=');

            if ($pos !== false) {
                $asid = explode('&', substr($avatar, $pos))[0];
                $asid = substr($asid, 5);
                $avatar = env('FACEBOOK_GRAP_API_URL') . '/' . $asid . '/picture?type=normal&height=400&width=400';
            }

            $user = $this->findOrCreate($fbResponse->user, $avatar, $request->device_type);

            $token = JWTAuth::fromUser($user);

            return $this->respondWithData($this->respondWithToken($token, $user)->getData());
        } catch (\Exception $e) {
            if ($e->getCode() == 400) {
                return $this->respondErrorMessage(trans('messages.facebook_invalid_token'), $e->getCode());
            };
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }
    }

    protected function findOrCreate($fbResponse, $avatar, $deviceType = null)
    {
        $email = (isset($fbResponse['email'])) ? $fbResponse['email'] : null;
        $user = User::where('facebook_id', $fbResponse['id'])->where('provider', ProviderType::FACEBOOK)->first();

        if (!$user) {
            $data = [
                'email' => $email,
                'fullname' => $fbResponse['name'],
                'nickname' => (isset($fbResponse['first_name'])) ? $fbResponse['first_name'] : '',
                'facebook_id' => $fbResponse['id'],
                'date_of_birth' => (isset($fbResponse['birthday'])) ? Carbon::parse($fbResponse['birthday']) : null,
                'gender' => (isset($fbResponse['gender'])) ? ($fbResponse['gender'] == 'male') ? UserGender::MALE : UserGender::FEMALE : null,
                'cost' => config('common.cost_default'),
                'type' => UserType::GUEST,
                'status' => Status::INACTIVE,
                'provider' => ProviderType::FACEBOOK,
                'device_type' => ($deviceType) ? $deviceType : DeviceType::WEB
            ];

            $user = User::create($data);

            if ($avatar) {
                $user->avatars()->create([
                    'path' => "$avatar&height=400&width=400",
                    'thumbnail' => "$avatar&height=400&width=400",
                    'is_default' => true
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
