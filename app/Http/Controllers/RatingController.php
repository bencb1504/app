<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Order;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function index(Request $request)
    {
        $order = Order::where('status', OrderStatus::DONE)->find($request->order_id);
        if (!$order) {
            return redirect()->back();
        }

        $castUnrate = $order->casts()->wherePivot('guest_rated', false)->orderBy('cast_order.id', 'ASC')->first();
        if (!$castUnrate) {
            return redirect()->route('history.show', ['orderId' => $order->id]);
        }

        $totalRated = 1;
        if ($order->total_cast > 1) {
            $casts = $order->casts;
            foreach ($casts as $cast) {
                if ($cast->pivot->guest_rated) {
                    $totalRated++;
                }
            }
        } else {
            $totalRated = -1;
        }

        $nextCast = $order->casts()->wherePivot('id', '>', $castUnrate->pivot->id)->wherePivot('guest_rated', false)
            ->first();

        return view('web.ratings.index', compact(['order', 'castUnrate', 'totalRated', 'nextCast']));
    }
}
