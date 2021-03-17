<?php

namespace App\Http\Controllers\Api;

use App\User;
use App\Enums\Status;
use App\Enums\UserType;
use App\Enums\DeviceType;
use App\Enums\ProviderType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Notifications\SendVerificationCode;
use App\Notifications\VoiceCallVerification;
use App\Notifications\ResendVerificationCode;

class VerificationController extends ApiController
{
    public function code(Request $request)
    {
        $user = $this->guard()->user();

        $rules = [
            'phone' => [
                'phone:' . config('common.phone_number_rule'),
                Rule::unique('users', 'phone')
                    ->whereNull('deleted_at')
                    ->ignore($user->id)
            ],
        ];

        $messages = [
            'phone.unique' => 'この電話番号はすでに別のアカウントで使用されています。',
        ];

        $validator = validator(request()->all(), $rules, $messages);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $phone = $request->phone;
        $verification = $user->generateVerifyCode($phone);

        $user->notify(
            (new SendVerificationCode($verification->id))->delay(now()->addSeconds(2))
        );

        return $this->respondWithNoData(trans('messages.verification_code_sent'));
    }

    public function resend(Request $request)
    {
        $user = $this->guard()->user();
        $verification = $user->verification;

        if (!$verification) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        $newVerification = $user->generateVerifyCode($verification->phone, true);
        $delay = now()->addSeconds(3);
        $user->notify(
            (new ResendVerificationCode($newVerification->id))->delay($delay)
        );

        return $this->respondWithNoData(trans('messages.verification_code_sent'));
    }

    public function sendCodeByCall()
    {
        $user = $this->guard()->user();
        $verification = $user->verification;

        if (!$verification) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        $newVerification = $user->generateVerifyCode($verification->phone, true);
        $delay = now()->addSeconds(3);
        $user->notify((new VoiceCallVerification($newVerification->id))->delay($delay));

        return $this->respondWithNoData(trans('messages.verification_code_sent'));
    }

    public function verify(Request $request)
    {
        $rules = [
            'code' => 'digits:4',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $code = $request->code;
        $user = $this->guard()->user();
        $isVerified = $user->is_verified;
        $verification = $user->verification;

        if (!$verification) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        if ($code != $verification->code) {
            return $this->respondErrorMessage(trans('messages.verification_code_is_wrong'), 400);
        }

        $verification->status = Status::ACTIVE;
        $verification->save();

        $user->phone = $verification->phone;
        $user->is_verified = true;
        $user->status = Status::ACTIVE;
        $user->save();

        if (!$isVerified) {
            if ($request->device_type == DeviceType::IOS) {
                $cast = User::where('type', UserType::CAST)
                    ->where('phone', $verification->phone)
                    ->first();

                if ($cast) {
                    $cast->provider = ProviderType::LINE;
                    $cast->line_user_id = $user->line_user_id;
                    $cast->is_verified = true;
                    $cast->save();

                    $user->delete();

                    $cast = $cast->refresh();

                    $token = JWTAuth::fromUser($cast);

                    return $this->respondWithData([
                        'is_existed' => 1,
                        'data' => $this->respondWithToken($token, $cast)->getData()
                    ]);
                } else {
                    return $this->respondWithData([
                        'is_existed' => 0,
                        'data' => []
                    ]);
                }
            }

            return $this->respondWithNoData(trans('messages.user_verify_success'));
        }

        return $this->respondWithNoData(trans('messages.phone_update_success'));
    }
}
