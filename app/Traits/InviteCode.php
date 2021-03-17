<?php

namespace App\Traits;

use App\Enums\InviteCodeHistoryStatus;
use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Enums\PointType;
use App\Order;
use App\Point;

trait InviteCode
{
    public function updateInviteCodeHistory($orderId)
    {
        $order = Order::withTrashed()->find($orderId);
        $user = $order->user;
        $inviteCodeHistory = $user->inviteCodeHistory;
        if ($inviteCodeHistory) {
            if ($inviteCodeHistory->status == InviteCodeHistoryStatus::PENDING && $inviteCodeHistory->order_id == $order->id) {
                $orders = $user->orders()->where('id', '>', $order->id)
                    ->whereIn('status', [
                        OrderStatus::OPEN,
                        OrderStatus::ACTIVE,
                        OrderStatus::DONE
                    ])
                    ->where(function($q) {
                        $q->where('payment_status', null)
                            ->orWhereIn('payment_status', [
                                OrderPaymentStatus::WAITING,
                                OrderPaymentStatus::REQUESTING,
                                OrderPaymentStatus::EDIT_REQUESTING,
                                OrderPaymentStatus::PAYMENT_FINISHED
                            ]);
                    })->get();
                $orderFinished = null;
                $nextOrder = null;
                $counter = 1;
                foreach ($orders as $order) {
                    if ($order->status == OrderStatus::DONE && $order->payment_status == OrderPaymentStatus::PAYMENT_FINISHED) {
                        $orderFinished = $order;
                        break;
                    }

                    if ($counter == 1) {
                        $nextOrder = $order;
                    }
                    $counter++;
                }

                if ($orderFinished) {
                    $userInvite = $inviteCodeHistory->inviteCode->user;
                    $point = new Point;
                    $point->point = $inviteCodeHistory->point;
                    $point->balance = $inviteCodeHistory->point;
                    $point->user_id = $userInvite->id;
                    $point->order_id = $orderFinished->id;
                    $point->type = PointType::INVITE_CODE;
                    $point->invite_code_history_id = $inviteCodeHistory->id;
                    $point->status = true;
                    $point->created_at = now()->addSeconds(3);
                    $point->save();
                    $userInvite->point = $userInvite->point + $inviteCodeHistory->point;
                    $userInvite->save();

                    $point = new Point;
                    $point->point = $inviteCodeHistory->point;
                    $point->balance = $inviteCodeHistory->point;
                    $point->user_id = $user->id;
                    $point->order_id = $orderFinished->id;
                    $point->type = PointType::INVITE_CODE;
                    $point->invite_code_history_id = $inviteCodeHistory->id;
                    $point->status = true;
                    $point->created_at = now()->addSeconds(3);
                    $point->save();
                    $user->point = $user->point + $inviteCodeHistory->point;
                    $user->save();

                    $inviteCodeHistory->status = InviteCodeHistoryStatus::RECEIVED;
                    $inviteCodeHistory->order_id = $orderFinished->id;
                    $inviteCodeHistory->save();
                } else {
                    if ($nextOrder) {
                        $inviteCodeHistory->order_id = $nextOrder->id;
                    } else {
                        $inviteCodeHistory->order_id = null;
                    }

                    $inviteCodeHistory->save();
                }
            }
        }
    }
}
