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
        include: { package: true }
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
                  <p className="font-bold">Sesi: {sess.package?.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={14} /> {sess.startedAt.toLocaleDateString("id-ID")}</span>
                    <span>Status: <span className="font-medium text-gray-800">{sess.status}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {sess.status === "COMPLETED" || sess.status === "APPROVED" ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Grade</p>
                      <p className={`font-bold text-xl ${sess.grade === 'A' ? 'text-green-600' : sess.grade === 'B' ? 'text-blue-600' : sess.grade === 'C' ? 'text-orange-600' : 'text-red-600'}`}>
                        {sess.grade || "-"}
                      </p>
                    </div>
                  ) : (
                    <Link href={`/admin/inventory/${id}/edit`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                      Lanjutkan Inspeksi
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {motor.inspection && (
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden opacity-70">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-bold flex items-center gap-2"><FileText size={18} className="text-gray-500" /> Data Inspeksi Lama (Legacy)</h2>
            <p className="text-sm text-gray-500 mt-1">Sistem ini digantikan oleh Sesi Inspeksi Cerdas di atas.</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Grade Terakhir</p>
                <p className="font-bold">{motor.inspection.inspection_grade || "-"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Inspektor</p>
                <p className="font-bold">{motor.inspection.inspector_name || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
