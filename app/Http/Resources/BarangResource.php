<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BarangResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_barang'   => $this->id_barang,
            'namaBarang'  => $this->namaBarang,
            'gambar'      => $this->gambar,
            'kategori'    => $this->kategori,
            'created_at'  => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at'  => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}