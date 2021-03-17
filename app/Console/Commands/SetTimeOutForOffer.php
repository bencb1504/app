<?php

namespace App\Console\Commands;

use App\Enums\OfferStatus;
use App\Offer;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SetTimeOutForOffer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:set_timeout_for_offer';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'When order offer timeout';

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
        $now = Carbon::now()->second(0);
        $offers = Offer::where('status', OfferStatus::ACTIVE);

        foreach ($offers->cursor() as $offer) {
            $expiredDate = Carbon::parse($offer->expired_date);
            if ($now->gte($expiredDate)) {
                $offer->status = OfferStatus::TIMEOUT;
            }

            $offer->save();
        }
    }
}
