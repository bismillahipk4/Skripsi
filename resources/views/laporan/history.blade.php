<!DOCTYPE html>
<html>
<head>
    <title>Laporan Riwayat</title>
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
        @if($tglAwal && $tglAkhir)
            <p>Periode: {{ $tglAwal }} s/d {{ $tglAkhir }}</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama Barang</th>
                @if(isset($tab) && $tab === 'mutasi')
                    <th>Lokasi</th>
                    <th>Aksi</th>
                @else
                    <th>Asal &rarr; Tujuan</th>
                    <th>Jenis</th>
                @endif
                <th>Qty</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $item->created_at->format('d/m/Y H:i') }}</td>
                <td>{{ $item->barang->namaBarang ?? '-' }}</td>
                
                @if(isset($tab) && $tab === 'mutasi')
                    <td>{{ $item->lokasi_mutasi ?? '-' }}</td>
                    <td>{{ ucfirst($item->aksi ?? '-') }}</td>
                @else
                    <td>
                        @if($item->jenis_perubahan === 'pindah')
                            {{ $item->lokasi->namaLokasi ?? '-' }} &rarr; {{ $item->lokasiTujuan->namaLokasi ?? '-' }}
                        @else
                            {{ $item->lokasi->namaLokasi ?? '-' }}
                        @endif
                    </td>
                    <td>{{ ucfirst($item->jenis_perubahan ?? '-') }}</td>
                @endif
                
                <td>{{ $item->qty_perubahan ?? '-' }}</td>
                <td>{{ $item->keterangan ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>