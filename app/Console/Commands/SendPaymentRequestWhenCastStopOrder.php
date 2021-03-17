<?php

namespace App\Console\Commands;

use App\Enums\PaymentRequestStatus;
use App\PaymentRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendPaymentRequestWhenCastStopOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:send_payment_request_when_cast_stop_order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send payment request when cast stop order after 24 hour';

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

        $paymentRequests = PaymentRequest::whereHas('order.casts', function ($q) use ($now) {
            $q->whereNotNull('cast_order.stopped_at')
                ->where('cast_order.stopped_at', '<=', $now->subHours(24));
        })
            ->where('status', PaymentRequestStatus::OPEN)->get();

        foreach ($paymentRequests as $paymentRequest) {
            $paymentRequest->status = PaymentRequestStatus::REQUESTED;
            $paymentRequest->save();
        }
    }
}
