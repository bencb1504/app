<?php

namespace App\Console\Commands;

use App\Enums\CastOrderStatus;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DeleteCastCanceledOrderSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:delete_cast_canceled_order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete casts canceled orders';

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

        \DB::table('cast_order')->whereNull('deleted_at')
            ->whereIn('status', [
                CastOrderStatus::DENIED,
                CastOrderStatus::CANCELED,
                CastOrderStatus::TIMEOUT,
            ])
            ->where('canceled_at', '<', $today->subDays(1))
            ->update(['deleted_at' => $today]);
    }
}
