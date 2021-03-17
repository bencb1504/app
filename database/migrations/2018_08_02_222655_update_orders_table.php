<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('fee_point');

            $table->unsignedInteger('room_id')->nullable()->after('status');
            $table->tinyInteger('payment_status')->nullable()->after('status');
            $table->tinyInteger('cancel_fee_percent')->nullable()->after('payment_status');
            $table->timestamp('payment_requested_at')->nullable()->after('actual_ended_at');
            $table->timestamp('paid_at')->nullable()->after('payment_requested_at');
        });

        Schema::table('cast_order', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('room_id');
            $table->dropColumn('payment_status');
            $table->dropColumn('cancel_fee_percent');
            $table->dropColumn('payment_requested_at');
            $table->dropColumn('paid_at');

            $table->integer('fee_point')->after('temp_point');
        });

        Schema::table('cast_order', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
    }
}
