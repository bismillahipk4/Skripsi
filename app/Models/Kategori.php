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
        'parent_id',
    ];

    /**
     * Get the parent category.
     */
    public function parent()
    {
        return $this->belongsTo(Kategori::class, 'parent_id', 'id_kategori');
    }

    /**
     * Get the subcategories.
     */
    public function children()
    {
        return $this->hasMany(Kategori::class, 'parent_id', 'id_kategori');
    }

    /**
     * Get the barang for this category (usually subcategories have barang).
     */
    public function barang()
    {
        return $this->hasMany(Barang::class, 'id_sub_kategori', 'id_kategori');
    }
}
