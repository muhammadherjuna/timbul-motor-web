"use client";

import { useEffect, useState } from "react";
import { getPendingInspectionSessions, approveInspectionSession, rejectInspectionSession, reopenInspectionSession } from "@/lib/inspection-actions";
import { Check, X, RotateCcw, AlertCircle, Search, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InspectionsDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'REOPEN') => {
    const note = prompt("Masukkan catatan (opsional):");
    if (note === null) return; // Cancelled
    
    setLoading(true);
    try {
      if (action === 'APPROVE') await approveInspectionSession(id, "Supervisor", note);
      if (action === 'REJECT') await rejectInspectionSession(id, "Supervisor", note);
      if (action === 'REOPEN') await reopenInspectionSession(id, "Supervisor", note);
      await loadSessions();
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Gagal melakukan aksi.");
      setLoading(false);
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
              
              <div className="flex items-center gap-2">
                <Link href={`/admin/inventory/${sess.motorId}/edit?tab=4`} className="p-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-gray-50 flex items-center gap-2" title="Lihat Detail">
                  <Eye size={18} /> <span className="hidden lg:inline">Detail Form</span>
                </Link>
                <button onClick={() => handleAction(sess.id, 'APPROVE')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2" title="Approve">
                  <Check size={18} /> <span className="hidden lg:inline">Setujui</span>
                </button>
                <button onClick={() => handleAction(sess.id, 'REOPEN')} className="p-2 border border-[var(--border)] text-orange-600 rounded-lg hover:bg-orange-50 flex items-center gap-2" title="Kembalikan (Reopen)">
                  <RotateCcw size={18} /> <span className="hidden lg:inline">Perbaiki</span>
                </button>
                <button onClick={() => handleAction(sess.id, 'REJECT')} className="p-2 border border-[var(--border)] text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2" title="Tolak">
                  <X size={18} /> <span className="hidden lg:inline">Tolak</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
