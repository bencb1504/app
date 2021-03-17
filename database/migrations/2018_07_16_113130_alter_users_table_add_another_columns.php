<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterUsersTableAddAnotherColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('firstname')->after('nickname')->nullable();
            $table->string('lastname')->after('firstname')->nullable();
            $table->string('firstname_kana')->after('lastname')->nullable();
            $table->string('lastname_kana')->after('firstname_kana')->nullable();
            $table->string('front_id_image')->after('lastname_kana')->nullable();
            $table->string('back_id_image')->after('front_id_image')->nullable();
            $table->string('phone', 13)->after('back_id_image')->nullable();
            $table->string('line_id')->after('facebook_id')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('firstname');
            $table->dropColumn('lastname');
            $table->dropColumn('firstname_kana');
            $table->dropColumn('lastname_kana');
            $table->dropColumn('front_id_image');
            $table->dropColumn('back_id_image');
            $table->dropColumn('phone');
            $table->dropColumn('line_id');
        });
    }
}
