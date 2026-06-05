<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('barang', function (Blueprint $table) {
            $table->id('id_barang');
            $table->string('namaBarang', 100);
            $table->string('gambar')->nullable();
            $table->string('kategori', 50)->nullable();
            $table->text('deskripsiBarang')->nullable();
            $table->decimal('hargaBarang', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('barang');
    }
};