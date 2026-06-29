import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Lokasi {
    id_lokasi: number;
    namaLokasi: string;
}

interface BarangItem {
    id_barang: number;
    namaBarang: string;
    kategori: string;
    sub_kategori: string;
    stok_sistem: number;
    stok_fisik: string;
}

interface Props {
    lokasiList: Lokasi[];
    barangList: BarangItem[];
    selectedLokasi: number;
}

export default function OpnameIndex({ lokasiList, barangList, selectedLokasi }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Stock Opname', href: '/opname' },
    ];

    const [lokasiId, setLokasiId] = useState<string>(selectedLokasi ? String(selectedLokasi) : '');
    const [items, setItems] = useState<BarangItem[]>(barangList || []);
    const [keterangan, setKeterangan] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setItems(barangList || []);
    }, [barangList]);

    function handleLokasiChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        setLokasiId(val);
        if (val) {
            router.get('/opname', { lokasi_id: val }, { preserveState: true, replace: true });
        } else {
            setItems([]);
        }
    }

    function handleStokFisikChange(id_barang: number, value: string) {
        setItems(prev => prev.map(item => 
            item.id_barang === id_barang ? { ...item, stok_fisik: value } : item
        ));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const payload = {
            id_lokasi: lokasiId,
            keterangan: keterangan,
            items: items.map(item => ({
                id_barang: item.id_barang,
                stok_sistem: item.stok_sistem,
                stok_fisik: item.stok_fisik === '' ? item.stok_sistem : parseInt(item.stok_fisik)
            }))
        };

        router.post('/opname', payload, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setLokasiId('');
                setItems([]);
                setKeterangan('');
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Opname" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Stock Opname</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Sesuaikan jumlah fisik barang di gudang dengan sistem.
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 max-w-md">
                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Pilih Lokasi Opname
                        </label>
                        <select
                            value={lokasiId}
                            onChange={handleLokasiChange}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
                        >
                            <option value="">-- Pilih Lokasi --</option>
                            {lokasiList.map(l => (
                                <option key={l.id_lokasi} value={l.id_lokasi}>{l.namaLokasi}</option>
                            ))}
                        </select>
                    </div>

                    {lokasiId && items.length > 0 && (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                                <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300">
                                        <tr>
                                            <th className="px-4 py-3">Barang</th>
                                            <th className="px-4 py-3">Kategori</th>
                                            <th className="px-4 py-3">Sub Kategori</th>
                                            <th className="px-4 py-3 text-center">Stok Sistem</th>
                                            <th className="px-4 py-3 text-center w-48">Stok Fisik</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {items.map((item) => (
                                            <tr key={item.id_barang} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                                <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">{item.namaBarang}</td>
                                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{item.kategori}</td>
                                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{item.sub_kategori}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                        {item.stok_sistem}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.stok_fisik}
                                                        onChange={(e) => handleStokFisikChange(item.id_barang, e.target.value)}
                                                        placeholder={String(item.stok_sistem)}
                                                        className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-center text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mb-6 max-w-xl">
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Keterangan / Catatan (Opsional)
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={e => setKeterangan(e.target.value)}
                                    rows={2}
                                    placeholder="Tulis catatan opname..."
                                    className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-400 dark:focus:ring-neutral-400"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Draft Opname'}
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {lokasiId && items.length === 0 && (
                        <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                            Tidak ada barang di lokasi ini.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
