<?php

namespace App\Http\Controllers;

use App\Models\Kategori;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    /**
     * Store a newly created category or subcategory in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'namaKategori' => 'required|string|max:100',
            'parent_id'    => 'nullable|exists:kategori,id_kategori',
        ]);

        // Pastikan kombinasi unik untuk level yang sama
        $exists = Kategori::where('namaKategori', $validated['namaKategori'])
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->exists();

        if ($exists) {
            return redirect()->back()->withErrors([
                'namaKategori' => 'Nama kategori/subkategori ini sudah ada di level yang sama.'
            ]);
        }

        Kategori::create($validated);

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Kategori $kategori)
    {
        // Karena di migration ada onDelete('cascade') untuk parent_id,
        // subkategorinya akan ikut terhapus otomatis, 
        // dan barang yang punya id_sub_kategori akan di set null (onDelete('set null')).
        $kategori->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
