<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $table = 'history';

    protected $fillable = [
        'id_barang',
        'id_lokasi',
        'id_lokasi_tujuan',
        'keterangan',
        'id_user',
        'qty_perubahan',
        'jenis_perubahan',
        'stokSebelum',
        'stokSesudah',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class, 'id_lokasi', 'id_lokasi');
    }

    public function lokasiTujuan()
    {
        return $this->belongsTo(Lokasi::class, 'id_lokasi_tujuan', 'id_lokasi');
    }
}