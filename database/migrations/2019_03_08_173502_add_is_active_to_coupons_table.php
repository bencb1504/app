<?php

use App\Coupon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIsActiveToCouponsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('filter_order_duration');
            $table->integer('sort_index')->after('is_active')->nullable();
        });

        $index = 1;
        $coupons = Coupon::all();
        foreach ($coupons as $coupon) {
            $coupon->update(['sort_index' => $index]);
            $index += 1;
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn('is_active');
            $table->dropColumn('sort_index');
        });
    }
}
