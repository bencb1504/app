<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppVersionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('app_versions', function (Blueprint $table) {
            $table->increments('id');
            $table->tinyInteger('type');
            $table->string('version');
            $table->timestamps();
        });

        DB::table('app_versions')->truncate();

        $data = [
            // ios
            [
                'type' => 1,
                'version' => '1.2.0',
            ],
            // android
            [
                'type' => 2,
                'version' => '2.3.1',
            ],
        ];

        DB::table('app_versions')->insert($data);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('app_versions');
    }
}
