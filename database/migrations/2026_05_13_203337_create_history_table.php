<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('history', function (Blueprint $table) {
            $table->id('id_history');
            $table->unsignedBigInteger('id_barang');
            $table->unsignedBigInteger('id_lokasi');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('id_barang')
                  ->references('id_barang')
                  ->on('barang')
                  ->onDelete('cascade');

            $table->foreign('id_lokasi')
                  ->references('id_lokasi')
                  ->on('lokasi')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('history');
    }
};