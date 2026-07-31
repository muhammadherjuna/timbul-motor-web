"use client";

import { Save, Building2, Phone, MapPin, User, Lock, CheckCircle2, ClipboardList, ChevronRight, Settings2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-start gap-3 w-80">
            <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Pengaturan Disimpan</h3>
              <p className="text-gray-500 text-xs mt-1">Perubahan konfigurasi telah berhasil disimpan.</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Pengaturan Sistem</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Sesuaikan informasi dealer dan profil akun Anda.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/settings/inspections">
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-center gap-2 group cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  <ClipboardList size={20} />
                </div>
                <h2 className="font-bold text-lg text-gray-800">Paket Inspeksi</h2>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-sm text-gray-500">Kelola paket inspeksi, kategori, dan pengaturan form pemeriksaan motor (Smart Inspection).</p>
          </div>
        </Link>
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5 flex flex-col justify-center gap-2 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                <Settings2 size={20} />
              </div>
              <h2 className="font-bold text-lg text-gray-600">Preferensi Web</h2>
            </div>
          </div>
          <p className="text-sm text-gray-500">Warna tema, logo, dan pengaturan tampilan publik (Akan datang).</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Info Dealer */}
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center gap-2">
            <Building2 size={18} className="text-[var(--primary)]" />
            <h2 className="font-bold text-lg text-[var(--foreground)]">Profil Dealer</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama Dealer</label>
                <input type="text" defaultValue="Timbul Motor Kebumen" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nomor WhatsApp Admin</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" defaultValue="6282326921142" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Gunakan format 628xxx tanpa tanda plus atau spasi.</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium">Alamat Lengkap</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea rows={3} defaultValue="Jl. Raya Kebumen - Banyumas Km. 5, Kebumen, Jawa Tengah" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Akun Pengguna */}
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center gap-2">
            <User size={18} className="text-[var(--primary)]" />
            <h2 className="font-bold text-lg text-[var(--foreground)]">Akun Administrator</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <input type="text" defaultValue="Admin Timbul Motor" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input type="email" defaultValue="admin@timbulmotor.com" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Password Baru</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" placeholder="Kosongkan jika tidak ingin mengubah" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors shadow-sm">
            <Save size={18} />
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}
