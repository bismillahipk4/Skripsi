import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Stok {
    id_stok: number;
    stok_total: number;
}

interface DetailStok {
    id_detailstok: number;
    id_barang: number;
    id_lokasi: number;
    jumlahDiLokasi: number;
    deskripsiBarang: string | null;
    hargaBarang: string | null;
}

export interface SubKategori {
    id_sub_kategori: number;
    id_kategori: number;
    namaSubKategori: string;
    kategori?: Kategori;
}

export interface Kategori {
    id_kategori: number;
    namaKategori: string;
    sub_kategoris?: SubKategori[];
}

interface Barang {
    id_barang: number;
    namaBarang: string;
    gambar: string | null;
    id_sub_kategori: number | null;
    sub_kategori?: SubKategori | null;
    stok: Stok | null;
    detail_stoks?: DetailStok[];
}

interface Props {
    barang: Barang[];
    kategoriList: Kategori[];
}

interface FormData {
    namaBarang: string;
    id_kategori: string; // untuk filter di form
    id_sub_kategori: string;
    stok_total: string;
    deskripsiBarang: string;
    hargaBarang: string;
}

const INITIAL_FORM: FormData = {
    namaBarang: '',
    id_kategori: '',
    id_sub_kategori: '',
    stok_total: '0',
    deskripsiBarang: '',
    hargaBarang: '',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Barang', href: '/barang' },
];

// ── Colors ─────────────────────────────────────────────────────────────────
const COLORS = [
    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
];

export function getBadgeClass(id: number | null) {
    if (!id) return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    return COLORS[id % COLORS.length];
}

