import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { getBadgeClass } from './Index';

// ── Types ──────────────────────────────────────────────────────────────────
interface Lokasi {
    id_lokasi: number;
    namaLokasi: string;
}

interface DetailStok {
    id_detailstok: number;
    id_barang: number;
    id_lokasi: number;
    jumlahDiLokasi: number;
    deskripsiBarang: string | null;
    hargaBarang: string | null;
    createDate: string | null;
    lokasi: Lokasi;
}

interface Stok {
    id_stok: number;
    id_barang: number;
    stok_total: number;
}

interface Kategori {
    id_kategori: number;
    namaKategori: string;
}

interface SubKategori {
    id_kategori: number;
    namaKategori: string;
    parent?: Kategori;
}

interface Barang {
    id_barang: number;
    namaBarang: string;
    gambar: string | null;
    id_sub_kategori: number | null;
    sub_kategori?: SubKategori | null;
    created_at: string;
    stok: Stok | null;
    detail_stoks: DetailStok[];
}

interface Props {
    barang: Barang;
    lokasi: Lokasi[];
}

interface PindahForm {
    id_lokasi_asal: string;
    id_lokasi_tujuan: string;
    jumlah: string;
    keterangan: string;
}




function stokBadgeClass(total: number) {
    if (total === 0)  return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    if (total <= 10)  return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Detail({ barang, lokasi }: Props) {
    const { errors, flash } = usePage<{
        errors: Partial<PindahForm>;
        flash: { success?: string };
    }>().props;

    const [showPindah, setShowPindah] = useState(false);
    const [processing, setProcessing] = useState(false);

    const lokasiDenganStok = barang.detail_stoks.filter(d => d.jumlahDiLokasi > 0);

    const [form, setForm] = useState<PindahForm>({
        id_lokasi_asal:   lokasiDenganStok[0] ? String(lokasiDenganStok[0].id_lokasi) : '',
        id_lokasi_tujuan: '',
        jumlah:           '1',
        keterangan:       '',
    });

    const stokTotal    = barang.stok?.stok_total ?? 0;
    const lokasiAsal   = form.id_lokasi_asal ? Number(form.id_lokasi_asal) : null;

    // Lokasi tujuan: semua lokasi kecuali asal
    const lokasiTujuanOptions = lokasi.filter(l => l.id_lokasi !== lokasiAsal);

    // Stok maks dari lokasi asal
    const maxJumlah = lokasiDenganStok.find(d => d.id_lokasi === lokasiAsal)?.jumlahDiLokasi ?? 0;

    // Deskripsi dari detail stok pertama
    const deskripsi = barang.detail_stoks[0]?.deskripsiBarang ?? null;
    const harga = barang.detail_stoks[0]?.hargaBarang ?? null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Barang', href: '/barang' },
        { title: barang.namaBarang, href: '#' },
    ];

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            // Reset tujuan jika asal berubah dan tujuan sama dengan asal baru
            if (name === 'id_lokasi_asal' && next.id_lokasi_tujuan === value) {
                next.id_lokasi_tujuan = '';
            }
            return next;
        });
    }

    function handlePindahSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(`/barang/${barang.id_barang}/pindah`, form, {
            onFinish:  () => setProcessing(false),
            onSuccess: () => setShowPindah(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail — ${barang.namaBarang}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {/* Top bar */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-between rounded-xl border p-4">
                    <div>
                        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            {barang.namaBarang}
                        </h1>
                        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                            Detail informasi barang
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPindah(true)}
                        disabled={lokasiDenganStok.length === 0}
                        className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                    >
                        ↗ Pindahkan Barang
                    </button>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* Foto — kiri */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border bg-white dark:bg-neutral-900">
                        {barang.gambar ? (
                            <img
                                src={`/storage/${barang.gambar}`}
                                alt={barang.namaBarang}
                                className="h-full max-h-80 w-full object-cover lg:max-h-full"
                            />
                        ) : (
                            <div className="flex h-64 items-center justify-center text-5xl text-neutral-300 dark:text-neutral-600 lg:h-full">
                                📦
                            </div>
                        )}
                    </div>

                    {/* Detail info — kanan (2 kolom) */}
                    <div className="flex flex-col gap-4 lg:col-span-2">

                        {/* Info utama */}
                        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white p-5 dark:bg-neutral-900">
                            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                Informasi Barang
                            </h2>
                            <dl className="space-y-3">
                                <DetailRow label="Nama Barang">
                                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                        {barang.namaBarang}
                                    </span>
                                </DetailRow>

                                <DetailRow label="Kategori">
                                    {barang.sub_kategori ? (
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getBadgeClass(barang.sub_kategori.parent?.id_kategori ?? null)}`}>
                                            {barang.sub_kategori.parent?.namaKategori} &gt; {barang.sub_kategori.namaKategori}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-neutral-300 dark:text-neutral-600">—</span>
                                    )}
                                </DetailRow>

                                <DetailRow label="Total Stok">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stokBadgeClass(stokTotal)}`}>
                                        {stokTotal} pcs
                                    </span>
                                </DetailRow>

                                <DetailRow label="Ditambahkan">
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {new Date(barang.created_at).toLocaleDateString('id-ID', {
                                            day: '2-digit', month: 'long', year: 'numeric',
                                        })}
                                    </span>
                                </DetailRow>

                                {harga && (
                                    <DetailRow label="Harga Barang">
                                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                            Rp {Number(harga).toLocaleString('id-ID')}
                                        </span>
                                    </DetailRow>
                                )}

                                {deskripsi && (
                                    <DetailRow label="Deskripsi" alignTop>
                                        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                            {deskripsi}
                                        </p>
                                    </DetailRow>
                                )}
                            </dl>
                        </div>

                        {/* Stok per lokasi */}
                        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-white dark:bg-neutral-900">
                            <div className="border-b border-neutral-100 px-5 py-3.5 dark:border-neutral-800">
                                <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                    Stok per Lokasi
                                </h2>
                            </div>
                            {barang.detail_stoks.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-neutral-400">
                                    Belum ada data stok per lokasi.
                                </p>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {barang.detail_stoks.map(d => (
                                        <div key={d.id_detailstok} className="flex items-center justify-between px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                                    {d.lokasi.namaLokasi}
                                                </span>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stokBadgeClass(d.jumlahDiLokasi)}`}>
                                                {d.jumlahDiLokasi} pcs
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Modal Pindahkan Barang ── */}
            {showPindah && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">

                        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                Pindahkan Barang
                            </h2>
                            <button
                                onClick={() => setShowPindah(false)}
                                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handlePindahSubmit} className="space-y-4 px-5 py-4">

                            {/* Lokasi asal — otomatis dari lokasi yang punya stok */}
                            <Field label="Lokasi Asal" error={errors.id_lokasi_asal}>
                                <select
                                    name="id_lokasi_asal"
                                    value={form.id_lokasi_asal}
                                    onChange={handleChange}
                                    required
                                    className={inputClass(errors.id_lokasi_asal)}
                                >
                                    <option value="">-- Pilih Lokasi Asal --</option>
                                    {lokasiDenganStok.map(d => (
                                        <option key={d.id_lokasi} value={d.id_lokasi}>
                                            {d.lokasi.namaLokasi} ({d.jumlahDiLokasi} pcs)
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* Lokasi tujuan — exclude lokasi asal */}
                            <Field label="Lokasi Tujuan" error={errors.id_lokasi_tujuan}>
                                <select
                                    name="id_lokasi_tujuan"
                                    value={form.id_lokasi_tujuan}
                                    onChange={handleChange}
                                    required
                                    disabled={!form.id_lokasi_asal}
                                    className={inputClass(errors.id_lokasi_tujuan)}
                                >
                                    <option value="">-- Pilih Lokasi Tujuan --</option>
                                    {lokasiTujuanOptions.map(l => (
                                        <option key={l.id_lokasi} value={l.id_lokasi}>
                                            {l.namaLokasi}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* Jumlah */}
                            <Field label={`Jumlah (maks. ${maxJumlah} pcs)`} error={errors.jumlah}>
                                <input
                                    type="number"
                                    name="jumlah"
                                    value={form.jumlah}
                                    onChange={handleChange}
                                    min={1}
                                    max={maxJumlah}
                                    required
                                    className={inputClass(errors.jumlah)}
                                />
                            </Field>

                            {/* Keterangan */}
                            <Field label="Keterangan" error={errors.keterangan}>
                                <textarea
                                    name="keterangan"
                                    value={form.keterangan}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Contoh: Pengiriman ke cabang Surabaya"
                                    className={inputClass(errors.keterangan) + ' resize-none'}
                                />
                            </Field>



                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPindah(false)}
                                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                >
                                    {processing ? 'Memproses...' : 'Pindahkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function DetailRow({
    label,
    alignTop = false,
    children,
}: {
    label: string;
    alignTop?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`flex gap-4 ${alignTop ? 'items-start' : 'items-center'}`}>
            <dt className="w-32 shrink-0 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                {label}
            </dt>
            <dd className="flex-1">{children}</dd>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{label}</label>
            {children}
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

function inputClass(error?: string) {
    return `w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition focus:ring-2 dark:text-neutral-100 ${
        error
            ? 'border-rose-300 focus:ring-rose-200 dark:border-rose-700'
            : 'border-neutral-200 focus:border-neutral-400 focus:ring-neutral-100 dark:border-neutral-700 dark:focus:border-neutral-500 dark:focus:ring-neutral-800'
    }`;
}