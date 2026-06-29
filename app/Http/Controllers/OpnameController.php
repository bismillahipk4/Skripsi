<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Lokasi;
use App\Models\OpnameSession;
use App\Models\OpnameDetail;
use App\Models\Stok;
use App\Models\DetailStok;
use App\Models\History;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OpnameController extends Controller
{
    // STAFF & ADMIN: Halaman Utama Opname (Membuat Draft)
    public function index(Request $request)
    {
        $lokasiList = Lokasi::orderBy('id_lokasi')->get();
        $selectedLokasi = $request->query('lokasi_id');

        $barangList = [];
        if ($selectedLokasi) {
            // Ambil semua barang yang ada stok di lokasi ini (atau semua barang agar bisa opname barang baru di lokasi tsb)
            // Lebih baik ambil semua barang, lalu left join dengan detail_stok
            $barangList = Barang::with(['sub_kategori.kategori', 'detail_stoks' => function($q) use ($selectedLokasi) {
                $q->where('id_lokasi', $selectedLokasi);
            }])->get()->map(function($b) {
                return [
                    'id_barang' => $b->id_barang,
                    'namaBarang' => $b->namaBarang,
                    'kategori' => $b->sub_kategori->kategori->namaKategori ?? '-',
                    'sub_kategori' => $b->sub_kategori->namaSubKategori ?? '-',
                    'stok_sistem' => $b->detail_stoks->first()->jumlahDiLokasi ?? 0,
                    'stok_fisik' => '', // Untuk form input
                ];
            });
        }

        return Inertia::render('Opname/Index', [
            'lokasiList' => $lokasiList,
            'barangList' => $barangList,
            'selectedLokasi' => (int) $selectedLokasi,
        ]);
    }

    // STAFF & ADMIN: Simpan Draft Opname
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_lokasi' => 'required|exists:lokasi,id_lokasi',
            'keterangan' => 'nullable|string|max:500',
            'items' => 'required|array',
            'items.*.id_barang' => 'required|exists:barang,id_barang',
            'items.*.stok_sistem' => 'required|integer',
            'items.*.stok_fisik' => 'required|integer|min:0',
        ]);

        // Filter items yang memiliki selisih saja untuk disimpan
        $itemsWithDiff = array_filter($validated['items'], function($item) {
            return $item['stok_sistem'] !== (int)$item['stok_fisik'];
        });

        if (empty($itemsWithDiff)) {
            return redirect()->back()->with('error', 'Semua stok fisik sama dengan stok sistem. Tidak ada opname yang perlu dicatat.');
        }

        DB::transaction(function () use ($validated, $itemsWithDiff) {
            $session = OpnameSession::create([
                'id_lokasi' => $validated['id_lokasi'],
                'status' => 'pending',
                'keterangan' => $validated['keterangan'] ?? 'Draft Opname',
                'id_user_staff' => Auth::id(),
            ]);

            foreach ($itemsWithDiff as $item) {
                OpnameDetail::create([
                    'id_opname_session' => $session->id,
                    'id_barang' => $item['id_barang'],
                    'stok_sistem' => $item['stok_sistem'],
                    'stok_fisik' => $item['stok_fisik'],
                    'selisih' => (int)$item['stok_fisik'] - $item['stok_sistem'],
                ]);
            }
        });

        return redirect()->route('opname.index')->with('success', 'Draft Opname berhasil disimpan dan menunggu persetujuan Admin.');
    }

    // ADMIN ONLY: Halaman Daftar Approval
    public function approvalIndex()
    {
        $sessions = OpnameSession::with(['lokasi', 'staff', 'details.barang'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Opname/Approval', [
            'sessions' => $sessions
        ]);
    }

    // ADMIN ONLY: Approve Opname
    public function approve(Request $request, $id)
    {
        $session = OpnameSession::with('details')->findOrFail($id);

        if ($session->status !== 'pending') {
            return redirect()->back()->with('error', 'Sesi opname ini sudah diproses sebelumnya.');
        }

        DB::transaction(function () use ($session) {
            foreach ($session->details as $detail) {
                $barangId = $detail->id_barang;
                $lokasiId = $session->id_lokasi;
                $selisih = $detail->selisih;

                if ($selisih == 0) continue;

                // 1. Lock and Update Stok Total
                $stok = Stok::where('id_barang', $barangId)->lockForUpdate()->firstOrFail();
                $stokSebelum = $stok->stok_total;
                $stokSesudah = $stokSebelum + $selisih;
                
                if ($stokSesudah < 0) $stokSesudah = 0; // Prevent negative stok total if something went really wrong
                $stok->update(['stok_total' => $stokSesudah]);

                // 2. Update Detail Stok (Lokasi)
                $detailStok = DetailStok::firstOrCreate(
                    ['id_barang' => $barangId, 'id_lokasi' => $lokasiId],
                    ['jumlahDiLokasi' => 0, 'createDate' => now()->toDateString()]
                );
                
                // Gunakan stok fisik langsung untuk memastikan akurasi (menggantikan jumlahDiLokasi)
                $detailStok->update(['jumlahDiLokasi' => $detail->stok_fisik]);

                // 3. Catat ke History
                $jenis_perubahan = $selisih > 0 ? 'opname_lebih' : 'opname_kurang';
                
                History::create([
                    'id_barang' => $barangId,
                    'id_lokasi' => $lokasiId,
                    'id_lokasi_tujuan' => null,
                    'keterangan' => 'Stock Opname (ID Sesi: ' . $session->id . ')',
                    'id_user' => Auth::id(), // Admin yang approve
                    'qty_perubahan' => abs($selisih),
                    'jenis_perubahan' => $jenis_perubahan,
                    'stokSebelum' => $stokSebelum,
                    'stokSesudah' => $stokSebelum + $selisih,
                ]);
            }

            // Update status session
            $session->update([
                'status' => 'approved',
                'id_user_admin' => Auth::id(),
            ]);
        });

        return redirect()->back()->with('success', 'Stock Opname berhasil disetujui dan stok telah diperbarui.');
    }

    // ADMIN ONLY: Reject Opname
    public function reject(Request $request, $id)
    {
        $session = OpnameSession::findOrFail($id);

        if ($session->status !== 'pending') {
            return redirect()->back()->with('error', 'Sesi opname ini sudah diproses sebelumnya.');
        }

        $session->update([
            'status' => 'rejected',
            'id_user_admin' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Stock Opname ditolak. Tidak ada stok yang berubah.');
    }
}
