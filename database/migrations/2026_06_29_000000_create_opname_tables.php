<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('opname_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_lokasi');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('id_user_staff');
            $table->unsignedBigInteger('id_user_admin')->nullable();
            $table->timestamps();

            $table->foreign('id_lokasi')->references('id_lokasi')->on('lokasi')->onDelete('cascade');
            $table->foreign('id_user_staff')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_user_admin')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('opname_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_opname_session');
            $table->unsignedBigInteger('id_barang');
            $table->integer('stok_sistem');
            $table->integer('stok_fisik');
            $table->integer('selisih');
            $table->timestamps();

            $table->foreign('id_opname_session')->references('id')->on('opname_sessions')->onDelete('cascade');
            $table->foreign('id_barang')->references('id_barang')->on('barang')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('opname_details');
        Schema::dropIfExists('opname_sessions');
    }
};
