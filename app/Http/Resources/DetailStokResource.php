<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DetailStokResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id_detailstok'   => $this->id_detailstok,
            'id_barang'       => $this->id_barang,
            'id_lokasi'       => $this->id_lokasi,
            'jumlahDiLokasi'  => $this->jumlahDiLokasi,
            'deskripsiBarang' => $this->deskripsiBarang,
            'createDate'      => $this->createDate,
            'hargaBarang'     => $this->hargaBarang,
            'barang'          => $this->whenLoaded('barang', fn() => [
                'namaBarang' => $this->barang->namaBarang,
                'kategori'   => $this->barang->kategori,
            ]),
            'lokasi'          => $this->whenLoaded('lokasi', fn() => [
                'namaLokasi' => $this->lokasi->namaLokasi,
            ]),
            'created_at'      => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'      => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}