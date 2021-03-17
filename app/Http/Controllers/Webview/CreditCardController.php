<?php

namespace App\Http\Controllers\Webview;

use App\Card;
use App\Http\Controllers\Controller;
use App\Services\Payment;
use Auth;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use JWTAuth;

class CreditCardController extends Controller
{
    public function create(Request $request)
    {
        try {
            if ($request->has('access_token')) {
                $user = JWTAuth::setToken($request->access_token)->toUser();
                if ($user) {
                    Auth::loginUsingId($user->id);

                    if ($user->is_card_registered) {
                        $card = $user->card;
                        return redirect(route('webview.show', ['card' => $card->id]));
                    } else {
                        return view('webview.create_card');
                    }
                }

                return redirect(route('webview.create'));
            } else {
                return abort(403);
            }
        } catch (\Exception $e) {
            return abort(403);
        }
    }

    public function addCard(Request $request)
    {
        $user = Auth::user();
        $accessToken = JWTAuth::fromUser($user);

        if (config('common.payment_service') == 'square') {
            $client = new Client(['base_uri' => config('common.api_url')]);
            $param = $request->nonce;
            $option = [
                'headers' => ['Authorization' => 'Bearer ' . $accessToken],
                'form_params' => ['token' => $param],
                'allow_redirects' => false,
                'verify' => false,
            ];

            $response = $client->post(route('cards.create'), $option);

            $statusCode = $response->getStatusCode();

            if ($statusCode == 400) {
                return response()->json(['success' => false, 'error' => trans('messages.payment_method_not_supported')]);
            } else {
                if ($statusCode != 200) {
                    return response()->json(['success' => false, 'error' => trans('messages.action_not_performed')]);
                }

                if ($user->card) {
                    $card = $user->card;

                    return response()->json(['success' => true, 'url' => 'cheers://adding_card?result=1']);
                }
            }
        } else {
            $rules = [
                'number_card' => 'required|regex:/[0-9]{0,16}/',
                'month' => 'required|numeric',
                'year' => 'required|numeric',
                'card_cvv' => 'required|regex:/[0-9]{3,4}/',
            ];

            $validator = validator($request->all(), $rules);

            $numberCardVisa = preg_match("/^4[0-9]{12}(?:[0-9]{3})?$/", $request->number_card);
            $numberMasterCard = preg_match("/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/", $request->number_card);
            $numberAmericanExpress = preg_match("/^3[47][0-9]{13,14}$/", $request->number_card);
            $numberDinnersClub = preg_match("/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/", $request->number_card);
            $numberJcb = preg_match("/^(?:2131|1800|35\\d{3})\\d{11}$/", $request->number_card);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'error' => trans('messages.action_not_performed')]);
            }
            $currentMonth = Carbon::now()->format('m');
            $currentYear = Carbon::now()->format('Y');

            if ($currentMonth > $request->month && $currentYear > $request->year) {
                return response()->json(['success' => false, 'error' => trans('messages.action_not_performed')]);
            }

            if ($numberCardVisa || $numberMasterCard || $numberAmericanExpress || $numberDinnersClub || $numberJcb) {
                $input = request()->only([
                    'number_card',
                    'month',
                    'year',
                    'card_cvv',
                ]);
                try {
                    $response = $this->createToken($input, $accessToken);
                    if (false == $response) {
                        return response()->json(['success' => false, 'error' => trans('messages.payment_method_not_supported')]);
                    } else {
                        if ($response->getStatusCode() != 200) {
                            return response()->json(['success' => false, 'error' => trans('messages.action_not_performed')]);
                        }
                        if ($user->card) {
                            $card = $user->card;

                            return response()->json(['success' => true, 'url' => 'cheers://adding_card?result=1']);
                        }
                    }
                } catch (\Exception $e) {
                    return response()->json(['success' => false, 'error' => trans('messages.action_not_performed')]);
                }
            } else {
                return response()->json(['success' => false, 'error' => trans('messages.action_not_performed')]);
            }

        }
    }

    public function show(Card $card)
    {
        return view('webview.show', compact('card'));
    }

    public function edit(Request $request, Card $card)
    {
        return view('webview.edit', compact('card'));
    }

    private function createToken($input, $accessToken)
    {
        $cardService = new Payment();

        $card = $cardService->createToken([
            "card" => [
                "number" => $input['number_card'],
                "exp_month" => $input['month'],
                "exp_year" => $input['year'],
                "cvc" => $input['card_cvv'],
            ],
        ]);

        if (in_array($card->card->funding, ['debit', 'prepaid'])) {
            return false;
        } else {
            $param = $card->id;

            $client = new Client(['base_uri' => config('common.api_url')]);
            $option = [
                'headers' => ['Authorization' => 'Bearer ' . $accessToken],
                'form_params' => ['token' => $param],
                'allow_redirects' => false,
            ];

            $response = $client->post(route('cards.create'), $option);

            return $response;
        }
    }
}
