<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BarangUpdateRequest extends FormRequest
{
    public function authorize()
    {
        // Hanya Admin yang boleh update barang
        return auth()->user()->hasRole('Admin');
    }

    public function rules()
    {
        return [
            'namaBarang' => 'required|string|max:100',
            'gambar'     => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'kategori'   => 'nullable|string|max:50',
        ];
    }
}