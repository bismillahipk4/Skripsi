<?php

use App\Http\Controllers\LaporanController;
// use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// ====================== PUBLIC ROUTES ======================
// Route::post('/login', [AuthController::class, 'login']);

// ====================== PROTECTED ROUTES ======================
Route::middleware('auth:sanctum')->group(function () {

    // Route::post('/logout', [AuthController::class, 'logout']);
    // Route::get('/me', [AuthController::class, 'me']);

    // Admin Only
    Route::middleware('admin')->group(function () {
        Route::post('/laporan', [LaporanController::class, 'generate']);
    });

});