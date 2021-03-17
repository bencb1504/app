<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRankSchedulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rank_schedules', function (Blueprint $table) {
            $table->increments('id');
            $table->date('from_date')->nullable();
            $table->date('to_date')->nullable();
            $table->tinyInteger('num_of_attend_platium')->nullable();
            $table->float('num_of_avg_rate_platium')->nullable();
            $table->tinyInteger('num_of_attend_up_platium')->nullable();
            $table->float('num_of_avg_rate_up_platium')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rank_schedules');
    }
}
