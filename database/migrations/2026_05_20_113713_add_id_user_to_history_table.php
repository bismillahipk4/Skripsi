<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('history', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user')->nullable()->after('id_lokasi');
            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('history', function (Blueprint $table) {
            $table->dropForeign(['id_user']);
            $table->dropColumn('id_user');
        });
    }
};