<?php

use App\Enums\CastOrderType;
use App\Enums\OrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('cast_order');
        Schema::dropIfExists('orders');

        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('prefecture_id')->nullable();
            $table->string('address')->nullable();
            $table->date('date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->tinyInteger('duration')->nullable();
            $table->smallInteger('extra_time')->nullable();
            $table->smallInteger('night_time')->nullable();
            $table->smallInteger('total_time')->nullable();
            $table->tinyInteger('total_cast')->nullable();
            $table->integer('temp_point')->nullable();
            $table->integer('fee_point')->nullable();
            $table->integer('total_point')->nullable();
            $table->tinyInteger('class_id')->nullable();
            $table->tinyInteger('type');
            $table->tinyInteger('status')->default(OrderStatus::OPEN);
            $table->timestamp('actual_started_at')->nullable();
            $table->timestamp('actual_ended_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });

        Schema::create('cast_order', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('order_id');
            $table->unsignedInteger('user_id');
            $table->integer('point')->nullable();
            $table->tinyInteger('type')->default(CastOrderType::NOMINEE);
            $table->boolean('status')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_tag', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('order_id');
            $table->unsignedInteger('tag_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cast_order');
        Schema::dropIfExists('order_tag');
        Schema::dropIfExists('orders');
    }
}
