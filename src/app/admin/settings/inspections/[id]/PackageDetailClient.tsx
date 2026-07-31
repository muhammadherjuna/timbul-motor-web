"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldAlert, AlertTriangle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { togglePackageItem } from "@/lib/package-actions";

type PackageItem = {
  id: string;
  itemKey: string;
  question: string;
  weight: number;
  isActive: boolean;
  isSafetyItem: boolean;
  isCriticalItem: boolean;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  weight: number;
  items: PackageItem[];
};

type Props = {
  pkg: {
    id: string;
    name: string;
    description: string;
    categories: Category[];
  };
};

export default function PackageDetailClient({ pkg }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (item: PackageItem, currentActiveCount: number) => {
    if (!item.isActive) {
      // Menyalakan kembali tidak masalah
      executeToggle(item.id, true);
    } else {
      // Mematikan, pastikan ini bukan yang terakhir
      if (currentActiveCount <= 1) {
        setErrorMsg("Kategori harus memiliki minimal 1 item pemeriksaan aktif.");
        setTimeout(() => setErrorMsg(null), 3000);
        return;
      }
      executeToggle(item.id, false);
    }
  };

  const executeToggle = async (id: string, newState: boolean) => {
    setLoadingId(id);
    try {
      await togglePackageItem(id, newState);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengubah status item");
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {errorMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-4 flex items-start gap-3 w-80">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Aksi Ditolak</h3>
              <p className="text-gray-500 text-xs mt-1">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/admin/settings/inspections" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{pkg.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{pkg.description}</p>
        </div>
      </div>

      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-6 flex gap-3">
        <ShieldAlert size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Prinsip Timbul Motor</p>
          <p className="text-xs text-blue-600 mt-1">
            Bobot persentase telah diatur oleh sistem dan ditampilkan secara *read-only*. 
            Anda hanya dapat menonaktifkan poin yang tidak relevan dengan motor tertentu. 
            Bobot dari item yang dinonaktifkan akan didistribusikan secara proporsional ke item aktif lainnya dalam kategori yang sama.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {pkg.categories.map(cat => {
          const activeItemsCount = cat.items.filter(i => i.isActive).length;

          return (
            <div key={cat.id} className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
                <h2 className="font-bold text-lg text-[var(--foreground)]">{cat.name}</h2>
                <div className="bg-blue-100 text-blue-800 font-bold text-sm px-3 py-1 rounded-full">
                  Bobot Kategori: {cat.weight}%
                </div>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {cat.items.map(item => (
                  <div key={item.id} className={`p-4 flex items-center justify-between transition-colors ${!item.isActive ? 'bg-gray-50' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium text-sm ${!item.isActive ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item.question}
                        </p>
                        {item.isSafetyItem && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                            <AlertTriangle size={10} /> Keselamatan
                          </span>
                        )}
                        {item.isCriticalItem && (
                          <span className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                            <AlertTriangle size={10} /> Kritikal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Bobot Dasar: {item.weight}%</p>
                    </div>

                    <div className="pl-4">
                      <button 
                        disabled={loadingId === item.id}
                        onClick={() => handleToggle(item, activeItemsCount)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          item.isActive ? 'bg-green-500' : 'bg-gray-200'
                        } ${loadingId === item.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
