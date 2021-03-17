<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserType;
use App\Http\Resources\CastResource;
use App\Http\Resources\GuestResource;
use App\Rules\CheckHeight;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Webpatser\Uuid\Uuid;

class AuthController extends ApiController
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    public function login()
    {
        $rules = [
            'email' => 'required|email',
            'password' => 'required',
            'type' => 'required|in:1,2',
        ];

        $validator = validator(request()->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        if (6 > strlen(request()->password)) {
            return $this->respondErrorMessage(trans('messages.password_min_invalid'), 400);
        }

        $credentials = request()->only('email', 'password');
        if (($token = $this->guard()->attempt($credentials)) && request('type') == $this->guard()->user()->type) {
            return $this->respondWithData($this->respondWithToken($token, $this->guard()->user())->getData());
        }

        return $this->respondErrorMessage(trans('messages.login_error'));
    }

    public function refresh()
    {
        return $this->respondWithData($this->respondWithToken($this->guard()->refresh(), $this->guard()->user())->getData());
    }

    public function logout()
    {
        $this->guard()->logout();

        return $this->respondWithNoData(trans('messages.logout_success'));
    }

    public function me()
    {
        $user = $this->guard()->user();

        if (UserType::CAST == $user->type) {
            $user = $user->load('bankAccount');

            return $this->respondWithData(CastResource::make($user));
        }

        $user = $user->load('card');

        return $this->respondWithData(GuestResource::make($user));
    }

    public function update(Request $request)
    {
        $user = $this->guard()->user();
        $rules = [
            'nickname' => 'max:20',
            'date_of_birth' => 'date|before:today',
            'gender' => 'in:0,1,2',
            'intro' => 'max:30',
            'description' => 'max:1000',
            'phone' => [
                'sometimes',
                'bail',
                'regex:/^[0-9]+$/',
                'digits_between:10,13',
                Rule::unique('users', 'phone')
                    ->whereNull('deleted_at')
                    ->ignore($user->id)
            ],
            'living_id' => 'numeric|exists:prefectures,id',
            'cost' => 'numeric',
            'salary_id' => 'numeric|exists:salaries,id',
            'height' => ['numeric', new CheckHeight],
            'body_type_id' => 'numeric|exists:body_types,id',
            'hometown_id' => 'numeric|exists:prefectures,id',
            'job_id' => 'numeric|exists:jobs,id',
            'drink_volume_type' => 'numeric|between:0,3',
            'smoking_type' => 'numeric|between:0,3',
            'siblings_type' => 'numeric|between:0,3',
            'cohabitant_type' => 'numeric|between:0,4',
            'front_id_image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'back_id_image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'line_qr' => 'image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'fullname_kana' => 'regex:/^[ぁ-ん ]/u',
            'prefecture_id' => 'numeric|exists:prefectures,id',
        ];

        $messages = [
            'phone.unique' => 'この電話番号はすでに別のアカウントで使用されています。',
        ];

        $validator = validator(request()->all(), $rules, $messages);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        if ($request->post_code) {
            $subject = $request->post_code;
            $count = strlen($subject);

            if ($count < 7) {
                return $this->respondErrorMessage(trans('messages.postcode_invalid'), 400);
            }

            //            $pattern = '/^(1[0-9]|20)\d{1}[-]?\d{4}$/';
            //
            //            if (preg_match($pattern, $subject) == false) {
            //                return $this->respondErrorMessage(trans('messages.postcode_not_support'), 422);
            //            }
        }

        if ($request->date_of_birth) {
            $inputDate = Carbon::parse($request->date_of_birth);
            $max = Carbon::parse(now())->subYear(20);

            if ($inputDate->gt($max)) {
                return $this->respondErrorMessage(trans('messages.date_of_birth_error'), 409);
            }
        }
        $input = request()->only([
            'nickname',
            'date_of_birth',
            'gender',
            'description',
            'intro',
            'phone',
            'living_id',
            'cost',
            'salary_id',
            'height',
            'body_type_id',
            'hometown_id',
            'job_id',
            'drink_volume_type',
            'smoking_type',
            'siblings_type',
            'cohabitant_type',
            'line_id',
            'post_code',
            'address',
            'fullname_kana',
            'fullname',
            'prefecture_id',
            'is_guest_active',
        ]);

        if ($request->invite_code) {
            return $this->respondErrorMessage(trans('messages.friend_invitation_campaign_has_expired'), 405);
            // $checkInviteCode = InviteCode::where('code', $request->invite_code)->first();

            // if (!isset($checkInviteCode)) {
            //     return $this->respondErrorMessage(trans('messages.invite_code_error'), 404);
            // }

            // InviteCodeHistory::create([
            //     'invite_code_id' => $checkInviteCode->id,
            //     'point' => config('common.invite_code_point'),
            //     'receive_user_id' => $user->id,
            // ]);
        }

        try {
            $frontImage = $request->file('front_id_image');
            if ($frontImage) {
                $frontImageName = Uuid::generate()->string . '.' . strtolower($frontImage->getClientOriginalExtension());
                Storage::put($frontImageName, file_get_contents($frontImage), 'public');

                $input['front_id_image'] = $frontImageName;
            }

            $backImage = $request->file('back_id_image');
            if ($backImage) {
                $backImageName = Uuid::generate()->string . '.' . strtolower($backImage->getClientOriginalExtension());
                Storage::put($backImageName, file_get_contents($backImage), 'public');

                $input['back_id_image'] = $backImageName;
            }

            $lineImage = $request->file('line_qr');
            if ($lineImage) {
                $lineImageName = Uuid::generate()->string . '.' . strtolower($lineImage->getClientOriginalExtension());
                Storage::put($lineImageName, file_get_contents($lineImage), 'public');

                $input['line_qr'] = $lineImageName;
            }

            if (isset($input['intro']) && md5($input['intro']) != md5($user->intro)) {
                $input['intro_updated_at'] = now();
            }

            $user->update($input);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }

        if (UserType::CAST == $user->type) {
            return $this->respondWithData(CastResource::make($user));
        }

        return $this->respondWithData(GuestResource::make($user));
    }
}
