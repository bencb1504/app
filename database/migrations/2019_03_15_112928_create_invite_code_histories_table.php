<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInviteCodeHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invite_code_histories', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('invite_code_id')->unsigned();
            $table->integer('point');
            $table->integer('receive_user_id')->unsigned();
            $table->integer('order_id')->unsigned()->nullable();
            $table->tinyInteger('status')->default(1);
            $table->timestamps();

            $table->foreign('invite_code_id')->references('id')->on('invite_codes');
            $table->foreign('receive_user_id')->references('id')->on('users');
            $table->foreign('order_id')->references('id')->on('orders');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('invite_code_histories', function (Blueprint $table) {
            $table->dropForeign(['invite_code_id']);
            $table->dropForeign(['receive_user_id']);
            $table->dropForeign(['order_id']);
        });

        Schema::dropIfExists('invite_code_histories');
    }
}