function stokBadgeClass(total: number) {
    if (total === 0) return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
    if (total <= 10) return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Index({ barang, kategoriList }: Props) {
    const { errors, flash, auth } = usePage<{
        errors: Partial<FormData & { gambar: string; namaLokasi: string }>;
        flash: { success?: string; error?: string };
        auth: { user: { role?: string } };
    }>().props;

    const isAdmin = auth.user.role === 'Admin';

    const [showModal, setShowModal] = useState(false);
    const [showLokasiModal, setShowLokasiModal] = useState(false);
    const [showKategoriModal, setShowKategoriModal] = useState(false);

    const [lokasiName, setLokasiName] = useState('');
    const [kategoriName, setKategoriName] = useState('');
    const [subKategoriNames, setSubKategoriNames] = useState<Record<number, string>>({});

    const [editTarget, setEditTarget] = useState<Barang | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Barang | null>(null);
    const [form, setForm] = useState<FormData>({ ...INITIAL_FORM });
    const [processing, setProcessing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [filterSubKategori, setFilterSubKategori] = useState('');

    const fileRef = useRef<HTMLInputElement>(null);

    // Filter Logic
    const filtered = useMemo(() => {
        return barang.filter(b => {
            const matchSearch = b.namaBarang.toLowerCase().includes(search.toLowerCase());
            
            const matchKategori = filterKategori === '' || 
                String(b.sub_kategori?.kategori?.id_kategori) === filterKategori;
                
            const matchSubKategori = filterSubKategori === '' || 
                String(b.id_sub_kategori) === filterSubKategori;

            return matchSearch && matchKategori && matchSubKategori;
        });
    }, [barang, search, filterKategori, filterSubKategori]);

    const activeFilterKategoriObj = useMemo(() => {
        return kategoriList.find(k => String(k.id_kategori) === filterKategori);
    }, [kategoriList, filterKategori]);

    const activeFormKategoriObj = useMemo(() => {
        return kategoriList.find(k => String(k.id_kategori) === form.id_kategori);
    }, [kategoriList, form.id_kategori]);

    // ── Form Actions ───────────────────────────────────────────────────────
    function openAdd() {
        setEditTarget(null);
        setForm({ ...INITIAL_FORM });
        setPreview(null);
        setShowModal(true);
    }

    function openEdit(b: Barang) {
        setEditTarget(b);
        setForm({
            namaBarang: b.namaBarang,
            id_kategori: String(b.sub_kategori?.kategori?.id_kategori ?? ''),
            id_sub_kategori: String(b.id_sub_kategori ?? ''),
            stok_total: String(b.stok?.stok_total ?? 0),
            deskripsiBarang: b.deskripsiBarang ?? '',
            hargaBarang: b.hargaBarang ?? '',
        });
        setPreview(b.gambar ? `/storage/${b.gambar}` : null);
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setEditTarget(null);
        setPreview(null);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'id_kategori') {
                next.id_sub_kategori = ''; // reset sub kategori kalau kategori berubah
            }
            return next;
        });
    }

    function handleFilterKategoriChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setFilterKategori(e.target.value);
        setFilterSubKategori(''); // reset
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setPreview(file ? URL.createObjectURL(file) : (editTarget?.gambar ? `/storage/${editTarget.gambar}` : null));
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setProcessing(true);
        const data = new FormData(e.currentTarget);
        
        // Remove helper field, backend only needs id_sub_kategori
        data.delete('id_kategori');

        if (editTarget) {
            data.append('_method', 'PUT');
            router.post(`/barang/${editTarget.id_barang}`, data, {
                forceFormData: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        } else {
            router.post('/barang', data, {
                forceFormData: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        }
    }

    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/barang/${deleteTarget.id_barang}`, {
            onFinish: () => setDeleteTarget(null),
        });
    }

    // ── Kategori & Lokasi Submit ───────────────────────────────────────────
    function handleLokasiSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setProcessing(true);
        router.post('/lokasi', { namaLokasi: lokasiName }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setShowLokasiModal(false);
                setLokasiName('');
            },
        });
    }

    function handleAddKategori(e: React.FormEvent) {
        e.preventDefault();
        if (!kategoriName) return;
        setProcessing(true);
        router.post('/kategori', { namaKategori: kategoriName }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => setKategoriName(''),
        });
    }

    function handleAddSubKategori(e: React.FormEvent, parentId: number) {
        e.preventDefault();
        const namaKategori = subKategoriNames[parentId];
        if (!namaKategori) return;
        setProcessing(true);
        router.post('/kategori', { namaKategori, parent_id: parentId }, {
            onFinish: () => setProcessing(false),
            onSuccess: () => setSubKategoriNames(prev => ({ ...prev, [parentId]: '' })),
        });
    }

    function handleDeleteKategori(id: number) {
        if (!confirm('Yakin ingin menghapus kategori ini? (Subkategori juga akan terhapus)')) return;
        router.delete(`/kategori/${id}`);
    }

    function handleDeleteSubKategori(id: number) {
        if (!confirm('Yakin ingin menghapus subkategori ini?')) return;
        router.delete(`/subkategori/${id}`);
    }

    const isAdd = !editTarget;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barang" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {/* Header card */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                    <div>
                        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            Manajemen Barang
                        </h1>
                        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                            Menampilkan {filtered.length} dari {barang.length} barang
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama barang..."
                            className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
                        />
                        
                        {/* Kategori Filter */}
                        <select
                            value={filterKategori}
                            onChange={handleFilterKategoriChange}
                            className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
                        >
                            <option value="">Semua Kategori</option>
                            {kategoriList.map(k => (
                                <option key={k.id_kategori} value={k.id_kategori}>{k.namaKategori}</option>
                            ))}
                        </select>

                        {/* SubKategori Filter (Hanya tampil jika Kategori terpilih) */}
                        {activeFilterKategoriObj && activeFilterKategoriObj.sub_kategoris && activeFilterKategoriObj.sub_kategoris.length > 0 && (
                            <select
                                value={filterSubKategori}
                                onChange={e => setFilterSubKategori(e.target.value)}
                                className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-800"
                            >
                                <option value="">Semua Subkategori</option>
                                {activeFilterKategoriObj.sub_kategoris.map(sub => (
                                    <option key={sub.id_sub_kategori} value={sub.id_sub_kategori}>{sub.namaSubKategori}</option>
                                ))}
                            </select>
                        )}

                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setShowKategoriModal(true)}
                                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    Kelola Kategori
                                </button>
                                <button
                                    onClick={() => setShowLokasiModal(true)}
                                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                >
                                    <span className="text-base leading-none">+</span> Tambah Lokasi
                                </button>
                                <button
                                    onClick={openAdd}
                                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                >
                                    <span className="text-base leading-none">+</span> Tambah Barang
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Card grid */}
                {filtered.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 items-center justify-center rounded-xl border py-20">
                        <p className="text-sm text-neutral-400">
                            {search || filterKategori ? 'Tidak ada barang yang cocok.' : 'Belum ada barang.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map(b => {
                            const stokTotal = b.stok?.stok_total ?? 0;
                            const badgeColor = getBadgeClass(b.sub_kategori?.kategori?.id_kategori ?? null);
                            
                            return (
                                <div
                                    key={b.id_barang}
                                    className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col overflow-hidden rounded-xl border bg-white transition hover:shadow-md dark:bg-neutral-900"
                                >
                                    <div className="relative h-44 w-full bg-neutral-100 dark:bg-neutral-800">
                                        {b.gambar ? (
                                            <img
                                                src={`/storage/${b.gambar}`}
                                                alt={b.namaBarang}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300 dark:text-neutral-600">
                                                📦
                                            </div>
                                        )}
                                        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${stokBadgeClass(stokTotal)}`}>
                                            Stok: {stokTotal}
                                        </span>
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2 p-3.5">
                                        <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                            {b.namaBarang}
                                        </p>
                                        <div>
                                            {b.sub_kategori ? (
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeColor}`}>
                                                    {b.sub_kategori.kategori?.namaKategori} &gt; {b.sub_kategori.namaSubKategori}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-neutral-300 dark:text-neutral-600">Tanpa kategori</span>
                                            )}
                                        </div>

                                        <div className="mt-auto flex gap-1.5 pt-2">
                                            <button
                                                onClick={() => router.get(`/barang/${b.id_barang}`)}
                                                className="flex-1 rounded-lg border border-neutral-200 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                            >
                                                Detail
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(b)}
                                                        className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(b)}
                                                        className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Add / Edit Barang Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                {editTarget ? 'Edit Barang' : 'Tambah Barang Baru'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto">
                            <form id="barang-form" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 px-5 py-4">
                                <Field label="Nama Barang" error={errors.namaBarang}>
                                    <input
                                        name="namaBarang"
                                        value={form.namaBarang}
                                        onChange={handleChange}
                                        placeholder="Contoh: Scarf Rajut"
                                        required
                                        className={inputClass(errors.namaBarang)}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Kategori">
                                        <select
                                            name="id_kategori"
                                            value={form.id_kategori}
                                            onChange={handleChange}
                                            className={inputClass()}
                                        >
                                            <option value="">-- Kategori --</option>
                                            {kategoriList.map(k => (
                                                <option key={k.id_kategori} value={k.id_kategori}>{k.namaKategori}</option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="SubKategori">
                                        <select
                                            name="id_sub_kategori"
                                            value={form.id_sub_kategori}
                                            onChange={handleChange}
                                            disabled={!form.id_kategori}
                                            className={inputClass()}
                                        >
                                            <option value="">-- SubKategori --</option>
                                            {activeFormKategoriObj?.sub_kategoris?.map(sub => (
                                                <option key={sub.id_sub_kategori} value={sub.id_sub_kategori}>{sub.namaSubKategori}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                <Field label="Gambar" error={errors.gambar}>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 p-4 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800/50"
                                    >
                                        {preview ? (
                                            <img src={preview} alt="preview" className="max-h-28 rounded-lg object-contain" />
                                        ) : (
                                            <>
                                                <span className="text-2xl">🖼️</span>
                                                <p className="text-xs text-neutral-400">Klik untuk upload gambar</p>
                                                <p className="text-xs text-neutral-300 dark:text-neutral-600">JPG, PNG, WEBP — maks. 2MB</p>
                                            </>
                                        )}
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            name="gambar"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </Field>

                                {isAdd && (
                                    <Field label="Jumlah Stok" error={errors.stok_total}>
                                        <input
                                            type="number"
                                            name="stok_total"
                                            value={form.stok_total}
                                            onChange={handleChange}
                                            min={0}
                                            placeholder="0"
                                            required
                                            className={inputClass(errors.stok_total)}
                                        />
                                    </Field>
                                )}

                                <Field label="Harga Barang (Rp)" error={errors.hargaBarang as string | undefined}>
                                    <input
                                        type="number"
                                        name="hargaBarang"
                                        value={form.hargaBarang}
                                        onChange={handleChange}
                                        min={0}
                                        placeholder="0"
                                        className={inputClass(errors.hargaBarang as string | undefined)}
                                    />
                                </Field>

                                <Field label="Deskripsi Barang" error={errors.deskripsiBarang}>
                                    <textarea
                                        name="deskripsiBarang"
                                        value={form.deskripsiBarang}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Tuliskan deskripsi singkat barang..."
                                        className={inputClass(errors.deskripsiBarang) + ' resize-none'}
                                    />
                                </Field>
                            </form>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="barang-form"
                                disabled={processing}
                                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                            >
                                {processing ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Barang'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Kelola Kategori Modal ── */}
            {showKategoriModal && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
                    <div className="flex max-h-full w-full max-w-lg flex-col rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                Kelola Kategori & Subkategori
                            </h2>
                            <button
                                onClick={() => setShowKategoriModal(false)}
                                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto px-5 py-4">
                            {/* Tambah Kategori Baru */}
                            <form onSubmit={handleAddKategori} className="mb-6 flex gap-2">
                                <input
                                    type="text"
                                    value={kategoriName}
                                    onChange={(e) => setKategoriName(e.target.value)}
                                    placeholder="Nama kategori baru..."
                                    className="flex-1 rounded-lg border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:focus:border-neutral-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!kategoriName || processing}
                                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                >
                                    Tambah
                                </button>
                            </form>

                            {/* Daftar Kategori */}
                            {kategoriList.length === 0 ? (
                                <p className="text-center text-sm text-neutral-400">Belum ada kategori.</p>
                            ) : (
                                <div className="space-y-4">
                                    {kategoriList.map(kat => (
                                        <div key={kat.id_kategori} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">
                                                    {kat.namaKategori}
                                                </h3>
                                                <button
                                                    onClick={() => handleDeleteKategori(kat.id_kategori)}
                                                    className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                                    title="Hapus Kategori (beserta subkategori)"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="mt-3 pl-4 border-l-2 border-neutral-100 dark:border-neutral-800">
                                                {/* Daftar Sub */}
                                                <ul className="space-y-2 mb-3">
                                                    {kat.sub_kategoris?.map(sub => (
                                                        <li key={sub.id_sub_kategori} className="flex items-center justify-between text-sm">
                                                            <span className="text-neutral-600 dark:text-neutral-300">{sub.namaSubKategori}</span>
                                                            <button
                                                                onClick={() => handleDeleteSubKategori(sub.id_sub_kategori)}
                                                                className="text-rose-500 hover:underline"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {/* Tambah Sub */}
                                                <form onSubmit={(e) => handleAddSubKategori(e, kat.id_kategori)} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={subKategoriNames[kat.id_kategori] || ''}
                                                        onChange={(e) => setSubKategoriNames(prev => ({ ...prev, [kat.id_kategori]: e.target.value }))}
                                                        placeholder="Tambah subkategori..."
                                                        className="flex-1 rounded-md border border-neutral-200 bg-transparent px-3 py-1.5 text-xs outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:text-neutral-100"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!subKategoriNames[kat.id_kategori] || processing}
                                                        className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                    >
                                                        Add Sub
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm Delete Barang Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="px-5 py-5">
                            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                Hapus Barang?
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                Yakin ingin menghapus{' '}
                                <span className="font-medium text-neutral-800 dark:text-neutral-100">
                                    {deleteTarget.namaBarang}
                                </span>
                                ? Aksi ini tidak bisa dibatalkan.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-95"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lokasi Modal ── */}
            {showLokasiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                Tambah Lokasi Baru
                            </h2>
                            <button
                                onClick={() => setShowLokasiModal(false)}
                                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleLokasiSubmit} className="space-y-4 px-5 py-4">
                            <Field label="Nama Lokasi" error={errors.namaLokasi as string}>
                                <input
                                    type="text"
                                    value={lokasiName}
                                    onChange={(e) => setLokasiName(e.target.value)}
                                    placeholder="Contoh: Gudang B"
                                    required
                                    className={inputClass(errors.namaLokasi as string)}
                                />
                            </Field>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLokasiModal(false)}
                                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                >
                                    {processing ? 'Menyimpan...' : 'Tambah Lokasi'}
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