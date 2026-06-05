<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use HasFactory;

    protected $table = 'kategori';
    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'namaKategori',
    ];

    /**
     * Get the subcategories for the category.
     */
    public function subKategoris()
    {
        return $this->hasMany(SubKategori::class, 'id_kategori', 'id_kategori');
    }

    /**
     * Get the barang for this category (usually subcategories have barang).
     */
    public function barang()
    {
        return $this->hasMany(Barang::class, 'id_sub_kategori', 'id_kategori');
    }
}
