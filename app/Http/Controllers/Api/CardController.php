<?php

namespace App\Http\Controllers\Api;

use App\Card;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CardResource;
use App\Services\LogService;
use App\Services\Square as Payment;
use App\User;
use Illuminate\Http\Request;

class CardController extends ApiController
{
    protected $payment;

    public function __construct()
    {
        $this->payment = new Payment;
    }

    public function create(Request $request)
    {
        $rules = [
            'token' => 'required',
        ];

        $validator = validator($request->all(), $rules);

        if ($validator->fails()) {
            return $this->respondWithValidationError($validator->errors()->messages());
        }

        $user = $this->guard()->user();
        $paymentService = config('common.payment_service');

        try {
            if (!$user->payment_id) {
                $customer = $this->createCustomer($user);
            } else {
                $customerId = $user->payment_id;

                $customer = $this->payment->getCustomer($customerId);

                if (!$customer) {
                    $customer = $this->createCustomer($user);
                }
            }

            $card = $this->payment->createCustomerCard($customer->id, ['source' => $request->token]);

            // Square doesn't know what kind of card funding
            if ($paymentService == 'stripe' && in_array($card->funding, ['debit', 'prepaid'])) {
                return $this->respondErrorMessage(trans('messages.payment_method_not_supported'));
            }

            if (!in_array(strtoupper($card->brand), Card::BRANDS)) {
                // $customer->sources->retrieve($card->id)->delete();
                return $this->respondErrorMessage(trans('messages.payment_method_not_supported'));
            }

            // $customer->default_source = $card->id;
            // $customer->save();

            $user->cards()->delete();

            $cardAttributes = [
                'card_id' => $card->id,
                'brand' => $card->brand,
                'exp_month' => $card->exp_month,
                'exp_year' => $card->exp_year,
                'fingerprint' => $card->fingerprint,
                'last4' => $card->last4,
                'name' => $card->name,
                'is_default' => true,
                'service' => $paymentService,
            ];

            $card = $user->cards()->create($cardAttributes);

            if ($user->payment_suspended) {
                $user->payment_suspended = false;
                $user->save();
            }

            return $this->respondWithData(CardResource::make($card));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    public function destroy($id)
    {
        $user = $this->guard()->user();
        $card = $user->cards()->find($id);

        if (!$card) {
            return $this->respondErrorMessage(trans('messages.action_not_performed'), 422);
        }

        try {
            $customerId = $user->payment_id;
            $customer = $this->payment->getCustomer($customerId);

            // $customer->sources->retrieve($card->card_id)->delete();

            $card->delete();

            return $this->respondWithNoData(trans('messages.card_delete_success'));
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return $this->respondServerError();
        }
    }

    public function index()
    {
        $user = $this->guard()->user();

        $cards = $user->cards()
            ->orderBy('is_default', 'DESC')
            ->orderBy('created_at', 'DESC')
            ->get();

        return $this->respondWithData(CardResource::collection($cards));
    }

    protected function createCustomer(User $user)
    {
        $attributes = [
            'description' => $user->id,
            'nickname' => $user->nickname,
            'email' => $user->email,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'phone' => $user->phone,
        ];

        $customer = $this->payment->createCustomer($attributes);

        if (!$customer) {
            return false;
        }

        $user->payment_id = $customer->id;
        $user->save();

        return $customer;
    }
}
