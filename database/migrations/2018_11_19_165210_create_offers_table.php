<?php

use App\Enums\OfferStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOffersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('prefecture_id')->nullable();
            $table->string('comment')->nullable();
            $table->date('date')->nullable();
            $table->time('start_time_from')->nullable();
            $table->time('start_time_to')->nullable();
            $table->tinyInteger('duration')->nullable();
            $table->string('cast_ids')->nullable();
            $table->tinyInteger('total_cast')->nullable();
            $table->integer('temp_point')->nullable();
            $table->tinyInteger('class_id')->nullable();
            $table->tinyInteger('status')->default(OfferStatus::INACTIVE);
            $table->timestamps();
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
        Schema::dropIfExists('offers');
    }
}
