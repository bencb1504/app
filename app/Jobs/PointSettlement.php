<?php

namespace App\Jobs;

use App\Enums\OrderPaymentStatus;
use App\Enums\PaymentRequestStatus;
use App\Enums\PointType;
use App\Enums\ProviderType;
use App\Enums\UserType;
use App\Notifications\AutoChargeFailed;
use App\Notifications\AutoChargeFailedLineNotify;
use App\Notifications\AutoChargeFailedWorkchatNotify;
use App\Order;
use App\Point;
use App\Services\LogService;
use App\Traits\DirectRoom;
use App\Transfer;
use App\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class PointSettlement implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, DirectRoom;

    public $order;
    public $setPointAdmin;
    /**
     * Create a new job instance.
     *
     * @param $orderId
     */
    public function __construct($orderId, $setPointAdmin = null)
    {
        $this->order = Order::onWriteConnection()->findOrFail($orderId);
        $this->setPointAdmin = $setPointAdmin;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $now = Carbon::now();
        try {
            \DB::beginTransaction();

            if (!$this->setPointAdmin) {
                $this->order->settle();
            } else {
                // Hard delete TEMP point
                Point::withTrashed()
                    ->where('order_id', $this->order->id)
                    ->where('type', PointType::TEMP)
                    ->forceDelete();
            }

            $this->order->paymentRequests()->update(['status' => PaymentRequestStatus::CLOSED]);

            $this->order->payment_status = OrderPaymentStatus::PAYMENT_FINISHED;
            $this->order->paid_at = $now;
            $this->order->update();

            $adminId = User::where('type', UserType::ADMIN)->first()->id;

            $order = $this->order->load('paymentRequests');

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

            if ($e->getMessage() == 'Auto charge failed') {
                if (!in_array($this->order->payment_status, [OrderPaymentStatus::PAYMENT_FINISHED, OrderPaymentStatus::CANCEL_FEE_PAYMENT_FINISHED])) {
                    $user = $this->order->user;
                    $user->suspendPayment();
                    if (!$this->order->send_warning) {
                        $delay = Carbon::now()->addSeconds(3);
                        $user->notify(new AutoChargeFailedWorkchatNotify($this->order));
                        $user->notify((new AutoChargeFailedLineNotify($this->order))->delay($delay));

                        if (ProviderType::LINE == $user->provider) {
                            $this->order->user->notify(new AutoChargeFailed($this->order));
                        }

                        $this->order->send_warning = true;
                        $this->order->payment_status = OrderPaymentStatus::PAYMENT_FAILED;
                        $this->order->save();
                    }
                }
            }

            LogService::writeErrorLog($e);
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
