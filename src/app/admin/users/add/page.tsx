"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/actions/user";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    if (!data.name || !data.email || !data.password || !data.role) {
      setError("Silakan lengkapi semua data.");
      setLoading(false);
      return;
    }

    const res = await createUser(data);
    if (res.success) {
      router.push("/admin/users");
    } else {
      setError(res.error || "Terjadi kesalahan saat memproses data.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 bg-white rounded-lg border border-[var(--border)] hover:bg-gray-50 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tambah Akun Pegawai</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Daftarkan akun baru untuk mekanik, supervisor, atau admin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center gap-2">
            <h2 className="font-bold text-lg text-[var(--foreground)]">Data Akun</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama Lengkap <span className="text-red-500">*</span></label>
              <input name="name" type="text" required placeholder="Sesuai identitas" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email / Username <span className="text-red-500">*</span></label>
              <input name="email" type="text" required placeholder="Untuk login" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
              <input name="password" type="password" required placeholder="Minimal 6 karakter" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Peran (Role) <span className="text-red-500">*</span></label>
              <select name="role" required defaultValue="MECHANIC" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm">
                <option value="MECHANIC">Mekanik (Akses Inventori & Inspeksi)</option>
                <option value="SUPERVISOR">Supervisor (Akses Penuh)</option>
                <option value="ADMIN">Admin Data (Akses Penuh kecuali Inspeksi)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/users" className="px-6 py-2.5 rounded-lg text-sm font-bold border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Simpan Akun
          </button>
        </div>
      </form>
    </div>
  );
}
  
