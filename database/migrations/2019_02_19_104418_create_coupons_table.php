<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCouponsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 255)->nullable();
            $table->tinyInteger('type')->nullable();
            $table->integer('point')->nullable();
            $table->float('time')->nullable();
            $table->text('note')->nullable();
            $table->boolean('is_filter_after_created_date')->default(false);
            $table->tinyInteger('filter_after_created_date')->nullable();
            $table->boolean('is_filter_order_duration')->default(false);
            $table->float('filter_order_duration')->nullable();
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
        Schema::dropIfExists('coupons');
    }
}
