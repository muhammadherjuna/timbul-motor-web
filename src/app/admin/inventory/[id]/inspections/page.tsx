import { getLatestInspectionSession } from "@/lib/inspection-actions";
import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, History, FileText, CheckCircle, Clock } from "lucide-react";

export default async function MotorInspectionsHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const motor = await prisma.motor.findUnique({
    where: { id },
    include: {
      inspectionSessions: {
        orderBy: { startedAt: 'desc' },
        include: { template: true }
      },
      inspection: true // Old inspection data
    }
  });

  if (!motor) return <div>Motor tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <Link href={`/admin/inventory/${id}/edit`} className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--muted-foreground)]">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Riwayat Inspeksi: {motor.name}</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Kode Unit: {motor.code}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><History size={18} className="text-[var(--primary)]" /> Sesi Inspeksi Cerdas (Baru)</h2>
          <Link href={`/admin/inventory/${id}/edit`} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg">
            Mulai Inspeksi Baru
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {motor.inspectionSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada sesi inspeksi cerdas untuk motor ini.
            </div>
          ) : (
            motor.inspectionSessions.map((sess:any) => (
              <div key={sess.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold">Sesi: {sess.template.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={14} /> Dibuat: {new Date(sess.startedAt).toLocaleString('id-ID')} • Oleh: {sess.inspectorName}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full mb-1 ${
                    sess.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    sess.status === 'COMPLETED' ? 'bg-yellow-100 text-yellow-700' :
                    sess.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {sess.status}
                  </span>
                  {sess.grade && <p className="font-bold">Grade {sess.grade}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {motor.inspection && (
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-bold flex items-center gap-2 text-gray-600"><FileText size={18} /> Data Inspeksi Lama (Arsip)</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-2">Ini adalah data inspeksi dari sistem lama sebelum implementasi inspeksi cerdas.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="text-gray-500 text-xs">Grade</p>
                <p className="font-bold">{motor.inspection.inspection_grade || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Inspektor</p>
                <p className="font-bold">{motor.inspection.inspector_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Status Arsip</p>
                <p className="font-bold">{motor.inspection.archived ? 'Diarsipkan' : 'Aktif'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
