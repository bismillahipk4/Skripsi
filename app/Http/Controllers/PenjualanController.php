<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\DetailStok;
use App\Models\History;
use App\Models\Stok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PenjualanController extends Controller
{
    public function index(Request $request)
    {
        // Ambil data history penjualan
        $query = History::query()
            ->select('history.*')
            ->where('jenis_perubahan', 'terjual')
            ->with(['barang', 'user'])
            ->leftJoin('lokasi as la', 'history.id_lokasi', '=', 'la.id_lokasi')
            ->addSelect([
                'la.namaLokasi as lokasi_asal_nama',
            ])
            ->latest('history.created_at');

        // Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('barang', fn($q) => $q->where('namaBarang', 'like', "%{$search}%"));
        }

        if ($request->filled('tanggal_dari')) {
            $query->whereDate('history.created_at', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('history.created_at', '<=', $request->tanggal_sampai);
        }

        $histories = $query->paginate(15)->withQueryString();

        // Ambil list barang dan detail stok untuk dropdown form penjualan
        $barang = Barang::with(['detailStoks.lokasi'])->orderBy('namaBarang')->get();

        return Inertia::render('Penjualan/Index', [
            'histories' => $histories,
            'barang'    => $barang,
            'filters'   => $request->only(['search', 'tanggal_dari', 'tanggal_sampai']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_barang'      => 'required|integer|exists:barang,id_barang',
            'id_lokasi_asal' => 'required|integer|exists:lokasi,id_lokasi',
            'jumlah'         => 'required|integer|min:1',
            'keterangan'     => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated) {
            $barangId = (int) $validated['id_barang'];
            $asal     = (int) $validated['id_lokasi_asal'];
            $jumlah   = (int) $validated['jumlah'];

            // Ambil stok total SEBELUM perubahan (dengan lock)
            $stok = Stok::where('id_barang', $barangId)
                ->lockForUpdate()
                ->firstOrFail();

            $stokSebelum = $stok->stok_total;

            if ($stokSebelum < $jumlah) {
                abort(422, 'Stok total barang tidak mencukupi.');
            }

            // Kurangi stok di lokasi asal
            $detailAsal = DetailStok::where('id_barang', $barangId)
                ->where('id_lokasi', $asal)
                ->lockForUpdate()
                ->firstOrFail();

            if ($detailAsal->jumlahDiLokasi < $jumlah) {
                abort(422, 'Stok di lokasi asal tidak mencukupi.');
            }

            // Pengurangan stok
            $detailAsal->decrement('jumlahDiLokasi', $jumlah);
            $stok->decrement('stok_total', $jumlah);
            $stokSesudah = $stokSebelum - $jumlah;

            // Simpan ke history
            History::create([
                'id_barang'        => $barangId,
                'id_lokasi'        => $asal,
                'id_lokasi_tujuan' => null,
                'keterangan'       => $validated['keterangan'] ?? null,
                'id_user'          => Auth::id(),
                'qty_perubahan'    => $jumlah,
                'jenis_perubahan'  => 'terjual',
                'stokSebelum'      => $stokSebelum,
                'stokSesudah'      => $stokSesudah,
            ]);
        });

        return redirect()->back()->with('success', 'Penjualan berhasil dicatat.');
    }

    public function cetak(Request $request)
    {
        $query = History::query()
            ->select('history.*')
            ->where('jenis_perubahan', 'terjual')
            ->with(['barang.detailStoks', 'user'])
            ->leftJoin('lokasi as la', 'history.id_lokasi', '=', 'la.id_lokasi')
            ->addSelect([
                'la.namaLokasi as lokasi_asal_nama',
            ])
            ->latest('history.created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('barang', fn($q) => $q->where('namaBarang', 'like', "%{$search}%"));
        }

        if ($request->filled('tanggal_dari')) {
            $query->whereDate('history.created_at', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('history.created_at', '<=', $request->tanggal_sampai);
        }

        $histories = $query->get();

        // Hitung total penjualan
        $totalPenjualan = 0;
        foreach ($histories as $h) {
            $harga = $h->barang->hargaBarang ?? 0;
            $totalPenjualan += (float) $harga * $h->qty_perubahan;
        }

        return view('penjualan.cetak', [
            'histories'      => $histories,
            'totalPenjualan' => $totalPenjualan,
            'filters'        => $request->only(['search', 'tanggal_dari', 'tanggal_sampai']),
        ]);
    }
}
