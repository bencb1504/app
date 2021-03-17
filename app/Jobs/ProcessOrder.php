<?php

namespace App\Jobs;

use App\Notifications\StartOrder;
use App\Order;
use App\Enums\OrderStatus;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order;
    protected $cast;

    /**
     * Create a new job instance.
     *
     * @param $orderId
     * @param null $cast
     */
    public function __construct($orderId, $cast = null)
    {
        $this->order = Order::onWriteConnection()->findOrFail($orderId);
        $this->cast = $cast;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->order->status == OrderStatus::ACTIVE) {
            $startedCasts = $this->order->casts()->whereNotNull('started_at')->exists();

            if ($startedCasts) {
                $this->order->status = OrderStatus::PROCESSING;
                $this->order->actual_started_at = now();
                $this->order->save();
            }
        }

        if ($this->cast) {
            $this->order->user->notify(new StartOrder($this->order, $this->cast));
        }
    }
}
