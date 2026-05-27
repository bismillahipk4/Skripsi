<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stok', function (Blueprint $table) {
            $table->id('id_stok');
            $table->unsignedBigInteger('id_barang');
            $table->integer('stok_total')->default(0);
            $table->timestamps();

            $table->foreign('id_barang')
                  ->references('id_barang')
                  ->on('barang')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stok');
    }
};