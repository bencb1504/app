<?php

namespace App\Console\Commands;

use App\Enums\OrderPaymentMethod;
use App\Enums\OrderPaymentStatus;
use App\Enums\PaymentRequestStatus;
use App\Enums\PointType;
use App\Enums\ProviderType;
use App\Enums\UserType;
use App\Jobs\PointSettlement;
use App\Notifications\AutoChargeFailed;
use App\Notifications\AutoChargeFailedLineNotify;
use App\Notifications\AutoChargeFailedWorkchatNotify;
use App\Notifications\OrderDirectTransferChargeFailed;
use App\Order;
use App\Point;
use App\Services\LogService;
use App\Transfer;
use App\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class PointSettlementSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:point_settlement';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Point settlement';

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
        $now = Carbon::now();

        $orders = Order::where(function ($query) {
            $query->where('payment_status', OrderPaymentStatus::REQUESTING)
                ->orWhere('payment_status', OrderPaymentStatus::PAYMENT_FAILED);
        })
            ->where('payment_requested_at', '<=', $now->copy()->subHours(3))
            ->where(function($query) {
                $query->whereNull('send_warning')
                    ->orWhere(function($subQuery) {
                        $subQuery->whereNull('send_warning')
                            ->where('payment_method', OrderPaymentMethod::DIRECT_PAYMENT);
                    });
            })
            ->get();

        foreach ($orders as $order) {
            if (!$order->user->trashed()) {
                if ($order->payment_method == OrderPaymentMethod::DIRECT_PAYMENT) {
                    $user = $order->user;
                    $totalPoint = $order->total_point;
                    if ($order->coupon_id) {
                        $totalPoint = $order->total_point - $order->discount_point;
                    }
                    if ($totalPoint < 0) {
                        $totalPoint = 0;
                    }

                    if ($user->point > $totalPoint) {
                        try {
                            \DB::beginTransaction();
                            $order->settle();

                            $order->paymentRequests()->update(['status' => PaymentRequestStatus::CLOSED]);

                            $order->payment_status = OrderPaymentStatus::PAYMENT_FINISHED;
                            $order->paid_at = $now;
                            $order->update();

                            $adminId = User::where('type', UserType::ADMIN)->first()->id;

                            $order = $order->load('paymentRequests');

                            $paymentRequests = $order->paymentRequests;

                            $receiveAdmin = 0;

                            foreach ($paymentRequests as $paymentRequest) {
                                $cast = $paymentRequest->cast;

                                $receiveCast = round($paymentRequest->total_point * $cast->cost_rate);
                                $receiveAdmin += round($paymentRequest->total_point * (1 - $cast->cost_rate));

                                $this->createTransfer($order, $paymentRequest, $receiveCast);

                                // receive cast
                                $this->createPoint($receiveCast, $paymentRequest->cast_id, $order);
                            }

                            // receive admin
                            $this->createPoint($receiveAdmin, $adminId, $order);
                            \DB::commit();
                        } catch (\Exception $e) {
                            \DB::rollBack();
                            LogService::writeErrorLog($e);
                        }
                    } else {
                        if (!$order->send_warning) {
                            $delay = Carbon::now()->addSeconds(3);
                            $user->notify(new AutoChargeFailedWorkchatNotify($order));
                            $user->notify((new AutoChargeFailedLineNotify($order))->delay($delay));

                            $user->notify(new OrderDirectTransferChargeFailed($order, ($totalPoint - $user->point)));

                            $order->send_warning = true;
                            $order->payment_status = OrderPaymentStatus::PAYMENT_FAILED;
                            $order->save();
                        } else {
                            if ($order->payment_status != OrderPaymentStatus::PAYMENT_FAILED) {
                                $order->payment_status = OrderPaymentStatus::PAYMENT_FAILED;
                                $order->save();
                            }
                        }
                    }
                } else {
                    PointSettlement::dispatchNow($order->id);
                }
            }
        }
    }

    private function createTransfer($order, $paymentRequest, $receiveCast)
    {
        $transfer = new Transfer;
        $transfer->order_id = $order->id;
        $transfer->user_id = $paymentRequest->cast_id;
        $transfer->amount = $receiveCast;
        $transfer->save();
    }

    private function createPoint($receive, $id, $order)
    {
        $user = User::withTrashed()->find($id);

        $point = new Point;
        $point->point = $receive;
        $point->balance = $user->point + $receive;
        $point->user_id = $user->id;
        $point->order_id = $order->id;
        $point->type = PointType::RECEIVE;
        $point->status = true;
        $point->save();

        $user->point += $receive;
        $user->update();
    }
}
