<?php

namespace App\Console\Commands;

use App\Cast;
use Illuminate\Console\Command;

class RemindRegisterShifts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:remind_register_shifts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remind casts register shifts';

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
        $casts = Cast::all();

        \Notification::send($casts, new \App\Notifications\RemindRegisterShifts());
    }
}
