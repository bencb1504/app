<?php

namespace App\Http\Controllers\Api\Cast;

use App\BankAccount;
use App\Cast;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BankAccountResource;
use App\Services\LogService;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

class BankAccountController extends ApiController
{
    public function create(Request $request)
    {
        $rules = [
            'bank_name' => 'required',
            'number' => 'required',
            'holder_name' => 'required',
            'type' => 'required|in:1,2',
            'bank_code' => 'required',
            'branch_name' => 'required',
            'branch_code' => 'required',
        ];

        $validator = validator($request->all(), $rules);
        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();

        $countAccount = $user->bankAccount()->count();

        if ($countAccount) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        $input = $request->only([
            'bank_name',
            'number',
            'holder_name',
            'type',
            'bank_code',
            'branch_name',
            'branch_code',
        ]);
        try {
            $bankCode = $input['bank_code'];
            $branchName = $input['branch_name'];
            $client = new \GuzzleHttp\Client();
            $res = $client->request('GET', "https://bankcode-api.appspot.com/api/bank/JP/$bankCode?name=$branchName");
            $listResult = collect(json_decode($res->getBody()->getContents())->data);
            if (!$listResult->first()) {
                return $this->respondErrorMessage(trans('messages.data_not_found'));
            }

            $account = $user->bankAccount()->create($input);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }

        return $this->respondWithData(BankAccountResource::make($account));
    }

    public function update(Request $request, $id)
    {
        $cast = Cast::find($this->guard()->user()->id);
        $bankAccount = $cast->bankAccount()->find($id);

        if (!$bankAccount) {
            return $this->respondErrorMessage(trans('messages.account_not_exists'), 404);
        }

        $rules = [
            'bank_name' => 'required',
            'number' => 'required',
            'holder_name' => 'required',
            'type' => 'required|in:1,2',
            'bank_code' => 'required',
            'branch_name' => 'required',
            'branch_code' => 'required',
        ];

        $validator = validator($request->all(), $rules);
        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $input = $request->only([
            'bank_name',
            'number',
            'holder_name',
            'type',
            'bank_code',
            'branch_name',
            'branch_code',
        ]);
        try {
            $bankCode = $input['bank_code'];
            $branchName = $input['branch_name'];
            $client = new \GuzzleHttp\Client();
            $res = $client->request('GET', "https://bankcode-api.appspot.com/api/bank/JP/$bankCode?name=$branchName");
            $listResult = collect(json_decode($res->getBody()->getContents())->data);
            if (!$listResult->first()) {
                return $this->respondErrorMessage(trans('messages.data_not_found'));
            }
            $cast->bankAccount()->update($input);
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);
            return $this->respondServerError();
        }

        return $this->respondWithNoData(trans('messages.update_success'));
    }
}
