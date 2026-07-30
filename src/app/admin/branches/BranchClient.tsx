"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, MapPin, Phone, Building2 } from "lucide-react";
import { createBranch, updateBranch, deleteBranch } from "@/lib/branch-actions";

export default function BranchClient({ initialBranches }: { initialBranches: any[] }) {
  const [branches, setBranches] = useState(initialBranches);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createBranch(formData);
    if (res.success) {
      setIsAdding(false);
      window.location.reload(); // Quick refresh to get updated data
    } else {
      alert(res.error);
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateBranch(id, formData);
    if (res.success) {
      setEditingId(null);
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus cabang ini?")) return;
    setLoading(true);
    const res = await deleteBranch(id);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
          >
            <Plus size={18} /> Tambah Cabang
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
            <Building2 size={20} className="text-[var(--primary)]" /> Tambah Cabang Baru
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Nama Cabang / Showroom <span className="text-red-500">*</span></label>
                <input type="text" name="name" required placeholder="Contoh: Showroom Utama Kebumen" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">No. Telepon / WhatsApp</label>
                <input type="text" name="phone" placeholder="Contoh: 081234567890" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Alamat Lengkap</label>
                <textarea name="address" rows={2} placeholder="Alamat detail lokasi showroom..." className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm resize-none"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">Batal</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors text-sm disabled:opacity-50">
                {loading ? "Menyimpan..." : "Simpan Cabang"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {branches.length === 0 && !isAdding ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[var(--border)] shadow-sm">
            <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum Ada Cabang</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Silakan tambah cabang pertama Anda.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors shadow-sm text-sm"
            >
              <Plus size={16} /> Tambah Cabang
            </button>
          </div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              {editingId === branch.id ? (
                <form onSubmit={(e) => handleEdit(e, branch.id)} className="w-full space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium">Nama Cabang / Showroom <span className="text-red-500">*</span></label>
                      <input type="text" name="name" defaultValue={branch.name} required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">No. Telepon / WhatsApp</label>
                      <input type="text" name="phone" defaultValue={branch.phone || ""} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium">Alamat Lengkap</label>
                      <textarea name="address" defaultValue={branch.address || ""} rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm resize-none"></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">Batal</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary)]/90 transition-colors text-sm disabled:opacity-50">
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-bold text-lg text-[var(--foreground)] flex items-center gap-2">
                      <Building2 size={18} className="text-[var(--primary)]" />
                      {branch.name}
                    </h3>
                    <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
                      {branch.address && (
                        <p className="flex items-start gap-2">
                          <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{branch.address}</span>
                        </p>
                      )}
                      {branch.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={16} className="flex-shrink-0" />
                          <span>{branch.phone}</span>
                        </p>
                      )}
                      {!branch.address && !branch.phone && (
                        <p className="text-gray-400 italic">Tidak ada detail tambahan</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => setEditingId(branch.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Cabang"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(branch.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus Cabang"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
