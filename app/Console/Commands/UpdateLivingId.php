<?php

namespace App\Console\Commands;

use App\User;
use Illuminate\Console\Command;

class UpdateLivingId extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:update_living_id';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Transfer prefecture id to living_id';

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
        $users = User::all();

        foreach ($users as $user) {
            if ($user->prefecture_id) {
                $user->living_id = $user->prefecture_id;
                $user->save();
            }
        }
    }
}
