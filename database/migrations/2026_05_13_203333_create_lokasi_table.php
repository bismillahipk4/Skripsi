<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('lokasi', function (Blueprint $table) {
            $table->id('id_lokasi');
            $table->string('namaLokasi', 50);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lokasi');
    }
};