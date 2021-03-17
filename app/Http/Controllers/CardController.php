<?php

namespace App\Http\Controllers;

use App\Card;
use Auth;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $card = $user->card;

        if ($request->session()->has('backUrl')) {
            $request->session()->forget('backUrl');
        }

        $backUrl = \URL::previous();
        $urlCreateOrder = route('guest.orders.confirm');
        $urlPoint = route('purchase.index');
        $urlNominate = route('guest.orders.nominate');

        if (!in_array($backUrl, [$urlCreateOrder, $urlPoint]) && (strpos($backUrl, $urlNominate) === false) && (!preg_match('/history\/\d/', $backUrl)) && (!preg_match('/offers\/\d/', $backUrl))) {
            $backUrl = route('credit_card.index');
        }

        $request->session()->put('backUrl', $backUrl);

        if ($user->is_card_registered) {
            return view('web.cards.index', compact('card'));
        } else {
            return view('web.cards.create');
        }
    }

    public function update()
    {
        $user = Auth::user();
        $card = $user->card;

        return view('web.cards.edit', compact('card'));
    }
}
