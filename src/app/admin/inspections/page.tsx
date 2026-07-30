"use client";

import { useEffect, useState } from "react";
import { getPendingInspectionSessions, approveInspectionSession, rejectInspectionSession, reopenInspectionSession } from "@/lib/inspection-actions";
import { Check, X, RotateCcw, AlertCircle, Search, Eye, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InspectionsDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{ id: string; type: 'APPROVE' | 'REJECT' | 'REOPEN', motorName: string } | null>(null);
  const [modalNote, setModalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getPendingInspectionSessions();
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (id: string, type: 'APPROVE' | 'REJECT' | 'REOPEN', motorName: string) => {
    setModalAction({ id, type, motorName });
    setModalNote("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalNote("");
  };

  const confirmAction = async () => {
    if (!modalAction) return;
    
    setIsSubmitting(true);
    try {
      if (modalAction.type === 'APPROVE') await approveInspectionSession(modalAction.id, "Supervisor", modalNote);
      if (modalAction.type === 'REJECT') await rejectInspectionSession(modalAction.id, "Supervisor", modalNote);
      if (modalAction.type === 'REOPEN') await reopenInspectionSession(modalAction.id, "Supervisor", modalNote);
      
      await loadSessions();
      closeModal();
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Gagal melakukan aksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Approval Inspeksi</h1>
          <p className="text-[var(--muted-foreground)]">Daftar inspeksi selesai yang menunggu persetujuan Supervisor.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--muted-foreground)] border border-[var(--border)] rounded-xl bg-white">
          Memuat data...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center border border-[var(--border)] rounded-xl bg-white space-y-3">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-bold">Semua Bersih!</h3>
          <p className="text-[var(--muted-foreground)]">Tidak ada sesi inspeksi yang menunggu persetujuan saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((sess) => (
            <div key={sess.id} className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-sm flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{sess.motor?.name || "Unknown Motor"}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    sess.grade === 'A' ? 'bg-green-100 text-green-700' : 
                    sess.grade === 'B' ? 'bg-blue-100 text-blue-700' : 
                    'bg-red-100 text-red-700'
                  }`}>Grade {sess.grade}</span>
                  {sess.hasCritical && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertCircle size={12} /> Ada Item Kritis
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Mekanik: {sess.inspectorName} • Diselesaikan: {new Date(sess.completedAt).toLocaleString('id-ID')}
                </p>
                <div className="pt-2 flex gap-2 text-sm font-medium">
                  Status Kelayakan: <span className={sess.saleEligibility === 'LAYAK_JUAL' ? 'text-green-600' : sess.saleEligibility === 'PERLU_PERBAIKAN' ? 'text-orange-600' : 'text-red-600'}>
                    {sess.saleEligibility.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-4 sm:pt-0 sm:pl-6">
                <Link href={`/admin/inventory/${sess.motorId}/edit?tab=4`} className="flex-1 min-w-[120px] py-2.5 px-4 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors" title="Lihat Detail">
                  <Eye size={18} /> <span>Detail Form</span>
                </Link>
                <button onClick={() => openModal(sess.id, 'REOPEN', sess.motor?.name)} className="flex-1 min-w-[120px] py-2.5 px-4 border-2 border-orange-200 text-orange-700 bg-orange-50 font-medium rounded-lg hover:bg-orange-100 flex items-center justify-center gap-2 transition-colors" title="Kembalikan (Reopen)">
                  <RotateCcw size={18} /> <span>Perbaiki</span>
                </button>
                <button onClick={() => openModal(sess.id, 'REJECT', sess.motor?.name)} className="flex-1 min-w-[120px] py-2.5 px-4 border-2 border-red-200 text-red-700 bg-red-50 font-medium rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors" title="Tolak">
                  <X size={18} /> <span>Tolak</span>
                </button>
                <button onClick={() => openModal(sess.id, 'APPROVE', sess.motor?.name)} className="flex-[2] min-w-[140px] py-2.5 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all" title="Approve">
                  <Check size={18} /> <span>Setujui</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOM MODAL POP-UP */}
      {modalOpen && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-4 border-b flex items-center gap-3 ${
              modalAction.type === 'APPROVE' ? 'bg-green-50 border-green-100 text-green-900' :
              modalAction.type === 'REOPEN' ? 'bg-orange-50 border-orange-100 text-orange-900' :
              'bg-red-50 border-red-100 text-red-900'
            }`}>
              {modalAction.type === 'APPROVE' && <Check size={24} className="text-green-600" />}
              {modalAction.type === 'REOPEN' && <RotateCcw size={24} className="text-orange-600" />}
              {modalAction.type === 'REJECT' && <X size={24} className="text-red-600" />}
              <div>
                <h3 className="font-bold text-lg">
                  {modalAction.type === 'APPROVE' ? 'Setujui Inspeksi' : modalAction.type === 'REOPEN' ? 'Minta Perbaikan' : 'Tolak Inspeksi'}
                </h3>
                <p className="text-sm opacity-80">{modalAction.motorName}</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquareText size={16} /> Catatan Opsional untuk Mekanik
                </label>
                <textarea 
                  className="w-full p-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:outline-none min-h-[100px] text-sm resize-none"
                  placeholder="Tambahkan catatan khusus mengapa Anda menyetujui, menolak, atau meminta perbaikan..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-[var(--border)] flex justify-end gap-3">
              <button 
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={confirmAction}
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors flex items-center gap-2 disabled:opacity-50 ${
                  modalAction.type === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' :
                  modalAction.type === 'REOPEN' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <>Memproses...</>
                ) : (
                  <>Konfirmasi {modalAction.type === 'APPROVE' ? 'Setuju' : modalAction.type === 'REOPEN' ? 'Perbaikan' : 'Tolak'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
