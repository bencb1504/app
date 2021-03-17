<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCastRatedAndGuestRatedToCastOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('cast_order', function (Blueprint $table) {
            $table->boolean('cast_rated')->after('status')->default(false);
            $table->boolean('guest_rated')->after('status')->default(false);
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
            $table->dropColumn('cast_rated');
            $table->dropColumn('guest_rated');
        });
    }
}
