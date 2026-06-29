<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpnameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_lokasi',
        'status',
        'keterangan',
        'id_user_staff',
        'id_user_admin',
    ];

    public function lokasi()
    {
        return $this->belongsTo(Lokasi::class, 'id_lokasi', 'id_lokasi');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'id_user_staff', 'id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'id_user_admin', 'id');
    }

    public function details()
    {
        return $this->hasMany(OpnameDetail::class, 'id_opname_session', 'id');
    }
}
