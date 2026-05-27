<?php

namespace App\Observers;

use App\Models\DetailStok;
use App\Models\Stok;
use Exception;

class DetailStokObserver
{
    public function creating(DetailStok $detailStok): void
    {
        $this->validateTotalStok($detailStok);
    }

    public function updating(DetailStok $detailStok): void
    {
        $this->validateTotalStok($detailStok);
    }

    private function validateTotalStok(DetailStok $detailStok): void
    {
        $stokMaster = Stok::where('id_barang', $detailStok->id_barang)->first();

        if (!$stokMaster) {
            throw new Exception("Stok master untuk barang ini belum ada di table stok.");
        }

        $totalSekarang = DetailStok::where('id_barang', $detailStok->id_barang)
            ->when($detailStok->exists, function ($query) use ($detailStok) {
                return $query->where('id_detailstok', '!=', $detailStok->id_detailstok);
            })
            ->sum('jumlahDiLokasi');

        $totalBaru = $totalSekarang + $detailStok->jumlahDiLokasi;

        if ($totalBaru > $stokMaster->stok_total) {
            throw new Exception(
                "Total stok di semua lokasi melebihi stok master!\n" .
                "Maksimal: {$stokMaster->stok_total} | " .
                "Total yang diinput: {$totalBaru}"
            );
        }
    }
}