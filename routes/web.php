<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BarangController;
use App\Http\Controllers\LaporanController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware('auth')->group(function () {

    // Dashboard route removed, users are redirected to barang.index

    // Admin Only Routes
    Route::middleware('admin')->group(function () {
        Route::resource('users', UserController::class);

        // Barang (Create, Update, Delete)
        Route::post('/barang',                        [BarangController::class, 'store'])  ->name('barang.store');
        Route::put('/barang/{barang}',                [BarangController::class, 'update']) ->name('barang.update');
        Route::delete('/barang/{barang}',             [BarangController::class, 'destroy'])->name('barang.destroy');
        Route::post('/barang/{barang}/restock',       [BarangController::class, 'restock'])->name('barang.restock');

        // Lokasi
        Route::post('/lokasi', [\App\Http\Controllers\LokasiController::class, 'store'])->name('lokasi.store');

        // Kategori
        Route::post('/kategori', [\App\Http\Controllers\KategoriController::class, 'store'])->name('kategori.store');
        Route::delete('/kategori/{kategori}', [\App\Http\Controllers\KategoriController::class, 'destroy'])->name('kategori.destroy');
        Route::delete('/subkategori/{subKategori}', [\App\Http\Controllers\KategoriController::class, 'destroySub'])->name('subkategori.destroy');

        // Laporan
        Route::get('/laporan/generate', [LaporanController::class, 'generate']);

        // Cetak Laporan Penjualan
        Route::get('/penjualan/cetak', [\App\Http\Controllers\PenjualanController::class, 'cetak'])->name('penjualan.cetak');
    });

    // Staff & Admin Routes
    Route::middleware('staff')->group(function () {
        // Barang (Read, Move Stock)
        Route::get('/barang',                         [BarangController::class, 'index'])  ->name('barang.index');
        Route::get('/barang/{barang}',                [BarangController::class, 'show'])   ->name('barang.show');
        Route::post('/barang/{barang}/pindah',        [BarangController::class, 'pindah']) ->name('barang.pindah');

        // History
        Route::get('/history', [BarangController::class, 'history'])->name('history.index');

        // Penjualan
        Route::get('/penjualan',  [\App\Http\Controllers\PenjualanController::class, 'index'])->name('penjualan.index');
        Route::post('/penjualan', [\App\Http\Controllers\PenjualanController::class, 'store'])->name('penjualan.store');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';