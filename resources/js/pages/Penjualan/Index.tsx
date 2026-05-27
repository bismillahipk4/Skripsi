import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface HistoryItem {
    id_history: number;
    created_at: string;
    qty_perubahan: number;
    jenis_perubahan: string;
    stokSebelum: number | null;
    stokSesudah: number | null;
    keterangan: string | null;
    lokasi_asal_nama: string | null;
    barang: { id_barang: number; namaBarang: string };
    user?: { name: string } | null;
}

interface PaginatedHistories {
    data: HistoryItem[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
}

interface Lokasi {
    id_lokasi: number;
    namaLokasi: string;
}

interface DetailStok {
    id_lokasi: number;
    jumlahDiLokasi: number;
    lokasi: Lokasi;
}

interface Barang {
    id_barang: number;
    namaBarang: string;
    detail_stoks: DetailStok[];
}

interface Props {
    histories: PaginatedHistories;
    barang: Barang[];
    filters: {
        search?: string;
        tanggal_dari?: string;
        tanggal_sampai?: string;
    };
    errors: Record<string, string>;
}

export default function PenjualanIndex({ histories, barang, filters, errors }: Props) {
    const { auth } = usePage<{ auth: { user: { role?: string } } }>().props;
    const isAdmin = auth.user.role === 'Admin';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Penjualan', href: '/penjualan' },
    ];

    const [search, setSearch] = useState(filters.search ?? '');
    const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari ?? '');
    const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai ?? '');

    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset, clearErrors } = useForm({
        id_barang: '',
        id_lokasi_asal: '',
        jumlah: '',
        keterangan: '',
    });

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/penjualan', { 
            search, 
            tanggal_dari: tanggalDari, 
            tanggal_sampai: tanggalSampai 
        }, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        setSearch(''); 
        setTanggalDari(''); 
        setTanggalSampai('');
        router.get('/penjualan', {}, { preserveState: true, replace: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/penjualan', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const closeForm = () => {
        setShowModal(false);
        reset();
        clearErrors();
    };

    const selectedBarang = barang.find(b => b.id_barang === Number(data.id_barang));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penjualan" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Penjualan</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Kelola transaksi penjualan barang</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    if (search) params.set('search', search);
                                    if (tanggalDari) params.set('tanggal_dari', tanggalDari);
                                    if (tanggalSampai) params.set('tanggal_sampai', tanggalSampai);
                                    const qs = params.toString();
                                    window.open(`/penjualan/cetak${qs ? '?' + qs : ''}`, '_blank');
                                }}
                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                                Cetak Laporan
                            </button>
                        )}

                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 active:scale-95 transition-all dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Tambah Penjualan
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-5 dark:bg-neutral-900">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                            <button type="submit" className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900">Terapkan</button>
                            <button type="button" onClick={resetFilter} className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400">Reset</button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border flex-1 overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Tanggal</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Barang</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Lokasi Asal</th>
                                    <th className="px-5 py-3 text-center text-xs font-medium text-neutral-500">Jumlah Terjual</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Keterangan</th>
                                    <th className="px-5 py-3 text-left text-xs font-medium text-neutral-500">Kasir/User</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {histories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-neutral-400">Belum ada riwayat penjualan.</td>
                                    </tr>
                                ) : (
                                    histories.data.map((h) => (
                                        <tr key={h.id_history} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="px-5 py-3 text-sm text-neutral-500">
                                                {new Date(h.created_at).toLocaleDateString('id-ID', { 
                                                    day: '2-digit', month: 'short', year: 'numeric', 
                                                    hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </td>
                                            <td className="px-5 py-3 text-sm font-medium">{h.barang.namaBarang}</td>
                                            <td className="px-5 py-3 text-sm text-neutral-600 dark:text-neutral-400">{h.lokasi_asal_nama ?? '-'}</td>
                                            <td className="px-5 py-3 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400">{h.qty_perubahan} pcs</td>
                                            <td className="px-5 py-3 text-sm text-neutral-500 max-w-xs truncate">{h.keterangan ?? '-'}</td>
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

            {/* Modal Tambah Penjualan */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
                    <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Tambah Penjualan</h2>
                            <button onClick={closeForm} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Barang</label>
                                <select 
                                    className={`w-full rounded-lg border ${errors.id_barang ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} px-3 py-2 text-sm focus:border-neutral-500 dark:bg-neutral-900 dark:text-white`}
                                    value={data.id_barang}
                                    onChange={e => {
                                        setData('id_barang', e.target.value);
                                        setData('id_lokasi_asal', ''); // Reset lokasi saat barang berubah
                                    }}
                                >
                                    <option value="" disabled>Pilih Barang</option>
                                    {barang.map(b => (
                                        <option key={b.id_barang} value={b.id_barang}>{b.namaBarang}</option>
                                    ))}
                                </select>
                                {errors.id_barang && <p className="mt-1 text-xs text-red-500">{errors.id_barang}</p>}
                            </div>

                            {selectedBarang && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Lokasi Stok Tersedia</label>
                                    <select 
                                        className={`w-full rounded-lg border ${errors.id_lokasi_asal ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} px-3 py-2 text-sm focus:border-neutral-500 dark:bg-neutral-900 dark:text-white`}
                                        value={data.id_lokasi_asal}
                                        onChange={e => setData('id_lokasi_asal', e.target.value)}
                                    >
                                        <option value="" disabled>Pilih Lokasi</option>
                                        {selectedBarang.detail_stoks.filter(d => d.jumlahDiLokasi > 0).map(d => (
                                            <option key={d.id_lokasi} value={d.id_lokasi}>
                                                {d.lokasi?.namaLokasi} (Stok: {d.jumlahDiLokasi})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_lokasi_asal && <p className="mt-1 text-xs text-red-500">{errors.id_lokasi_asal}</p>}
                                    {selectedBarang.detail_stoks.filter(d => d.jumlahDiLokasi > 0).length === 0 && (
                                        <p className="mt-1 text-xs text-red-500">Tidak ada stok tersedia untuk barang ini di lokasi manapun.</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Jumlah Terjual</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className={`w-full rounded-lg border ${errors.jumlah ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} px-3 py-2 text-sm focus:border-neutral-500 dark:bg-neutral-900 dark:text-white`}
                                    value={data.jumlah}
                                    onChange={e => setData('jumlah', e.target.value)}
                                    placeholder="Contoh: 5"
                                />
                                {errors.jumlah && <p className="mt-1 text-xs text-red-500">{errors.jumlah}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Keterangan (Opsional)</label>
                                <textarea 
                                    className={`w-full rounded-lg border ${errors.keterangan ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} px-3 py-2 text-sm focus:border-neutral-500 dark:bg-neutral-900 dark:text-white resize-none`}
                                    value={data.keterangan}
                                    onChange={e => setData('keterangan', e.target.value)}
                                    placeholder="Catatan penjualan..."
                                    rows={3}
                                />
                                {errors.keterangan && <p className="mt-1 text-xs text-red-500">{errors.keterangan}</p>}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-70 dark:bg-neutral-100 dark:text-neutral-900"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Penjualan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
