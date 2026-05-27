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
        Schema::create('kategori', function (Blueprint $table) {
            $table->id('id_kategori');
            $table->string('namaKategori', 100);
            
            // Self-referencing foreign key for sub-categories
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id_kategori')->on('kategori')->onDelete('cascade');
            
            // Pastikan kombinasi parent_id dan namaKategori unik
            // Supaya nggak ada nama subkategori yang dobel di dalam satu parent yang sama
            $table->unique(['parent_id', 'namaKategori']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori');
    }
};
