<?php

namespace App\Console\Commands;

use DB;
use App\User;
use App\Point;
use Carbon\Carbon;
use App\Enums\UserType;
use App\Enums\PointType;
use App\Services\LogService;
use Illuminate\Console\Command;

class DeleteUnusedPointAfter180Days extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:delete_unused_point_after_180_days';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete unused point after 180 days';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $dateTime = Carbon::now()->subDays(180)->format('Y-m-d H');
        $points = Point::whereHas('user', function ($query) {
            $query->where('users.type', UserType::GUEST);
        })->where(function ($query) {
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
            ->where(\DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d %H") '), '<=', $dateTime)
            ->where('balance', '>', 0);

        try {
            foreach ($points->cursor() as $point) {
                DB::beginTransaction();

                $balancePoint = $point->balance;
                $data = [
                    'point' => -$balancePoint,
                    'balance' => $point->user ? ($point->user->point - $balancePoint) : 0,
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

                if ($point->user) {
                    $user = User::withTrashed()->find($point->user->id);
                    $user->point -= $balancePoint;
                    $user->save();

                    // Update points after subtracting expired points
                    $subPoint = $data['point'];
                    $pointsNeedUpdates = Point::where('user_id', $user->id)
                        ->where('balance', '>', 0)
                        ->where(function ($query) {
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
                        ->orderBy('created_at')
                        ->get();

                    foreach ($pointsNeedUpdates as $value) {
                        if (0 == $subPoint) {
                            break;
                        } elseif ($value->balance > $subPoint && $subPoint > 0) {
                            $value->balance = $value->balance - $subPoint;
                            $value->update();

                            break;
                        } elseif ($value->balance <= $subPoint) {
                            $subPoint -= $value->balance;

                            $value->balance = 0;
                            $value->update();
                        }
                    }
                }

                DB::commit();
            }
        } catch (\Exception $e) {
            DB::rollBack();
            LogService::writeErrorLog($e);
        }
    }
}
