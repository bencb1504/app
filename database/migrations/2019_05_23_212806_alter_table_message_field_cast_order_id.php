<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableMessageFieldCastOrderId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('messages', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->integer('cast_order_id')->after('order_id')->unsigned()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('messages', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->dropColumn('cast_order_id');
        });
    }
}
