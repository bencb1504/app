<?php

namespace App\Observers;

use App\Enums\OrderStatus;
use App\User;
use App\Order;
use App\Enums\OrderType;
use App\Enums\ProviderType;
use App\Enums\OrderPaymentStatus;
use App\Notifications\CompletedPayment;
use App\Notifications\ApproveNominatedOrders;
use App\Notifications\OrderCreatedLineNotify;
use App\Notifications\CreateOrdersForLineGuest;
use App\Notifications\OrderCreatedNotifyToAdmin;
use App\Notifications\CreateNominatedOrdersForGuest;

class OrderObserver
{
    public function created(Order $order)
    {
        if ($order->status != OrderStatus::OPEN_FOR_GUEST) {
            if (OrderType::NOMINATED_CALL == $order->type || OrderType::CALL == $order->type) {
                if (ProviderType::LINE != $order->user->provider) {
                    $order->user->notify(
                        (new CreateNominatedOrdersForGuest($order->id))->delay(now()->addSeconds(3))
                    );
                }
            }

            if (ProviderType::LINE == $order->user->provider) {
                if (!$order->offer_id) {
                    $order->user->notify(
                        (new CreateOrdersForLineGuest($order->id))->delay(now()->addSeconds(3))
                    );
                }
            }

            $admin = User::find(1);
            $delay = now()->addSeconds(3);
            $admin->notify(
                (new OrderCreatedNotifyToAdmin($order->id))->delay($delay)
            );
            $admin->notify(
                (new OrderCreatedLineNotify($order->id))->delay($delay)
            );
        }
    }

    public function updated(Order $order)
    {
        if ($order->getOriginal('payment_status') != $order->payment_status) {
            if (OrderPaymentStatus::PAYMENT_FINISHED == $order->payment_status) {
                $order->user->notify(new CompletedPayment($order));
            }
        }

        // Order offer created.
        if ($order->getOriginal('room_id') != $order->room_id && $order->offer_id) {
            $users = [$order->user];
            $casts = $order->casts;
            foreach ($casts as $cast) {
                $users[] = $cast;
            }

            \Notification::send(
                $users,
                (new ApproveNominatedOrders($order))->delay(now()->addSeconds(3))
            );
        }
    }
}
