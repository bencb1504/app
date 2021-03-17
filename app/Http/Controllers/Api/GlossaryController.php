<?php

namespace App\Http\Controllers\Api;

use App\BodyType;
use App\Enums\CohabitantType;
use App\Enums\DrinkVolumeType;
use App\Enums\SiblingsType;
use App\Enums\SmokingType;
use App\Enums\UserGender;
use App\Job;
use App\Prefecture;
use App\Salary;

class GlossaryController extends ApiController
{
    public function glossary()
    {
        $drinkVolumes = [];
        $smokings = [];
        $siblings = [];
        $cohabitants = [];
        $genders = [];

        foreach (DrinkVolumeType::toArray() as $value) {
            $drinkVolumes[] = ['id' => $value, 'name' => DrinkVolumeType::getDescription($value)];
        }

        $data['drink_volumes'] = $drinkVolumes;

        foreach (SmokingType::toArray() as $value) {
            $smokings[] = ['id' => $value, 'name' => SmokingType::getDescription($value)];
        }

        $data['smokings'] = $smokings;

        foreach (SiblingsType::toArray() as $value) {
            $siblings[] = ['id' => $value, 'name' => SiblingsType::getDescription($value)];
        }

        $data['siblings'] = $siblings;

        foreach (CohabitantType::toArray() as $value) {
            $cohabitants[] = ['id' => $value, 'name' => CohabitantType::getDescription($value)];
        }

        $data['cohabitants'] = $cohabitants;

        foreach (UserGender::toArray() as $value) {
            $genders[] = ['id' => $value, 'name' => UserGender::getDescription($value)];
        }

        $data['genders'] = $genders;

        $data['prefectures'] = Prefecture::supported()->get(['id', 'name'])->toArray();

        $hometowns = Prefecture::all(['id', 'name']);
        $data['hometowns'] = $hometowns->prepend($hometowns->pull(48))->toArray();

        $data['body_types'] = BodyType::all(['id', 'name'])->toArray();

        $data['salaries'] = Salary::all(['id', 'name'])->toArray();

        $data['jobs'] = Job::all(['id', 'name'])->toArray();

        $data['order_options'] = config('common.order_options');

        $data['payment']['service'] = config('common.payment_service') == 'stripe' || config('common.payment_service') == 'square' ? 'internal' : 'external';

        $data['payment']['url'] = '';

        $data['enable_invite_code_banner'] = true;

        $data['direct_transfer_bank_info'] = [
            'bank_name' => '東京三協信用金庫',
            'branch_name' => '新宿支店（012)',
            'deposit_subject' => '普通',
            'account_number' => '1023474',
            'account_holder' => 'リスティル（カ',
        ];

        if ($token = request()->bearerToken()) {
            $user = auth('api')->setToken($token)->user();

            if ($user) {
                if ($data['payment']['service'] == 'internal') {
                    $data['payment']['url'] = route('webview.create');
                } else {
                    $paramsArray = [
                        'clientip' => env('TELECOM_CREDIT_CLIENT_IP'),
                        'usrtel' => $user->phone,
                        'usrmail' => 'question.cheers@gmail.com',
                        'user_id' => $user->id,
                        'redirect_url' => 'cheers://registerSuccess'
                    ];

                    $queryString = http_build_query($paramsArray);

                    $data['payment']['url'] = env('TELECOM_CREDIT_VERIFICATION_URL') . '?' . $queryString;
                }
            }
        }

        return $this->respondWithData($data);
    }
}
