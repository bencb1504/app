<?php

use App\Enums\ResignStatus;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddResignStatusToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->tinyInteger('resign_status')->default(0)->after('is_multi_payment_method');
            $table->text('first_resign_description')->after('resign_status')->nullable();
            $table->text('second_resign_description')->after('first_resign_description')->nullable();
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
            $table->dropColumn('resign_status');
            $table->dropColumn('first_resign_description');
            $table->dropColumn('second_resign_description');
        });
    }
}
