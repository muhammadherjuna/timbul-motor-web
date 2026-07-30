"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/actions/customer";
import { UserPlus, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AddCustomerPage() {
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
      phone: formData.get("phone") as string,
      nik: formData.get("nik") as string,
      address: formData.get("address") as string,
      email: formData.get("email") as string,
    };

    const res = await createCustomer(data);
    if (res.success) {
      router.push("/admin/customers");
    } else {
      setError(res.error || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 bg-white rounded-lg border border-[var(--border)] hover:bg-gray-50 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tambah Pelanggan Baru</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Masukkan data diri pelanggan.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center gap-2">
          <UserPlus size={18} className="text-[var(--primary)]" />
          <h2 className="font-bold text-lg text-[var(--foreground)]">Data Pelanggan</h2>
        </div>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Nama Lengkap <span className="text-red-500">*</span></label>
            <input name="name" type="text" required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" placeholder="Sesuai KTP" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nomor Handphone <span className="text-red-500">*</span></label>
              <input name="phone" type="tel" required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" placeholder="08..." />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">NIK (KTP)</label>
              <input name="nik" type="text" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" placeholder="16 Digit NIK" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email (Opsional)</label>
            <input name="email" type="email" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" placeholder="email@contoh.com" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Alamat Lengkap</label>
            <textarea name="address" rows={3} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" placeholder="Jalan, RT/RW, Desa, Kecamatan..."></textarea>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)] bg-gray-50 flex justify-end gap-3">
          <Link href="/admin/customers" className="px-6 py-2 rounded-lg text-sm font-bold border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Simpan Pelanggan
          </button>
        </div>
      </form>
    </div>
  );
}
