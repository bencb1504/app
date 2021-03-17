<?php

use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableShift extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->increments('id');
            $table->date('date');
            $table->timestamps();
        });

        $now = Carbon::now();
        $from = $now->copy();
        $to = $now->copy()->addDays(15);
        $shiftData = [];
        for ($date = $from; $date->lte($to); $date->addDay()) {
            $shiftData[] = ['date' => $date->format('Y-m-d'), 'created_at' => $now, 'updated_at' => $now];
        }

        \DB::table('shifts')->insert($shiftData);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('shifts');
    }
}
