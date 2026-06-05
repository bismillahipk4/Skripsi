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

        if (isset($validated['parent_id'])) {
            $exists = \App\Models\SubKategori::where('namaSubKategori', $validated['namaKategori'])
                ->where('id_kategori', $validated['parent_id'])
                ->exists();

            if ($exists) {
                return redirect()->back()->withErrors([
                    'namaKategori' => 'Nama subkategori ini sudah ada di kategori tersebut.'
                ]);
            }

            \App\Models\SubKategori::create([
                'id_kategori'     => $validated['parent_id'],
                'namaSubKategori' => $validated['namaKategori'],
            ]);
        } else {
            $exists = Kategori::where('namaKategori', $validated['namaKategori'])->exists();

            if ($exists) {
                return redirect()->back()->withErrors([
                    'namaKategori' => 'Nama kategori ini sudah ada.'
                ]);
            }

            Kategori::create([
                'namaKategori' => $validated['namaKategori'],
            ]);
        }

        return redirect()->back()->with('success', 'Kategori/Subkategori berhasil ditambahkan.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Kategori $kategori)
    {
        $kategori->delete();
        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    public function destroySub(\App\Models\SubKategori $subKategori)
    {
        $subKategori->delete();
        return redirect()->back()->with('success', 'Subkategori berhasil dihapus.');
    }
}
