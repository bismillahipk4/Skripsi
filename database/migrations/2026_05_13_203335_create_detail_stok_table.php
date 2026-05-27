<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('detail_stok', function (Blueprint $table) {
            $table->id('id_detailstok');
            $table->unsignedBigInteger('id_barang');
            $table->unsignedBigInteger('id_lokasi');
            $table->integer('jumlahDiLokasi')->default(0);
            $table->text('deskripsiBarang')->nullable();
            $table->date('createDate')->nullable();
            $table->decimal('hargaBarang', 12, 2)->nullable();
            $table->timestamps();

            // Foreign Key yang benar
            $table->foreign('id_barang')
                  ->references('id_barang')
                  ->on('barang')
                  ->onDelete('cascade');

            $table->foreign('id_lokasi')
                  ->references('id_lokasi')
                  ->on('lokasi')
                  ->onDelete('cascade');

            $table->unique(['id_barang', 'id_lokasi']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('detail_stok');
    }
};