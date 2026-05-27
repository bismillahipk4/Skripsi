<?php

namespace App\Http\Controllers;

use App\Models\Lokasi;
use Illuminate\Http\Request;

class LokasiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'namaLokasi' => 'required|string|max:100|unique:lokasi,namaLokasi',
        ]);

        Lokasi::create($validated);

        return redirect()->back()->with('success', 'Lokasi berhasil ditambahkan.');
    }
}
