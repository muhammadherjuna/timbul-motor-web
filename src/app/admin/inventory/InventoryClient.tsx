"use client";

import { PlusCircle, Search, Edit, Trash2, AlertTriangle, QrCode } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import QRCodeModal from "@/components/admin/QRCodeModal";
import { deleteMotor } from "@/lib/actions";

export default function InventoryClient({ initialMotors }: { initialMotors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", name: "" });
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; motor: any }>({ isOpen: false, motor: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMotors = initialMotors.filter(motor => 
    motor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    motor.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deleteMotor(deleteModal.id);
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, id: "", name: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Inventaris Stok</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola semua data motor yang ada di dealer.</p>
        </div>
        <Link 
          href="/admin/inventory/add" 
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
        >
          <PlusCircle size={18} />
          Tambah Stok Baru
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama motor atau kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm">
                <th className="px-6 py-3 font-medium">Kode & Motor</th>
                <th className="px-6 py-3 font-medium">Tahun/KM</th>
                <th className="px-6 py-3 font-medium">Harga Dasar</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--border)]">
              {filteredMotors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                    Tidak ada motor yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMotors.map((motor) => (
                  <tr key={motor.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                          <img src={motor.image} alt={motor.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)] font-mono">{motor.code}</p>
                          <p className="font-semibold text-[var(--foreground)]">{motor.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--foreground)]">{motor.year}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{motor.km.toLocaleString('id-ID')} KM</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--foreground)]">Rp {motor.price.toLocaleString("id-ID")}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">DP Min: Rp {motor.dp_min.toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2 py-1 rounded border border-[var(--border)] bg-[var(--muted)]">
                        {motor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/inventory/${motor.id}/finance`}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-colors" 
                          title="Simulasi Kredit WA"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16.01" y1="14" y2="14"/><line x1="16" x2="16.01" y1="18" y2="18"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="18" y2="18"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="18" y2="18"/></svg>
                        </Link>
                        <button 
                          onClick={() => setQrModal({ isOpen: true, motor })}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded border border-transparent hover:border-purple-200 transition-colors" 
                          title="Cetak Label QR"
                        >
                          <QrCode size={18} />
                        </button>
                        <Link href={`/admin/inventory/${motor.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: motor.id, name: motor.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>Menampilkan {filteredMotors.length} data</span>
        </div>
      </div>

      <QRCodeModal 
        isOpen={qrModal.isOpen} 
        motor={qrModal.motor} 
        onClose={() => setQrModal({ isOpen: false, motor: null })} 
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus data <span className="font-semibold text-gray-800">"{deleteModal.name}"</span>? Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors w-full disabled:opacity-50"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
