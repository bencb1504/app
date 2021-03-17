<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Enums\RoomType;
use App\Enums\Status;
use App\Room;
use Carbon\Carbon;
use Illuminate\Console\Command;

class IncativeChatRoomWhenOrderCanceled extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:inactive_chatroom_when_order_canceled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'When order canceled after 24h then close chatroom (group)';

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
        $today = Carbon::now();

        Room::whereHas('order', function ($query) use ($today) {
            $query->where('canceled_at', '<=', $today->subDays(1))
                ->where(function ($query) {
                    $query->whereIn('status', [OrderStatus::CANCELED, OrderStatus::DENIED]);
                });
        })
            ->where([
                ['type', '=', RoomType::GROUP],
                ['is_active', '=', Status::ACTIVE],
            ])
            ->update(['is_active' => Status::INACTIVE]);
    }
}
