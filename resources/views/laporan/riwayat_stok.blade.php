<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $judul }}</title>
    <style>
        /* Reset & Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1a1a1a;
            background: #f5f5f5;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .page {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            padding: 40px;
            min-height: 100vh;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h2 {
            margin: 0 0 8px 0;
            font-size: 20px;
        }
        .header .periode {
            font-size: 13px;
            color: #555;
        }
        .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
            color: #444;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 10px;
            text-align: left;
        }
        th {
            background-color: #f8f8f8;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            color: #333;
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        tbody tr:nth-child(even) {
            background-color: #fafafa;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
        }
        .badge-masuk { background-color: #d1fae5; color: #065f46; }
        .badge-keluar { background-color: #ffe4e6; color: #9f1239; }
        .summary {
            margin-top: 30px;
            border-top: 2px solid #333;
            padding-top: 15px;
        }
        .summary-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 8px;
            gap: 15px;
            font-size: 14px;
        }
        .summary-label { font-weight: bold; color: #333; }
        .summary-value { font-weight: bold; color: #111; }
        .footer-note {
            margin-top: 40px;
            font-size: 11px;
            color: #999;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        
        /* Print Actions */
        .print-actions {
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
        }
        .print-actions button {
            background: #111;
            color: #fff;
            border: none;
            padding: 10px 32px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }
        .print-actions button:hover { background: #333; }

        /* Print Styles */
        @media print {
            @page { size: landscape; margin: 15mm; }
            body { background: #fff; padding: 0; }
            .page { max-width: none; padding: 0; min-height: auto; }
            .print-actions { display: none; }
            th { background-color: #f0f0f0 !important; }
        }
    </style>
</head>
<body>
    <div class="print-actions">
        <button onclick="window.print()">🖨️ Cetak Laporan</button>
    </div>

    <div class="page">
        {{-- Header --}}
        <div class="header">
            <h2>{{ $judul }}</h2>
        @if($tglAwal && $tglAkhir)
            <p class="periode">Periode: {{ \Carbon\Carbon::parse($tglAwal)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($tglAkhir)->translatedFormat('d F Y') }}</p>
        @elseif($tglAwal)
            <p class="periode">Dari: {{ \Carbon\Carbon::parse($tglAwal)->translatedFormat('d F Y') }}</p>
        @elseif($tglAkhir)
            <p class="periode">Sampai: {{ \Carbon\Carbon::parse($tglAkhir)->translatedFormat('d F Y') }}</p>
        @else
            <p class="periode">Seluruh Periode</p>
        @endif
    </div>

    {{-- Meta info --}}
    <div class="meta-info">
        <div class="meta-left">Dicetak oleh: <strong>{{ $pencetak }}</strong></div>
        <div class="meta-right">Dicetak pada: <strong>{{ $timestamp }}</strong></div>
    </div>

    {{-- Table --}}
    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 30px;">No</th>
                <th style="width: 110px;">Tanggal</th>
                <th>Nama Barang</th>

                @if($tab === 'mutasi')
                    <th>Lokasi</th>
                    <th class="text-center">Aksi</th>
                @else
                    <th>Pergerakan</th>
                    <th class="text-center">Jenis</th>
                    <th class="text-center">Stok Sblm</th>
                    <th class="text-center">Stok Ssdh</th>
                @endif

                <th class="text-center" style="width: 50px;">Qty</th>

                @if($tab === 'aktivitas')
                    <th>User</th>
                @endif

                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->created_at->format('d/m/Y H:i') }}</td>
                <td>{{ $item->barang->namaBarang ?? '-' }}</td>

                @if($tab === 'mutasi')
                    <td>{{ $item->lokasi_mutasi ?? '-' }}</td>
                    <td class="text-center">
                        <span class="badge {{ strtolower($item->aksi ?? '') === 'masuk' ? 'badge-masuk' : 'badge-keluar' }}">
                            {{ ucfirst($item->aksi ?? '-') }}
                        </span>
                    </td>
                @else
                    <td>
                        @if($item->jenis_perubahan === 'pindah')
                            {{ $item->lokasi->namaLokasi ?? '-' }} &rarr; {{ $item->lokasiTujuan->namaLokasi ?? '-' }}
                        @else
                            {{ $item->lokasi->namaLokasi ?? '-' }}
                        @endif
                    </td>
                    <td class="text-center">{{ ucfirst($item->jenis_perubahan ?? '-') }}</td>
                    <td class="text-center">{{ $item->stokSebelum ?? '-' }}</td>
                    <td class="text-center">{{ $item->stokSesudah ?? '-' }}</td>
                @endif

                <td class="text-center">{{ $item->qty_perubahan ?? '-' }}</td>

                @if($tab === 'aktivitas')
                    <td>{{ $item->user->name ?? 'System' }}</td>
                @endif

                <td>{{ $item->keterangan ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center" style="padding: 20px; color: #999;">Tidak ada data untuk ditampilkan.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    {{-- Summary --}}
    <div class="summary">
        @if($tab === 'mutasi')
            <div class="summary-row">
                <span class="summary-label">Total Barang Masuk:</span>
                <span class="summary-value">{{ number_format($totalMasuk, 0, ',', '.') }} pcs</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Total Barang Keluar:</span>
                <span class="summary-value">{{ number_format($totalKeluar, 0, ',', '.') }} pcs</span>
            </div>
        @else
            <div class="summary-row">
                <span class="summary-label">Total Aktivitas Tercatat:</span>
                <span class="summary-value">{{ number_format($totalAktivitas, 0, ',', '.') }} transaksi</span>
            </div>
        @endif
    </div>

    {{-- Footer --}}
    <div class="footer-note">
        Laporan ini digenerate secara otomatis oleh sistem. &mdash; {{ config('app.name', 'Inventaris') }}
    </div>

    </div> <!-- End .page -->

    <script>
        // Auto-open print dialog when page loads
        window.addEventListener('load', function() {
            setTimeout(function() { window.print(); }, 500);
        });
    </script>
</body>
</html>
