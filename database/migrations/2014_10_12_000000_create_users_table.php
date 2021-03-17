<?php

use App\Enums\UserType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('facebook_id')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('password')->nullable();
            $table->string('nickname')->nullable();
            $table->string('fullname')->nullable();
            $table->tinyInteger('gender')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->smallInteger('height')->nullable();
            $table->tinyInteger('salary_id')->nullable();
            $table->tinyInteger('body_type_id')->nullable();
            $table->unsignedInteger('prefecture_id')->nullable();
            $table->unsignedInteger('hometown_id')->nullable();
            $table->unsignedInteger('job_id')->nullable();
            $table->tinyInteger('drink_volume_type')->nullable();
            $table->tinyInteger('smoking_type')->nullable();
            $table->tinyInteger('siblings_type')->nullable();
            $table->tinyInteger('cohabitant_type')->nullable();
            $table->text('intro')->nullable();
            $table->tinyInteger('type')->default(UserType::GUEST);
            $table->boolean('status')->default(true);
            $table->integer('cost')->nullable();
            $table->integer('point')->nullable();
            $table->boolean('working_today')->default(false);
            $table->tinyInteger('class_id')->nullable();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
}
