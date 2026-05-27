<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            // Drop old string column
            $table->dropColumn('kategori');
            
            // Add new foreign key column (nullable in case we have items without categories)
            $table->unsignedBigInteger('id_sub_kategori')->nullable()->after('gambar');
            $table->foreign('id_sub_kategori')->references('id_kategori')->on('kategori')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropForeign(['id_sub_kategori']);
            $table->dropColumn('id_sub_kategori');
            
            $table->string('kategori', 50)->nullable()->after('gambar');
        });
    }
};
