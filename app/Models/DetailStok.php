<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailStok extends Model
{
    use HasFactory;

    protected $table = 'detail_stok';
    protected $primaryKey = 'id_detailstok';

    protected $fillable = [
        'id_barang',
        'id_lokasi',
        'jumlahDiLokasi',
        'deskripsiBarang',
        'createDate',
        'hargaBarang',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class, 'id_lokasi', 'id_lokasi');
    }
}