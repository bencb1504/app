<?php

namespace App\Services;

use App\Services\LogService;
use Stripe\Account;
use Stripe\Balance;
use Stripe\Charge;
use Stripe\CountrySpec;
use Stripe\Customer;
use Stripe\Refund;
use Stripe\Stripe;
use Stripe\Token;
use Stripe\Transfer;

class Payment extends Service
{
    public function __construct()
    {
        $stripeSecretKey = config('services.stripe.secret');

        if (!$stripeSecretKey) {
            throw new \Exception('Stripe secret key not found');
        }

        Stripe::setApiKey($stripeSecretKey);
    }

    public function capture($chargeId, $amount = null)
    {
        $charge = Charge::retrieve($chargeId);

        if (!$amount) {
            return $charge->capture();
        }

        return $charge->capture([
            'amount' => $amount,
        ]);
    }

    public function charge($request)
    {
        $params = [
            'currency' => 'jpy',
            'capture' => true,
        ];

        $params = array_merge($params, $request);

        $charge = Charge::create($params);

        return $charge;
    }

    public function createAccount($request)
    {
        $account = Account::create($request);

        return $account;
    }

    public function createCustomer($request)
    {
        $customer = Customer::create($request);

        return $customer;
    }

    public function createToken($request)
    {
        $token = Token::create($request);

        return $token;
    }

    public function getAccount($accountId)
    {
        $account = Account::retrieve($accountId);

        return $account;
    }

    public function getBalance($accountId = null)
    {
        $request = [];

        if ($accountId) {
            $request['stripe_account'] = $accountId;
        }

        return Balance::retrieve($request);
    }

    public function getCountrySpec($country)
    {
        $spec = CountrySpec::retrieve($country);

        return $spec;
    }

    public function getCustomer($customerId)
    {
        try {
            $customer = Customer::retrieve($customerId);

            return $customer;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function getTransfers($accountId = null)
    {
        $request = [
            'limit' => 10,
        ];

        if ($accountId) {
            $request['destination'] = $accountId;
        }

        return Transfer::all($request);
    }

    public function refund($chargeId, $amount = null)
    {
        $params = [
            'charge' => $chargeId,
        ];

        if ($amount) {
            $params['amount'] = $amount;
        }

        $refund = Refund::create($params);

        return $refund;
    }

    public function setAccountToken($accountId, $token)
    {
        $account = Account::retrieve($accountId);
        $account->account_token = $token;

        return $account->save();
    }

    public function transfer($accountId, $chargeId, $amount)
    {
        $transfer = Transfer::create([
            'amount' => $amount,
            'currency' => 'jpy',
            'destination' => $accountId,
            'source_transaction' => $chargeId,
            // 'transfer_group' => 'ORDER_95',
        ]);

        return $transfer;
    }
}
