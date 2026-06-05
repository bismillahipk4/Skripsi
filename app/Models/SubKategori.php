<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubKategori extends Model
{
    use HasFactory;

    protected $table = 'sub_kategori';
    protected $primaryKey = 'id_sub_kategori';

    protected $fillable = [
        'id_kategori',
        'namaSubKategori',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }

    public function barangs()
    {
        return $this->hasMany(Barang::class, 'id_sub_kategori', 'id_sub_kategori');
    }
}
