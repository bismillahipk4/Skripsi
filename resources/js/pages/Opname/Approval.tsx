import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface OpnameDetail {
    id: number;
    id_barang: number;
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    barang: {
        namaBarang: string;
        kodeBarang: string;
    };
}

interface OpnameSession {
    id: number;
    status: string;
    keterangan: string | null;
    created_at: string;
    lokasi: { namaLokasi: string };
    staff: { name: string };
    details: OpnameDetail[];
}

interface Props {
    sessions: {
        data: OpnameSession[];
        current_page: number;
        last_page: number;
        links: any[];
    };
}

export default function OpnameApproval({ sessions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Approval Opname', href: '/opname/approval' },
    ];

    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedSession, setSelectedSession] = useState<OpnameSession | null>(null);

    function handleApprove(id: number) {
        if (!confirm('Anda yakin ingin MENYETUJUI opname ini? Stok akan diperbarui secara permanen.')) return;
        
        setProcessingId(id);
        router.post(`/opname/${id}/approve`, {}, {
            onFinish: () => {
                setProcessingId(null);
                setSelectedSession(null);
            },
        });
    }

    function handleReject(id: number) {
        if (!confirm('Anda yakin ingin MENOLAK opname ini?')) return;
        
        setProcessingId(id);
        router.post(`/opname/${id}/reject`, {}, {
            onFinish: () => {
                setProcessingId(null);
                setSelectedSession(null);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approval Stock Opname" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Approval Stock Opname</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Persetujuan penyesuaian stok dari hasil opname staf.
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300">
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Lokasi</th>
                                    <th className="px-6 py-4">Staf Pembuat</th>
                                    <th className="px-6 py-4">Total Item Selisih</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {sessions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                                            Tidak ada data approval yang menunggu.
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.data.map((session) => (
                                        <tr key={session.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4">{new Date(session.created_at).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{session.lokasi.namaLokasi}</td>
                                            <td className="px-6 py-4">{session.staff.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                                    {session.details.length} Item
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {session.status === 'pending' && (
                                                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Menunggu
                                                    </span>
                                                )}
                                                {session.status === 'approved' && (
                                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        Disetujui
                                                    </span>
                                                )}
                                                {session.status === 'rejected' && (
                                                    <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                                                        Ditolak
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedSession(session)}
                                                    className="inline-flex rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                >
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedSession(null)}
                    />
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 flex flex-col">
                        <div className="border-b border-neutral-100 px-6 py-4 dark:border-neutral-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    Detail Opname - {selectedSession.lokasi.namaLokasi}
                                </h3>
                                <p className="text-sm text-neutral-500">Oleh: {selectedSession.staff.name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            {selectedSession.keterangan && (
                                <div className="mb-6 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300">
                                    <strong>Catatan:</strong> {selectedSession.keterangan}
                                </div>
                            )}

                            <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                                <thead className="bg-neutral-50 text-xs uppercase text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-4 py-3">Barang</th>
                                        <th className="px-4 py-3 text-center">Sistem</th>
                                        <th className="px-4 py-3 text-center">Fisik</th>
                                        <th className="px-4 py-3 text-center">Selisih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {selectedSession.details.map((detail) => (
                                        <tr key={detail.id}>
                                            <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                                                {detail.barang.kodeBarang} - {detail.barang.namaBarang}
                                            </td>
                                            <td className="px-4 py-3 text-center">{detail.stok_sistem}</td>
                                            <td className="px-4 py-3 text-center font-bold text-neutral-900 dark:text-white">
                                                {detail.stok_fisik}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    detail.selisih > 0 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                }`}>
                                                    {detail.selisih > 0 ? '+' : ''}{detail.selisih}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-800/20">
                            {selectedSession.status === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => handleReject(selectedSession.id)}
                                        disabled={processingId === selectedSession.id}
                                        className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 active:scale-95 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                                    >
                                        {processingId === selectedSession.id ? 'Memproses...' : 'Tolak'}
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedSession.id)}
                                        disabled={processingId === selectedSession.id}
                                        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 active:scale-95 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                    >
                                        {processingId === selectedSession.id ? 'Memproses...' : 'Setujui & Update Stok'}
                                    </button>
                                </>
                            ) : (
                                <span className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                                    selectedSession.status === 'approved' 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                }`}>
                                    Opname ini telah {selectedSession.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
