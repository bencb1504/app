<?php

namespace App\Console\Commands;

use App\Guest;
use Illuminate\Console\Command;

class SwitchLineIdToLineUserdId extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:switch_line_id';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Switch line_id to line_user_id';

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
        $users = Guest::where('line_id', '<>', null)->get();

        foreach ($users as $user) {
            $lineId = $user->line_id;

            $user->update(['line_user_id' => $lineId]);
        }
    }
}
