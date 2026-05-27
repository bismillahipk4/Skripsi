import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: PaginatedUsers;
    roles: string[];
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
}

const INITIAL_FORM: FormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
];

// ── Role badge ─────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
    admin:      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    editor:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    viewer:     'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    user:       'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

function roleBadgeClass(name: string) {
    return ROLE_COLORS[name.toLowerCase()] ?? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Index({ users, roles }: Props) {
    const { auth, errors, flash } = usePage<{
        auth: { user: { id: number } };
        errors: Partial<FormData> & { error?: string };
        flash: { success?: string };
    }>().props;

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FormData>({ ...INITIAL_FORM, role: roles[0] ?? '' });
    const [processing, setProcessing] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function openModal() {
        setForm({ ...INITIAL_FORM, role: roles[0] ?? '' });
        setShowModal(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post(route('users.store'), form, {
            onFinish: () => setProcessing(false),
            onSuccess: () => setShowModal(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}
                {errors?.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
                        {errors.error}
                    </div>
                )}

                {/* Header card */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-between rounded-xl border p-4">
                    <div>
                        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                            Manajemen User
                        </h1>
                        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                            Total {users.total} user terdaftar
                        </p>
                    </div>
                    <button
                        onClick={openModal}
                        className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                    >
                        <span className="text-base leading-none">+</span> Tambah User
                    </button>
                </div>

                {/* Table card */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
                                    <th className="px-5 py-3.5">Nama</th>
                                    <th className="px-5 py-3.5">Email</th>
                                    <th className="px-5 py-3.5">Role</th>
                                    <th className="px-5 py-3.5">Bergabung</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-sm text-neutral-400">
                                            Belum ada user.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map(user => (
                                        <tr
                                            key={user.id}
                                            className="transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="px-5 py-3.5 font-medium text-neutral-800 dark:text-neutral-100">
                                                {user.name}
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                                                {user.email}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.length > 0 ? (
                                                        user.roles.map(r => (
                                                            <span
                                                                key={r.id}
                                                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeClass(r.name)}`}
                                                            >
                                                                {r.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-neutral-300 dark:text-neutral-600">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-neutral-400 dark:text-neutral-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                {user.id !== auth.user.id && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Apakah Anda yakin ingin menghapus user ini? Aksi ini tidak dapat dibatalkan.')) {
                                                                router.delete(route('users.destroy', user.id));
                                                            }
                                                        }}
                                                        className="rounded p-1 text-neutral-400 hover:bg-rose-100 hover:text-rose-600 transition dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
                                                        title="Hapus User"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1 border-t border-neutral-100 p-3 dark:border-neutral-800">
                            {users.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                        link.active
                                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                                            : link.url
                                            ? 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                            : 'cursor-not-allowed text-neutral-300 dark:text-neutral-600'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                Tambah User Baru
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                            <Field label="Nama Lengkap" error={errors.name}>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Budi Santoso"
                                    className={inputClass(errors.name)}
                                />
                            </Field>

                            <Field label="Email" error={errors.email}>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="budi@example.com"
                                    className={inputClass(errors.email)}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Password" error={errors.password}>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={inputClass(errors.password)}
                                    />
                                </Field>
                                <Field label="Konfirmasi" error={errors.password_confirmation}>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={inputClass(errors.password_confirmation)}
                                    />
                                </Field>
                            </div>

                            <Field label="Role" error={errors.role}>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className={inputClass(errors.role)}
                                >
                                    {roles.map(r => (
                                        <option key={r} value={r}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan User'}
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