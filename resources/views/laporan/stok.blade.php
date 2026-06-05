<!DOCTYPE html>
<html>
<head>
    <title>Laporan Stok</title>
    <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        .header { text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>{{ $judul }}</h2>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Lokasi</th>
                <th>Jumlah Stok</th>
                <th>Harga</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->barang->namaBarang ?? '-' }}</td>
                <td>{{ $item->lokasi->namaLokasi ?? '-' }}</td>
                <td>{{ $item->jumlahDiLokasi }}</td>
                <td>Rp {{ number_format($item->barang->hargaBarang ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>