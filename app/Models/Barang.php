<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    protected $table = 'barang';
    protected $primaryKey = 'id_barang';

    protected $fillable = [
        'namaBarang',
        'gambar',
        'id_sub_kategori',
    ];

    public function subKategori()
    {
        return $this->belongsTo(Kategori::class, 'id_sub_kategori', 'id_kategori');
    }

    public function stok()
    {
        return $this->hasOne(\App\Models\Stok::class, 'id_barang', 'id_barang');
    }

    public function detailStoks()
    {
        return $this->hasMany(\App\Models\DetailStok::class, 'id_barang', 'id_barang');
    }
    
}