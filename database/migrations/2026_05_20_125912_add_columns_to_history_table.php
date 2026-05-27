<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('history', function (Blueprint $table) {
            $table->integer('qty_perubahan')->nullable()->after('id_lokasi');
            $table->string('jenis_perubahan', 20)->nullable()->after('qty_perubahan'); // masuk, keluar, pindah
            $table->integer('stokSebelum')->nullable();
            $table->integer('stokSesudah')->nullable();
        });
    }

    public function down()
    {
        Schema::table('history', function (Blueprint $table) {
            $table->dropColumn(['qty_perubahan', 'jenis_perubahan', 'stokSebelum', 'stokSesudah']);
        });
    }
};