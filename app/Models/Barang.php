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
        'kategori',
        'id_sub_kategori',
        'deskripsiBarang',
        'hargaBarang',
    ];

    public function stok()
    {
        return $this->hasOne(Stok::class, 'id_barang', 'id_barang');
    }

    public function detail_stoks()
    {
        return $this->hasMany(DetailStok::class, 'id_barang', 'id_barang');
    }

    public function histories()
    {
        return $this->hasMany(History::class, 'id_barang', 'id_barang');
    }

    public function sub_kategori()
    {
        return $this->belongsTo(SubKategori::class, 'id_sub_kategori', 'id_sub_kategori');
    }
    
}