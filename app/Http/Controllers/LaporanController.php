<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DetailStok;
use App\Models\History;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LaporanController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'jenis_laporan'   => 'required|in:stok,masuk,keluar,penjualan,history',
            'tanggal_awal'    => 'nullable|date',
            'tanggal_akhir'   => 'nullable|date|after_or_equal:tanggal_awal',
            'jenis_perubahan' => 'nullable|in:tambah,masuk,keluar,pindah,terjual',
            'search'          => 'nullable|string|max:255',
            'tab'             => 'nullable|string|in:aktivitas,mutasi',
        ]);

        $jenis          = $request->jenis_laporan;
        $tglAwal        = $request->tanggal_awal;
        $tglAkhir       = $request->tanggal_akhir;
        $jenisPerubahan = $request->jenis_perubahan;
        $search         = $request->search;
        $tab            = $request->tab ?? 'aktivitas';

        switch ($jenis) {
            case 'stok':
                $data  = DetailStok::with(['barang', 'lokasi'])->get();
                $judul = 'Laporan Stok Produk Saat Ini';
                $view  = 'laporan.stok';
                break;

            case 'masuk':
                $data = History::with(['barang', 'lokasi'])
                    ->where('jenis_perubahan', 'masuk')
                    ->when($tglAwal,  fn($q) => $q->whereDate('created_at', '>=', $tglAwal))
                    ->when($tglAkhir, fn($q) => $q->whereDate('created_at', '<=', $tglAkhir))
                    ->get();
                $judul = 'Laporan Barang Masuk';
                $view  = 'laporan.history';
                break;

            case 'keluar':
            case 'penjualan':
                $data = History::with(['barang', 'lokasi'])
                    ->whereIn('jenis_perubahan', ['keluar', 'terjual'])
                    ->when($tglAwal,  fn($q) => $q->whereDate('created_at', '>=', $tglAwal))
                    ->when($tglAkhir, fn($q) => $q->whereDate('created_at', '<=', $tglAkhir))
                    ->get();
                $judul = 'Laporan Penjualan';
                $view  = 'laporan.penjualan';
                break;

            case 'history':
                $query = History::with(['barang', 'lokasi', 'lokasiTujuan', 'user'])
                    ->when($tglAwal,  fn($q) => $q->whereDate('created_at', '>=', $tglAwal))
                    ->when($tglAkhir, fn($q) => $q->whereDate('created_at', '<=', $tglAkhir))
                    ->when($search,   fn($q) => $q->whereHas('barang', fn($b) => $b->where('namaBarang', 'like', "%{$search}%")));

                if ($jenisPerubahan) {
                    if ($tab === 'mutasi') {
                        if ($jenisPerubahan === 'masuk') {
                            $query->whereIn('jenis_perubahan', ['tambah', 'pindah']);
                        } elseif ($jenisPerubahan === 'keluar') {
                            $query->whereIn('jenis_perubahan', ['terjual', 'pindah']);
                        }
                    } else {
                        $query->where('jenis_perubahan', $jenisPerubahan);
                    }
                }

                $data = $query->get();

                if ($tab === 'mutasi') {
                    $transformed = collect([]);
                    foreach ($data as $h) {
                        if ($h->jenis_perubahan === 'tambah') {
                            $h->lokasi_mutasi = $h->lokasi->namaLokasi ?? '-';
                            $h->aksi = 'Masuk';
                            $transformed->push($h);
                        } elseif ($h->jenis_perubahan === 'terjual') {
                            $h->lokasi_mutasi = $h->lokasi->namaLokasi ?? '-';
                            $h->aksi = 'Keluar';
                            $transformed->push($h);
                        } elseif ($h->jenis_perubahan === 'pindah') {
                            if (empty($jenisPerubahan) || $jenisPerubahan === 'keluar') {
                                $itemOut = clone $h;
                                $itemOut->lokasi_mutasi = $h->lokasi->namaLokasi ?? '-';
                                $itemOut->aksi = 'Keluar';
                                $itemOut->keterangan = 'Dipindah ke ' . ($h->lokasiTujuan->namaLokasi ?? '-') . ($h->keterangan ? ' - ' . $h->keterangan : '');
                                $transformed->push($itemOut);
                            }
                            if (empty($jenisPerubahan) || $jenisPerubahan === 'masuk') {
                                $itemIn = clone $h;
                                $itemIn->lokasi_mutasi = $h->lokasiTujuan->namaLokasi ?? '-';
                                $itemIn->aksi = 'Masuk';
                                $itemIn->keterangan = 'Pindahan dari ' . ($h->lokasi->namaLokasi ?? '-') . ($h->keterangan ? ' - ' . $h->keterangan : '');
                                $transformed->push($itemIn);
                            }
                        }
                    }
                    $data = $transformed;
                }

                // Summary calculations
                $pencetak  = Auth::user()->name ?? 'Unknown';
                $timestamp = now()->translatedFormat('d F Y, H:i') . ' WIB';

                if ($tab === 'mutasi') {
                    $totalMasuk  = $data->where('aksi', 'Masuk')->sum('qty_perubahan');
                    $totalKeluar = $data->where('aksi', 'Keluar')->sum('qty_perubahan');
                } else {
                    $totalAktivitas = $data->count();
                }

                $judul = $tab === 'mutasi' ? 'Laporan Riwayat Mutasi Stok per Lokasi' : 'Laporan Log Aktivitas Stok';
                $view  = 'laporan.riwayat_stok';

                return view($view, array_merge(
                    compact('data', 'judul', 'tglAwal', 'tglAkhir', 'tab', 'pencetak', 'timestamp'),
                    $tab === 'mutasi'
                        ? compact('totalMasuk', 'totalKeluar')
                        : compact('totalAktivitas')
                ));

            default:
                abort(400, 'Jenis laporan tidak valid.');
        }

        // Fallback for non-history reports (stok, masuk, keluar, penjualan)
        $pdf = Pdf::loadView($view, compact('data', 'judul', 'tglAwal', 'tglAkhir', 'tab'))
                  ->setPaper('a4', 'portrait');

        $filename = "Laporan_{$jenis}_" . now()->format('YmdHis') . ".pdf";

        return $pdf->download($filename);
    }
}