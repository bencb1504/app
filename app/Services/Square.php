<?php

namespace App\Services;

use App\Services\LogService;
use SquareConnect\Model\Money;
use SquareConnect\Configuration;
use SquareConnect\Api\CustomersApi;
use SquareConnect\Api\TransactionsApi;
use SquareConnect\Model\ChargeRequest;
use SquareConnect\Model\CreateCustomerRequest;
use SquareConnect\Model\CreateCustomerCardRequest;

class Square extends Service
{
    public function __construct()
    {
        $accessToken = config('services.square.access_token');

        if (!$accessToken) {
            throw new \Exception('Square access token not found');
        }

        Configuration::getDefaultConfiguration()->setAccessToken($accessToken);
    }

    public function createCustomer($request)
    {
        $apiInstance = new CustomersApi();

        $params = [
            'note' => 'User ' . $request['description'],
            'given_name' => $request['firstname'],
            'family_name' => $request['lastname'],
        ];

        $flag = false;

        if ($request['email']) {
            $params['email_address'] = $request['email'];
            $flag = true;
        }

        if ($request['phone']) {
            $params['phone_number'] = $request['phone'];
            $flag = true;
        }

        if (!$params['given_name']) {
            $params['given_name'] = $request['nickname'];
            $flag = true;
        }

        if (!$flag && !$params['given_name'] && !$params['family_name']) {
            $params['given_name'] = 'User ' . $request['description'];
        }

        logger($params);

        $params = array_merge($params, $request);

        try {
            $body = new CreateCustomerRequest($params);

            $result = $apiInstance->createCustomer($body);

            if (!$result->getErrors()) {
                $customer = $result->getCustomer();

                $response = [
                    'id' => $customer->getId(),
                ];

                return (object) $response;
            }

            LogService::writeErrorLog($result->getErrors());

            return false;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function getCustomer($customerId)
    {
        try {
            $apiInstance = new CustomersApi();

            $result = $apiInstance->retrieveCustomer($customerId);

            if (!$result->getErrors()) {
                $customer = $result->getCustomer();

                $response = [
                    'id' => $customer->getId(),
                ];

                return (object) $response;
            }

            LogService::writeErrorLog($result->getErrors());

            return false;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function createCustomerCard($customerId, $request)
    {
        $apiInstance = new CustomersApi();

        $params = [
            'card_nonce' => $request['source']
        ];

        $body = new CreateCustomerCardRequest($params);

        try {
            $result = $apiInstance->createCustomerCard($customerId, $body);

            if (!$result->getErrors()) {
                $card = $result->getCard();

                $response = [
                    'id' => $card->getId(),
                    'brand' => $card->getCardBrand(),
                    'last4' => $card->getLast4(),
                    'exp_month' => $card->getExpMonth(),
                    'exp_year' => $card->getExpYear(),
                    'name' => $card->getCardholderName(),
                    'billing_address' => $card->getBillingAddress(),
                    'fingerprint' => $card->getFingerprint(),
                ];

                return (object) $response;
            }

            LogService::writeErrorLog($result->getErrors());

            return false;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }

    public function charge($customerId, $request)
    {
        $apiInstance = new TransactionsApi();
        $locationId = config('services.square.location_id');

        $amountMoney = new Money([
            'amount' => (int) $request['amount'],
            'currency' => 'JPY',
        ]);

        $params = [
            'customer_id' => $customerId,
            'customer_card_id' => $request['card_id'],
            'note' => 'Payment ID: ' . $request['payment_id'],
            'delay_capture' => false,
            'idempotency_key' => uniqid() . $request['payment_id']
        ];

        $params['amount_money'] = $amountMoney;

        if ($request['email']) {
            $params['buyer_email_address'] = $request['email'];
        }

        $body = new ChargeRequest($params);

        try {
            $result = $apiInstance->charge($locationId, $body);

            if (!$result->getErrors()) {
                $transaction = $result->getTransaction();

                $response = [
                    'id' => $transaction->getId(),
                    'location_id' => $transaction->getLocationId(),
                    'created_at' => $transaction->getCreatedAt(),
                ];

                return (object) $response;
            }

            LogService::writeErrorLog($result->getErrors());

            return false;
        } catch (\Exception $e) {
            LogService::writeErrorLog($e);

            return false;
        }
    }
}
