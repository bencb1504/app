<?php

namespace App\Traits;

use App\Enums\PointType;
use App\Point;
use App\Services\LogService;
use App\User;
use Carbon\Carbon;
use App\Enums\ResignStatus;
use App\Enums\Status;
use App\Enums\UserType;

trait DeleteUser
{
    public function deleteUser($user)
    {
        try {
            \DB::beginTransaction();
            $cards = $user->cards;
            $avatars = $user->avatars;
            $bankAccount = $user->bankAccount;

            $this->removePoint($user);
            if ($user->type == UserType::CAST) {
                $shifts = $user->shifts;

                if($shifts->first()) {
                    $user->shifts()->detach();
                }
            }

            if($avatars->first()) {
                foreach ($avatars as $avatar) {
                    $avatar->delete();
                }
            }

            if($cards->first()) {
                foreach ($cards as $card) {
                    $card->delete();
                }
            }

            if($bankAccount) {
                $bankAccount->delete();
            }
            $user->facebook_id = null;
            $user->line_id = null;
            $user->line_user_id = null;
            $user->line_qr = null;
            $user->provider = null;
            $user->email = null;
            $user->password = null;
            $user->front_id_image = null;
            $user->back_id_image = null;
            $user->phone = null;
            $user->gender = null;
            $user->date_of_birth = null;
            $user->height = null;
            $user->salary_id = null;
            $user->body_type_id = null;
            $user->prefecture_id = null;
            $user->living_id = null;
            $user->post_code = null;
            $user->address = null;
            $user->hometown_id = null;
            $user->job_id = null;
            $user->drink_volume_type = null;
            $user->smoking_type = null;
            $user->siblings_type = null;
            $user->cohabitant_type = null;
            $user->intro = null;
            $user->intro_updated_at = null;
            $user->description = null;
            $user->note = null;
            $user->device_type = null;
            $user->request_transfer_date = null;
            $user->accept_request_transfer_date = null;
            $user->accept_verified_step_one_date = null;
            $user->status = Status::INACTIVE;
            $user->is_verified = 0;
            $user->is_guest_active = null;
            $user->cost = null;
            $user->working_today = null;
            $user->class_id = null;
            $user->stripe_id = null;
            $user->square_id = null;
            $user->tc_send_id = null;
            $user->is_online = null;
            $user->last_active_at = null;
            $user->payment_suspended = null;
            $user->campaign_participated = null;
            $user->is_multi_payment_method = null;
            $user->resign_status = ResignStatus::APPROVED;
            $user->resign_date = Carbon::now();

            $user->save();
            $user->delete();
            \DB::commit();
        } catch (\Exception $e) {
            \DB::rollBack();
            LogService::writeErrorLog($e);
        }

    }

    public function removePoint($user)
    {
        $points = Point::where(function ($query) {
            $query->whereIn('type',
                [
                    PointType::BUY,
                    PointType::AUTO_CHARGE,
                    PointType::INVITE_CODE, 
                    PointType::DIRECT_TRANSFER,
                ])
                ->orWhere(function ($subQ) {
                    $subQ->where('type', PointType::ADJUSTED)
                        ->where('is_cast_adjusted', false)
                        ->where('point', '>=', 0);
                });
            })
            ->where('user_id', $user->id)
            ->where('balance', '>', 0);
        
        foreach ($points->cursor() as $point) {
            $balancePoint = $point->balance;
            $data = [
                'point' => -$balancePoint,
                'balance' => $point->user->point - $balancePoint,
                'user_id' => $point->user_id,
                'type' => PointType::EVICT,
            ];

            if ($point->invite_code_history_id) {
                $data['invite_code_history_id'] = $point->invite_code_history_id;
            }

            if ($point->order_id) {
                $data['order_id'] = $point->order_id;
            }

            $pointUnused = new Point;
            $pointUnused->createPoint($data, true);

            $admin = User::find(1);
            if ($admin->is_admin) {
                $data['user_id'] = 1;
                $data['type'] = PointType::RECEIVE;
                $data['point'] = $point->balance;
                $data['balance'] = $admin->point + $balancePoint;

                $pointAdmin = new Point;
                $pointAdmin->createPoint($data, true);

                $admin->point += $balancePoint;

                $admin->save();
            }

            $point->balance = 0;
            $point->save();

            $user = User::withTrashed()->find($point->user->id);
            $user->point -= $balancePoint;
            $user->save();
        }
    }
}
