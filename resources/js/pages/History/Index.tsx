import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface HistoryItem {
    id: string | number;
    id_history?: number;
    created_at: string;
    qty_perubahan: number;
    jenis_perubahan: string;
    stokSebelum: number | null;
    stokSesudah: number | null;
    keterangan: string | null;
    lokasi_asal_nama: string | null;
    lokasi_tujuan_nama: string | null;
    barang: { namaBarang: string };
    user?: { name: string } | null;
    lokasi_mutasi?: string | null;
    aksi?: string;
}

interface PaginatedHistories {
    data: HistoryItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
}

interface Props {
    histories: PaginatedHistories;
    filters: {
        search?: string;
        jenis?: string;
        tanggal_dari?: string;
        tanggal_sampai?: string;
        tab?: string;
    };
}

const JENIS_COLORS: Record<string, string> = {
    tambah: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    masuk:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    keluar: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    pindah: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    terjual: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

function jenisBadgeClass(jenis: string) {
    return JENIS_COLORS[jenis] ?? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
}

export default function HistoryIndex({ histories, filters }: Props) {
    const { auth } = usePage<{ auth: { user: { role?: string } } }>().props;
    const isAdmin = auth.user.role === 'Admin';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Riwayat Stok', href: '#' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [jenis, setJenis] = useState(filters.jenis ?? '');
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari ?? '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai ?? '');
    const [activeTab, setActiveTab] = useState(filters.tab ?? 'aktivitas');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/history', { 
            search, 
            jenis, 
            tanggal_dari: tanggalDari, 
            tanggal_sampai: tanggalSampai,
            tab: activeTab
        }, { preserveState: true, replace: true });
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        setJenis(''); // Reset jenis filter on tab change
        router.get('/history', { 
            search, 
            jenis: '', 
            tanggal_dari: tanggalDari, 
            tanggal_sampai: tanggalSampai,
            tab: newTab
        }, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        setSearch(''); 
        setJenis(''); 
        setTanggalDari(''); 
        setTanggalSampai('');
        router.get('/history', { tab: activeTab }, { preserveState: true, replace: true });
    };

    const handleCetakLaporan = async () => {
        setIsDownloading(true);

        try {
            const params = new URLSearchParams();
            params.append('jenis_laporan', 'history');
            if (filters.tanggal_dari) params.append('tanggal_awal', filters.tanggal_dari);
            if (filters.tanggal_sampai) params.append('tanggal_akhir', filters.tanggal_sampai);
            if (filters.jenis) params.append('jenis_perubahan', filters.jenis);
            if (filters.search) params.append('search', filters.search);
            params.append('tab', activeTab);

            // Buka tab baru untuk print (sama seperti fitur Penjualan)
            window.open(`/laporan/generate?${params.toString()}`, '_blank');
            setShowModal(false);
        } catch (err) {
            alert('Terjadi kesalahan saat membuka laporan. Silakan coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Ringkasan filter aktif untuk ditampilkan di modal
    const activeFilters = [
        filters.search && `Barang: "${filters.search}"`,
        filters.jenis && `Jenis: ${filters.jenis}`,
        filters.tanggal_dari && `Dari: ${filters.tanggal_dari}`,
        filters.tanggal_sampai && `Sampai: ${filters.tanggal_sampai}`,
    ].filter(Boolean);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Stok" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Riwayat Stok</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Semua perubahan stok barang</p>
                    </div>

                    {/* Tombol Cetak Laporan */}
                    {isAdmin && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 active:scale-95 transition-all dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            Cetak Laporan
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                    <button
                        onClick={() => handleTabChange('aktivitas')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'aktivitas' 
                                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                        }`}
                    >
                        Log Aktivitas
                    </button>
                    <button
                        onClick={() => handleTabChange('mutasi')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'mutasi' 
                                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                        }`}
                    >
                        Mutasi per Lokasi
                    </button>
                </div>

                {/* Filter */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-5 dark:bg-neutral-900">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Cari Barang</label>
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Nama barang..." 
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Jenis</label>
                            <select 
                                value={jenis} 
                                onChange={e => setJenis(e.target.value)} 
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
                            >
                                <option value="">Semua</option>
                                {activeTab === 'aktivitas' ? (
                                    <>
                                        <option value="tambah">Tambah</option>
                                        <option value="pindah">Pindah</option>
                                        <option value="terjual">Terjual</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="masuk">Masuk</option>
                                        <option value="keluar">Keluar</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Dari Tanggal</label>
                            <input 
                                type="date" 
                                value={tanggalDari} 
                                onChange={e => setTanggalDari(e.target.value)} 
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Sampai Tanggal</label>
                            <input 
                                type="date" 
                                value={tanggalSampai} 
                                onChange={e => setTanggalSampai(e.target.value)} 
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900" 
                            />
                        </div>
                        <div className="flex items-end gap-2 pt-5 md:pt-0">
                            <button type="submit" className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900">Terapkan Filter</button>
                            <button type="button" onClick={resetFilter} className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400">Reset</button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border flex-1 overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                                {activeTab === 'aktivitas' ? (
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Tanggal</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Barang</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Asal → Tujuan</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Jumlah</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Jenis</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Stok Sebelum</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Stok Sesudah</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Keterangan</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">User</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Tanggal</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Barang</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Lokasi</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Aksi</th>
                                        <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Jumlah</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Keterangan</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">User</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {histories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === 'aktivitas' ? 9 : 7} className="px-5 py-12 text-center text-neutral-400">Belum ada riwayat transaksi.</td>
                                    </tr>
                                ) : (
                                    histories.data.map((h) => (
                                        <tr key={h.id ?? h.id_history} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="px-5 py-3 text-sm text-neutral-500">
                                                {new Date(h.created_at).toLocaleDateString('id-ID', { 
                                                    day: '2-digit', month: 'short', year: 'numeric', 
                                                    hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-medium">{h.barang.namaBarang}</td>
                                            
                                            {activeTab === 'aktivitas' ? (
                                                <>
                                                    <td className="px-5 py-3 text-sm">
                                                        <span className="text-neutral-600 dark:text-neutral-400">
                                                            {h.lokasi_asal_nama ?? '-'} → {h.lokasi_tujuan_nama ?? '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-medium">{h.qty_perubahan} pcs</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${jenisBadgeClass(h.jenis_perubahan)}`}>
                                                            {h.jenis_perubahan}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm text-neutral-600">{h.stokSebelum ?? '-'}</td>
                                                    <td className="px-5 py-3 text-center text-sm text-neutral-600">{h.stokSesudah ?? '-'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-5 py-3 text-sm text-neutral-600 dark:text-neutral-400">{h.lokasi_mutasi ?? '-'}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${jenisBadgeClass(h.aksi ?? '')}`}>
                                                            {h.aksi}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center text-sm font-medium">{h.qty_perubahan} pcs</td>
                                                </>
                                            )}
                                            
                                            <td className="px-5 py-3 text-sm text-neutral-500 max-w-xs truncate" title={h.keterangan ?? ''}>{h.keterangan ?? '-'}</td>
                                            <td className="px-5 py-3 text-sm text-neutral-500">{h.user?.name ?? 'System'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {histories.links && histories.links.length > 0 && (
                        <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <div className="text-sm text-neutral-500">
                                Halaman {histories.current_page} dari {histories.last_page}
                            </div>
                            <div className="flex gap-1">
                                {histories.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`rounded-lg px-3 py-1 text-sm ${
                                            link.active 
                                                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' 
                                                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Cetak */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isDownloading && setShowModal(false)}
                    />

                    {/* Modal Panel */}
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
                        {/* Header */}
                        <div className="mb-5 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700 dark:text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 6 2 18 2 18 9" />
                                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                        <rect x="6" y="14" width="12" height="8" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Cetak Laporan</h2>
                                    <p className="text-xs text-neutral-500">Laporan Riwayat Pergerakan Stok</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isDownloading}
                                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50 dark:hover:bg-neutral-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Filter summary */}
                        <div className="mb-5 rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                            <p className="mb-2 text-xs font-medium text-neutral-500">Filter yang akan diterapkan:</p>
                            {activeFilters.length > 0 ? (
                                <ul className="space-y-1">
                                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                        Tab: {activeTab === 'mutasi' ? 'Mutasi per Lokasi' : 'Log Aktivitas'}
                                    </li>
                                    {activeFilters.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="space-y-1">
                                    <li className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                        Tab: {activeTab === 'mutasi' ? 'Mutasi per Lokasi' : 'Log Aktivitas'}
                                    </li>
                                </ul>
                            )}
                        </div>

                        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                            Laporan akan diunduh dalam format <span className="font-medium text-neutral-800 dark:text-neutral-200">PDF</span>. Lanjutkan?
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isDownloading}
                                className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCetakLaporan}
                                disabled={isDownloading}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-70 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300 transition-colors"
                            >
                                {isDownloading ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Mengunduh...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Unduh PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}