<?php

use App\Cast;
use App\Shift;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableShiftUser extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shift_user', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->integer('shift_id')->unsigned();
            $table->boolean('day_shift')->default(false);
            $table->boolean('night_shift')->default(false);
            $table->boolean('off_shift')->default(false);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('shift_id')->references('id')->on('shifts');
        });


        $shifts = Shift::all();
        Cast::chunk(100, function($users) use ($shifts)
        {
            $today = \Carbon\Carbon::today();
            foreach ($users as $user)
            {
                $bool = false;
                if ($user->working_today) {
                    $bool = true;
                }

                foreach ($shifts as $shift) {
                    $shiftDate = \Carbon\Carbon::parse($shift->date)->startOfDay();
                    if ($bool && $today->eq($shiftDate)) {
                        $user->shifts()->attach($shift->id, ['day_shift' => true]);
                    } else {
                        $user->shifts()->attach($shift->id);
                    }
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('shift_user', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['shift_id']);
        });

        Schema::dropIfExists('shift_user');
    }
}
