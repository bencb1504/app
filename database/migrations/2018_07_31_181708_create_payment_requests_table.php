<?php

use App\Enums\PaymentRequestStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payment_requests', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('cast_id');
            $table->unsignedInteger('guest_id');
            $table->unsignedInteger('order_id');
            $table->smallInteger('order_time')->nullable();
            $table->smallInteger('extra_time')->nullable();
            $table->integer('order_point')->nullable();
            $table->integer('extra_point')->nullable();
            $table->integer('allowance_point')->nullable();
            $table->integer('fee_point')->nullable();
            $table->integer('total_point')->nullable();
            $table->tinyInteger('status')->default(PaymentRequestStatus::OPEN);
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
        Schema::dropIfExists('payment_requests');
    }
}
