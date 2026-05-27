<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('history', function (Blueprint $table) {
            $table->unsignedBigInteger('id_lokasi_tujuan')->nullable()->after('id_lokasi');

            $table->foreign('id_lokasi_tujuan')
                  ->references('id_lokasi')
                  ->on('lokasi')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('history', function (Blueprint $table) {
            $table->dropForeign(['id_lokasi_tujuan']);
            $table->dropColumn('id_lokasi_tujuan');
        });
    }
};