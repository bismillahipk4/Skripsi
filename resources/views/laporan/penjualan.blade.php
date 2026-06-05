<!DOCTYPE html>
<html>
<head>
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        .header { text-align: center; margin-bottom: 30px; }
        .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $judul }}</h2>
        @if($tglAwal && $tglAkhir)
            <p>Periode: {{ $tglAwal }} s/d {{ $tglAkhir }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Tanggal</th>
                <th>Qty Terjual</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->barang->namaBarang ?? '-' }}</td>
                <td>{{ $item->created_at->format('d/m/Y') }}</td>
                <td>{{ $item->qty_perubahan }}</td>
                <td>Rp {{ number_format($item->barang->hargaBarang ?? 0, 0, ',', '.') }}</td>
                <td>Rp {{ number_format(($item->qty_perubahan * ($item->barang->hargaBarang ?? 0)), 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        Total Penjualan: Rp {{ number_format($data->sum(fn($item) => $item->qty_perubahan * ($item->barang->hargaBarang ?? 0)), 0, ',', '.') }}
    </div>
</body>
</html>