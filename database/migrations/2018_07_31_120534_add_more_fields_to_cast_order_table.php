<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMoreFieldsToCastOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cast_order', function (Blueprint $table) {
            $table->smallInteger('extra_time')->nullable()->after('point');
            $table->smallInteger('night_time')->nullable()->after('extra_time');
            $table->smallInteger('total_time')->nullable()->after('night_time');
            $table->smallInteger('order_time')->nullable()->after('total_time');
            $table->integer('order_point')->nullable()->after('order_time');
            $table->integer('fee_point')->nullable()->after('order_point');
            $table->integer('extra_point')->nullable()->after('user_id');
            $table->integer('allowance_point')->nullable()->after('extra_point');
            $table->renameColumn('point', 'total_point');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('cast_order', function (Blueprint $table) {
            $table->dropColumn('extra_time');
            $table->dropColumn('night_time');
            $table->dropColumn('total_time');
            $table->dropColumn('order_time');
            $table->dropColumn('order_point');
            $table->dropColumn('fee_point');
            $table->dropColumn('extra_point');
            $table->dropColumn('allowance_point');
            $table->renameColumn('total_point', 'point');
        });
    }
}
