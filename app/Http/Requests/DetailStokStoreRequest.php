<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DetailStokStoreRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user()->hasRole('Admin');
    }

    public function rules()
    {
        return [
            'id_barang'      => 'required|exists:barang,id_barang',
            'id_lokasi'      => 'required|exists:lokasi,id_lokasi',
            'jumlahDiLokasi' => 'required|integer|min:0',
            'deskripsiBarang'=> 'nullable|string',
            'createDate'     => 'nullable|date',
            'hargaBarang'    => 'nullable|numeric|min:0',
        ];
    }
}