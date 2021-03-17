<?php

namespace App\Console\Commands;

use App\Cast;
use App\Shift;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AddNewShift extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cheers:add_shift';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create new shift';

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
        $lastShift = Shift::orderBy('id', 'desc')->first();
        $newShift = Shift::create([
            'date' => Carbon::parse($lastShift->date)->addDay()
        ]);

        Cast::chunk(100, function($users) use ($newShift)
        {
            foreach ($users as $user)
            {
                $user->shifts()->attach($newShift->id);
            }
        });
    }
}
