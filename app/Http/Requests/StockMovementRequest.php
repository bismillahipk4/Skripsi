<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockMovementRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->user()->hasRole(['Admin', 'Staff']);
    }

    public function rules()
    {
        return [
            'id_barang'       => 'required|exists:barang,id_barang',
            'id_lokasi_asal'  => 'required|exists:lokasi,id_lokasi',
            'id_lokasi_tujuan'=> 'required_if:jenis_perubahan,pindah|exists:lokasi,id_lokasi|different:id_lokasi_asal',
            'qty'             => 'required|integer|min:1',
            'jenis_perubahan' => 'required|in:masuk,keluar,pindah',
            'keterangan'      => 'nullable|string|max:255',
        ];
    }

    public function messages()
    {
        return [
            'id_lokasi_tujuan.required_if' => 'Lokasi tujuan wajib diisi jika jenis perubahan adalah pindah.',
            'id_lokasi_tujuan.different'   => 'Lokasi tujuan tidak boleh sama dengan lokasi asal.',
        ];
    }
}