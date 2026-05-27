<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lokasi extends Model
{
    use HasFactory;

    protected $table = 'lokasi';
    protected $primaryKey = 'id_lokasi';

    protected $fillable = [
        'namaLokasi',
    ];

    public function detailStoks()
    {
        return $this->hasMany(DetailStok::class, 'id_lokasi', 'id_lokasi');
    }

    public function histories()
    {
        return $this->hasMany(History::class, 'id_lokasi', 'id_lokasi');
    }
}