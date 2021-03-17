<?php

namespace App\Observers;

use App\Enums\InviteCodeHistoryStatus;
use App\InviteCodeHistory;
use App\Notifications\AddedInvitePoint;

class InviteCodeHistoryObserver
{
    public function updated(InviteCodeHistory $inviteCodeHistory)
    {
        if ($inviteCodeHistory->getOriginal('status') != $inviteCodeHistory->status && $inviteCodeHistory->status == InviteCodeHistoryStatus::RECEIVED) {
            $now = now()->addSeconds(3);
            $userInvite = $inviteCodeHistory->inviteCode->user;
            $userInvite->notify((new AddedInvitePoint())->delay($now));

            $order = $inviteCodeHistory->order;
            $user = $order->user;
            $user->notify((new AddedInvitePoint(true))->delay($now));
        }
    }
}
