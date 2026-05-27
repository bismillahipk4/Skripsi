<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Stok;
use App\Models\DetailStok;
use App\Models\History;
use App\Models\Lokasi;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BarangController extends Controller
{

    public function index()
    {
        $barang = Barang::with(['stok', 'subKategori.parent', 'detailStoks'])->latest()->get();

        $kategoriList = Kategori::with('children')->whereNull('parent_id')->orderBy('namaKategori')->get();

        return Inertia::render('Barang/Index', [
            'barang'       => $barang,
            'kategoriList' => $kategoriList,
        ]);
    }

    public function show(Barang $barang)
    {
        $barang->load([
            'stok',
            'detailStoks.lokasi',
            'subKategori.parent',
        ]);

        $lokasi = Lokasi::orderBy('namaLokasi')->get(['id_lokasi', 'namaLokasi']);

        return Inertia::render('Barang/Detail', [
            'barang' => $barang,
            'lokasi' => $lokasi,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'namaBarang'      => 'required|string|max:100',
            'id_sub_kategori' => 'nullable|exists:kategori,id_kategori',
            'gambar'          => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'stok_total'      => 'required|integer|min:0',
            'deskripsiBarang' => 'nullable|string',
            'hargaBarang'     => 'nullable|numeric|min:0',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        }

        DB::transaction(function () use ($validated) {
            $barang = Barang::create([
                'namaBarang'      => $validated['namaBarang'],
                'id_sub_kategori' => $validated['id_sub_kategori'] ?? null,
                'gambar'          => $validated['gambar'] ?? null,
            ]);

            Stok::create([
                'id_barang'  => $barang->id_barang,
                'stok_total' => $validated['stok_total'],
            ]);

            DetailStok::create([
                'id_barang'       => $barang->id_barang,
                'id_lokasi'       => 1,
                'jumlahDiLokasi'  => $validated['stok_total'],
                'deskripsiBarang' => $validated['deskripsiBarang'] ?? null,
                'hargaBarang'     => $validated['hargaBarang'] ?? null,
                'createDate'      => now()->toDateString(),
            ]);

            // === HISTORY BARU DITAMBAHKAN ===
            History::create([
                'id_barang'        => $barang->id_barang,
                'id_lokasi'        => 1,
                'id_lokasi_tujuan' => null,
                'keterangan'       => 'Barang baru ditambahkan',
                'id_user'          => Auth::id(),
                'qty_perubahan'    => $validated['stok_total'],
                'jenis_perubahan'  => 'tambah',
                'stokSebelum'      => 0,
                'stokSesudah'      => $validated['stok_total'],
            ]);
        });

        return redirect()->back()->with('success', 'Barang berhasil ditambahkan.');
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'namaBarang'      => 'required|string|max:100',
            'id_sub_kategori' => 'nullable|exists:kategori,id_kategori',
            'gambar'          => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'deskripsiBarang' => 'nullable|string',
            'hargaBarang'     => 'nullable|numeric|min:0',
        ]);

        if ($request->hasFile('gambar')) {
            if ($barang->gambar) {
                Storage::disk('public')->delete($barang->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('barang', 'public');
        }

        $updateData = [
            'namaBarang'      => $validated['namaBarang'],
            'id_sub_kategori' => $validated['id_sub_kategori'] ?? null,
        ];

        if (isset($validated['gambar'])) {
            $updateData['gambar'] = $validated['gambar'];
        }

        $barang->update($updateData);

        DetailStok::where('id_barang', $barang->id_barang)->update([
            'deskripsiBarang' => $validated['deskripsiBarang'] ?? null,
            'hargaBarang'     => $validated['hargaBarang'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Barang berhasil diupdate.');
    }

    public function destroy(Barang $barang)
    {
        if ($barang->gambar) {
            Storage::disk('public')->delete($barang->gambar);
        }

        $barang->delete();

        return redirect()->back()->with('success', 'Barang berhasil dihapus.');
    }

    public function pindah(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'id_lokasi_asal'   => 'required|integer|exists:lokasi,id_lokasi',
            'id_lokasi_tujuan' => 'required|integer|exists:lokasi,id_lokasi|different:id_lokasi_asal',
            'jumlah'           => 'required|integer|min:1',
            'keterangan'       => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $barang) {
            $asal   = (int) $validated['id_lokasi_asal'];
            $tujuan = (int) $validated['id_lokasi_tujuan'];
            $jumlah = (int) $validated['jumlah'];

            // Ambil stok total SEBELUM perubahan (dengan lock)
            $stok = Stok::where('id_barang', $barang->id_barang)
                ->lockForUpdate()
                ->firstOrFail();

            $stokSebelum = $stok->stok_total;

            // Kurangi stok di lokasi asal
            $detailAsal = DetailStok::where('id_barang', $barang->id_barang)
                ->where('id_lokasi', $asal)
                ->lockForUpdate()
                ->firstOrFail();

            if ($detailAsal->jumlahDiLokasi < $jumlah) {
                abort(422, 'Stok di lokasi asal tidak mencukupi.');
            }

            $detailAsal->decrement('jumlahDiLokasi', $jumlah);

            // Tambah ke lokasi tujuan
            $detailTujuan = DetailStok::firstOrCreate(
                ['id_barang' => $barang->id_barang, 'id_lokasi' => $tujuan],
                ['jumlahDiLokasi' => 0, 'createDate' => now()->toDateString()]
            );
            $detailTujuan->increment('jumlahDiLokasi', $jumlah);

            $stokSesudah = $stokSebelum;

            // Simpan ke history dengan 4 kolom baru
            History::create([
                'id_barang'        => $barang->id_barang,
                'id_lokasi'        => $asal,
                'id_lokasi_tujuan' => $tujuan,
                'keterangan'       => $validated['keterangan'] ?? null,
                'id_user'          => Auth::id(),
                // Kolom baru
                'qty_perubahan'    => $jumlah,
                'jenis_perubahan'  => 'pindah',
                'stokSebelum'      => $stokSebelum,
                'stokSesudah'      => $stokSesudah,
            ]);
        });

        return redirect()->back()->with('success', 'Barang berhasil dipindahkan.');
    }

    public function history(Request $request)
    {
        $tab = $request->get('tab', 'aktivitas');

        $query = History::query()
            ->select('history.*')
            ->with(['barang', 'user'])                    
            ->leftJoin('lokasi as la', 'history.id_lokasi', '=', 'la.id_lokasi')
            ->leftJoin('lokasi as lt', 'history.id_lokasi_tujuan', '=', 'lt.id_lokasi')
            ->addSelect([
                'la.namaLokasi as lokasi_asal_nama',
                'lt.namaLokasi as lokasi_tujuan_nama',
            ])
            ->latest('history.created_at');

        // Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('barang', fn($q) => $q->where('namaBarang', 'like', "%{$search}%"));
        }

        if ($request->filled('jenis')) {
            if ($tab === 'mutasi') {
                if ($request->jenis === 'masuk') {
                    $query->whereIn('jenis_perubahan', ['tambah', 'pindah']);
                } elseif ($request->jenis === 'keluar') {
                    $query->whereIn('jenis_perubahan', ['terjual', 'pindah']);
                }
            } else {
                $query->where('jenis_perubahan', $request->jenis);
            }
        }

        if ($request->filled('tanggal_dari')) {
            $query->whereDate('history.created_at', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('history.created_at', '<=', $request->tanggal_sampai);
        }

        $histories = $query->paginate(15)->withQueryString();

        if ($tab === 'mutasi') {
            $transformed = collect([]);
            foreach ($histories->items() as $h) {
                if ($h->jenis_perubahan === 'tambah') {
                    $item = $h->toArray();
                    $item['id'] = $h->id_history;
                    $item['lokasi_mutasi'] = $h->lokasi_asal_nama;
                    $item['aksi'] = 'masuk';
                    $transformed->push($item);
                } elseif ($h->jenis_perubahan === 'terjual') {
                    $item = $h->toArray();
                    $item['id'] = $h->id_history;
                    $item['lokasi_mutasi'] = $h->lokasi_asal_nama;
                    $item['aksi'] = 'keluar';
                    $transformed->push($item);
                } elseif ($h->jenis_perubahan === 'pindah') {
                    if (empty($request->jenis) || $request->jenis === 'keluar') {
                        $itemOut = $h->toArray();
                        $itemOut['id'] = $h->id_history . '_out';
                        $itemOut['lokasi_mutasi'] = $h->lokasi_asal_nama;
                        $itemOut['aksi'] = 'keluar';
                        $itemOut['keterangan'] = 'Dipindah ke ' . $h->lokasi_tujuan_nama . ($h->keterangan ? ' - ' . $h->keterangan : '');
                        $transformed->push($itemOut);
                    }
                    if (empty($request->jenis) || $request->jenis === 'masuk') {
                        $itemIn = $h->toArray();
                        $itemIn['id'] = $h->id_history . '_in';
                        $itemIn['lokasi_mutasi'] = $h->lokasi_tujuan_nama;
                        $itemIn['aksi'] = 'masuk';
                        $itemIn['keterangan'] = 'Pindahan dari ' . $h->lokasi_asal_nama . ($h->keterangan ? ' - ' . $h->keterangan : '');
                        $transformed->push($itemIn);
                    }
                }
            }
            $histories->setCollection($transformed);
        }

        return Inertia::render('History/Index', [
            'histories' => $histories,
            'filters'   => $request->only(['search', 'jenis', 'tanggal_dari', 'tanggal_sampai', 'tab']),
        ]);
    }
    // public function history(Request $request)
    // {
    //     $query = History::with([
    //         'barang',
    //         'lokasiAsal',
    //         'lokasiTujuan',
    //         'user'
    //     ])->latest('created_at');

    //     // Filter
    //     if ($request->filled('search')) {
    //         $search = $request->search;
    //         $query->whereHas('barang', fn($q) => $q->where('namaBarang', 'like', "%{$search}%"));
    //     }

    //     if ($request->filled('jenis')) {
    //         $query->where('jenis_perubahan', $request->jenis);
    //     }

    //     if ($request->filled('tanggal_dari')) {
    //         $query->whereDate('created_at', '>=', $request->tanggal_dari);
    //     }

    //     if ($request->filled('tanggal_sampai')) {
    //         $query->whereDate('created_at', '<=', $request->tanggal_sampai);
    //     }

    //     $histories = $query->paginate(15)->withQueryString();

    //     return Inertia::render('History/Index', [
    //         'histories' => $histories,
    //         'filters'   => $request->only(['search', 'jenis', 'tanggal_dari', 'tanggal_sampai']),
    //     ]);
    // }
}