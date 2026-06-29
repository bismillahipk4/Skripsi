<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpnameDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_opname_session',
        'id_barang',
        'stok_sistem',
        'stok_fisik',
        'selisih',
    ];

    public function session()
    {
        return $this->belongsTo(OpnameSession::class, 'id_opname_session', 'id');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }
}
