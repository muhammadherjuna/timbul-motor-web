"use client";

import { useEffect, useState } from "react";
import { getPendingInspectionSessions, approveInspectionSession, rejectInspectionSession, reopenInspectionSession } from "@/lib/inspection-actions";
import { Check, X, RotateCcw, AlertCircle, Eye, MessageSquareText, ShieldCheck, Wrench, Clock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InspectionsDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{ id: string; type: 'APPROVE' | 'REJECT' | 'REOPEN'; motorName: string } | null>(null);
  const [modalNote, setModalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => { loadSessions(); }, []);

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

  const gradeColor = (grade: string) => {
    if (grade === 'A') return { badge: 'bg-green-100 text-green-800 ring-1 ring-green-300', bar: 'bg-green-500' };
    if (grade === 'B') return { badge: 'bg-blue-100 text-blue-800 ring-1 ring-blue-300', bar: 'bg-blue-500' };
    return { badge: 'bg-red-100 text-red-800 ring-1 ring-red-300', bar: 'bg-red-500' };
  };

  const eligibilityConfig = (v: string) => {
    if (v === 'LAYAK_JUAL') return { text: 'Layak Jual', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <ShieldCheck size={13} /> };
    if (v === 'PERLU_PERBAIKAN') return { text: 'Perlu Perbaikan', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Wrench size={13} /> };
    return { text: 'Tidak Layak', cls: 'bg-red-50 text-red-700 border-red-200', icon: <AlertCircle size={13} /> };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Approval Inspeksi</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Daftar inspeksi selesai yang menunggu persetujuan Supervisor.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden animate-pulse">
              <div className="h-2 bg-gray-200 w-full" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-[var(--border)] rounded-xl bg-white shadow-sm gap-4">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <ShieldCheck size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-[var(--foreground)]">Semua Bersih!</h3>
            <p className="text-[var(--muted-foreground)] mt-1">Tidak ada sesi inspeksi yang menunggu persetujuan saat ini.</p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((sess) => {
            const grade = gradeColor(sess.grade);
            const elig = eligibilityConfig(sess.saleEligibility);
            return (
              <div key={sess.id} className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow duration-200">
                {/* Color accent top bar */}
                <div className={`h-1.5 w-full ${grade.bar}`} />

                {/* Card Body */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-[var(--foreground)] leading-tight">
                        {sess.motor?.name || "Unknown Motor"}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {sess.motor?.code || "—"}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg shrink-0 ${grade.badge}`}>
                      Grade {sess.grade || "—"}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <User size={14} className="shrink-0" />
                      <span>Mekanik: <span className="font-medium text-[var(--foreground)]">{sess.inspectorName || "—"}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Clock size={14} className="shrink-0" />
                      <span>{new Date(sess.completedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${elig.cls}`}>
                      {elig.icon} {elig.text}
                    </span>
                    {sess.hasCritical && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <AlertCircle size={13} /> Item Kritis
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[var(--border)]" />

                {/* Actions Footer */}
                <div className="p-4 bg-gray-50/70 flex items-center gap-2">
                  {/* Detail — icon-only with tooltip */}
                  <Link
                    href={`/admin/inventory/${sess.motorId}/edit?tab=4`}
                    title="Lihat Detail Form Inspeksi"
                    className="p-2.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Eye size={17} />
                  </Link>

                  <div className="flex-1 flex items-center gap-2">
                    {/* Perbaiki */}
                    <button
                      onClick={() => openModal(sess.id, 'REOPEN', sess.motor?.name)}
                      className="flex-1 py-2 px-3 text-sm font-semibold text-amber-700 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw size={15} />
                      Perbaiki
                    </button>

                    {/* Tolak */}
                    <button
                      onClick={() => openModal(sess.id, 'REJECT', sess.motor?.name)}
                      className="flex-1 py-2 px-3 text-sm font-semibold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X size={15} />
                      Tolak
                    </button>

                    {/* Setujui — dominant */}
                    <button
                      onClick={() => openModal(sess.id, 'APPROVE', sess.motor?.name)}
                      className="flex-[1.5] py-2 px-3 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow hover:shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check size={15} />
                      Setujui
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CUSTOM MODAL POP-UP */}
      {modalOpen && modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className={`px-6 py-5 flex items-center gap-4 ${
              modalAction.type === 'APPROVE' ? 'bg-green-600' :
              modalAction.type === 'REOPEN' ? 'bg-amber-500' :
              'bg-red-600'
            }`}>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                {modalAction.type === 'APPROVE' && <Check size={22} className="text-white" />}
                {modalAction.type === 'REOPEN' && <RotateCcw size={22} className="text-white" />}
                {modalAction.type === 'REJECT' && <X size={22} className="text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                  {modalAction.type === 'APPROVE' ? 'Setujui Inspeksi' :
                   modalAction.type === 'REOPEN' ? 'Minta Perbaikan' :
                   'Tolak Inspeksi'}
                </h3>
                <p className="text-white/75 text-sm mt-0.5">{modalAction.motorName}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <MessageSquareText size={16} className="text-[var(--muted-foreground)]" />
                  Catatan untuk Mekanik
                  <span className="font-normal text-[var(--muted-foreground)]">(opsional)</span>
                </label>
                <textarea
                  className="w-full p-3 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none min-h-[110px] text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Tuliskan catatan atau alasan keputusan Anda di sini..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-[var(--border)] font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmAction}
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center gap-2 shadow hover:shadow-md disabled:opacity-60 ${
                  modalAction.type === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' :
                  modalAction.type === 'REOPEN' ? 'bg-amber-500 hover:bg-amber-600' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <>
                    {modalAction.type === 'APPROVE' && <><Check size={16} /> Konfirmasi Setuju</>}
                    {modalAction.type === 'REOPEN' && <><RotateCcw size={16} /> Minta Perbaikan</>}
                    {modalAction.type === 'REJECT' && <><X size={16} /> Konfirmasi Tolak</>}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
