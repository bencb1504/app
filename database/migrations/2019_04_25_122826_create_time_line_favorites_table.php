<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTimeLineFavoritesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('time_line_favorites', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('time_line_id')->unsigned();
            $table->integer('user_id')->unsigned();
            $table->timestamps();

            $table->foreign('time_line_id')->references('id')->on('time_lines');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('time_line_favorites', function (Blueprint $table) {
            $table->dropForeign(['time_line_id']);
            $table->dropForeign(['user_id']);
        });
        Schema::dropIfExists('time_line_favorites');
    }
}
