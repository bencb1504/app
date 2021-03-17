<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTableUserResignDate extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->dateTime('resign_date')->after('resign_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->dropColumn('resign_date');
        });
    }
}
