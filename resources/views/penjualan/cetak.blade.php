<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Penjualan</title>
    <style>
        /* ── Reset & Base ── */
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
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 48px;
        }

        /* ── Header ── */
        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e5e5;
        }

        .header h1 {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #111;
            margin-bottom: 6px;
        }

        .header .subtitle {
            font-size: 13px;
            color: #666;
        }

        /* ── Meta Info ── */
        .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 24px;
            margin-bottom: 24px;
            font-size: 12px;
            color: #555;
        }

        .meta .label {
            font-weight: 600;
            color: #333;
        }

        /* ── Table ── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 13px;
        }

        thead th {
            background: #f8f8f8;
            border-top: 2px solid #333;
            border-bottom: 1px solid #ddd;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #555;
        }

        thead th.text-center { text-align: center; }
        thead th.text-right  { text-align: right; }

        tbody td {
            padding: 9px 12px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }

        tbody tr:hover { background: #fafafa; }

        .text-center { text-align: center; }
        .text-right  { text-align: right; }
        .font-medium { font-weight: 500; }

        .empty-row td {
            text-align: center;
            padding: 40px 12px;
            color: #aaa;
            font-style: italic;
        }

        /* ── Total ── */
        .total-row {
            border-top: 2px solid #333;
            padding: 16px 0;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 16px;
            font-size: 15px;
        }

        .total-row .total-label {
            font-weight: 600;
            color: #333;
        }

        .total-row .total-value {
            font-weight: 700;
            font-size: 18px;
            color: #111;
        }

        /* ── Footer ── */
        .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e5e5e5;
            font-size: 11px;
            color: #999;
            text-align: center;
        }

        /* ── No-print button ── */
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

        .print-actions button:hover {
            background: #333;
        }

        /* ── Print Styles ── */
        @media print {
            body { background: #fff; padding: 0; }
            .page { max-width: none; padding: 24px; box-shadow: none; }
            .print-actions { display: none; }
            thead th { background: #f0f0f0 !important; }
        }
    </style>
</head>
<body>

<div class="print-actions">
    <button onclick="window.print()">🖨️ Cetak Laporan</button>
</div>

<div class="page">
    <!-- Header -->
    <div class="header">
        <h1>Laporan Penjualan</h1>
        <p class="subtitle">Sistem Manajemen Inventaris</p>
    </div>

    <!-- Meta -->
    <div class="meta">
        <div>
            <span class="label">Dicetak pada:</span>
            {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB
        </div>
        @if(!empty($filters['tanggal_dari']) || !empty($filters['tanggal_sampai']))
        <div>
            <span class="label">Periode:</span>
            {{ !empty($filters['tanggal_dari']) ? \Carbon\Carbon::parse($filters['tanggal_dari'])->translatedFormat('d M Y') : '—' }}
            s.d.
            {{ !empty($filters['tanggal_sampai']) ? \Carbon\Carbon::parse($filters['tanggal_sampai'])->translatedFormat('d M Y') : '—' }}
        </div>
        @endif
        @if(!empty($filters['search']))
        <div>
            <span class="label">Pencarian:</span>
            "{{ $filters['search'] }}"
        </div>
        @endif
        <div>
            <span class="label">Jumlah Transaksi:</span>
            {{ $histories->count() }}
        </div>
    </div>

    <!-- Table -->
    <table>
        <thead>
            <tr>
                <th style="width: 30px;">No</th>
                <th>Tanggal</th>
                <th>Nama Barang</th>
                <th>Lokasi</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($histories as $i => $h)
                @php
                    $harga = (float) ($h->barang->detailStoks->first()?->hargaBarang ?? 0);
                    $subtotal = $harga * $h->qty_perubahan;
                @endphp
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($h->created_at)->timezone('Asia/Jakarta')->format('d/m/Y H:i') }}</td>
                    <td class="font-medium">{{ $h->barang->namaBarang }}</td>
                    <td>{{ $h->lokasi_asal_nama ?? '-' }}</td>
                    <td class="text-center">{{ $h->qty_perubahan }}</td>
                    <td class="text-right">Rp {{ number_format($harga, 0, ',', '.') }}</td>
                    <td class="text-right font-medium">Rp {{ number_format($subtotal, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr class="empty-row">
                    <td colspan="7">Tidak ada data penjualan pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if($histories->count() > 0)
    <!-- Total -->
    <div class="total-row">
        <span class="total-label">Total Penjualan:</span>
        <span class="total-value">Rp {{ number_format($totalPenjualan, 0, ',', '.') }}</span>
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        Laporan ini digenerate secara otomatis oleh Sistem Manajemen Inventaris &mdash; {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') }} WIB
    </div>
</div>

<script>
    // Auto-open print dialog when page loads
    window.addEventListener('load', function() {
        setTimeout(function() { window.print(); }, 500);
    });
</script>

</body>
</html>
