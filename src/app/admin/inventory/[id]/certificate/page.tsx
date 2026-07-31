import prisma from "@/lib/db";
import { getActiveInspectionSession } from "@/lib/inspection-actions";
import { notFound } from "next/navigation";
import { ShieldCheck, Calendar, Printer } from "lucide-react";
import PrintButton from "@/components/PrintButton";

export default async function InspectionCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const motor = await prisma.motor.findUnique({
    where: { id },
    include: { document: true, history: true }
  });

  if (!motor) notFound();

  const session = await getActiveInspectionSession(id);
  if (!session) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-bold text-red-600">Sertifikat Belum Tersedia</h1>
        <p className="text-sm text-gray-600">Unit ini belum memiliki sesi inspeksi yang berstatus APPROVED.</p>
      </div>
    );
  }

  // Calculate scores per category from snapshot
  const snapshotCategoriesMap = new Map<string, { name: string; originalWeightSum: number; items: any[] }>();
  session.snapshot.forEach((snap: any) => {
    if (!snapshotCategoriesMap.has(snap.categoryName)) {
      snapshotCategoriesMap.set(snap.categoryName, { name: snap.categoryName, originalWeightSum: 0, items: [] });
    }
    const cat = snapshotCategoriesMap.get(snap.categoryName)!;
    cat.originalWeightSum += snap.originalWeight;
    cat.items.push(snap);
  });

  const categoryScores = Array.from(snapshotCategoriesMap.values()).map(cat => {
    let catScore = 0;
    cat.items.forEach(snap => {
      const normWeight = (snap.originalWeight / (cat.originalWeightSum || 1)) * 100;
      const answeredItem = session.items.find((i: any) => i.packageItem?.itemKey === snap.itemKey);
      const score = answeredItem?.score ?? 0;
      catScore += (score * normWeight) / 100;
    });
    return {
      name: cat.name,
      score: Math.round(catScore)
    };
  });

  const nonNormalItems = session.items.filter((i: any) => 
    i.status === "PERLU_PERBAIKAN" || i.status === "RUSAK" || i.status === "TIDAK_LENGKAP" || i.status === "PERLU_GANTI"
  );

  const inspectionDateStr = session.approvedAt 
    ? new Date(session.approvedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
    : session.completedAt 
    ? new Date(session.completedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
    : "-";

  const printDateStr = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-gray-900 print:bg-white print:p-0">
      {/* Top Bar for Action - Hidden during print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <a href={`/stok/${motor.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          ← Kembali ke Detail Motor
        </a>
        <PrintButton />
      </div>

      {/* CERTIFICATE SHEET */}
      <div className="max-w-4xl mx-auto bg-white border-4 border-[var(--primary)] rounded-2xl p-8 shadow-xl print:shadow-none print:border-4 print:rounded-none">
        
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-6 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--primary)]">TIMBUL MOTOR KEBUMEN</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Laporan & Sertifikat Resmi Inspeksi Kendaraan</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-300">
              VERIFIED APPROVED
            </span>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-sm border border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium">Unit Kendaraan</p>
            <p className="font-bold text-gray-900">{motor.brand} {motor.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Kode Unit / Tahun</p>
            <p className="font-bold text-gray-900">{motor.code} / {motor.year}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Odometer</p>
            <p className="font-bold text-gray-900">{motor.km.toLocaleString("id-ID")} KM</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Nomor Rangka</p>
            <p className="font-mono font-bold text-gray-900">{motor.document?.chassis_number || "-"}</p>
          </div>
        </div>

        {/* Grade Summary Box */}
        <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 p-6 rounded-2xl mb-8">
          <div className="space-y-1">
            <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Status Kelayakan</p>
            <p className="text-xl font-black text-green-900">{session.saleEligibility?.replace("_", " ")}</p>
            <p className="text-xs text-green-700">Inspektor: {session.inspectorName} | Supervisor: {session.approvedByName || "Admin"}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-green-800 uppercase">Grade Hasil</p>
            <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center font-black text-4xl shadow-md mx-auto mt-1">
              {session.grade}
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide border-b pb-2">Skor Per Kategori Inspeksi</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryScores.map(cat => (
              <div key={cat.name} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 font-medium">{cat.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mr-3">
                    <div className="bg-[var(--primary)] h-full rounded-full" style={{ width: `${cat.score}%` }}></div>
                  </div>
                  <span className="font-bold text-sm text-gray-800">{cat.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide border-b pb-2">Catatan Temuan & Transparansi Kondisi</h3>
          {nonNormalItems.length === 0 ? (
            <div className="p-4 bg-green-50 text-green-800 rounded-xl text-sm font-medium border border-green-200 text-center">
              ✓ Semua komponen dalam kondisi normal / sesuai standar inspeksi.
            </div>
          ) : (
            <div className="space-y-4">
              {nonNormalItems.map((item: any) => {
                const snap = session.snapshot.find((s: any) => s.itemKey === item.packageItem?.itemKey);
                return (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{snap?.question || item.packageItem?.question}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Status Pemeriksaan: <span className="font-semibold text-orange-700">{item.status}</span> ({item.answer})</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        item.repairStatus === 'SUDAH_DIPERBAIKI' ? 'bg-green-100 text-green-800 border border-green-300' :
                        item.repairStatus === 'SEBAGAIMANA_ADANYA' ? 'bg-gray-200 text-gray-800 border border-gray-300' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {item.repairStatus === 'SUDAH_DIPERBAIKI' ? '✓ Sudah Diperbaiki' :
                         item.repairStatus === 'SEBAGAIMANA_ADANYA' ? 'Dijual Apa Adanya' : 'Perlu Perbaikan'}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs bg-white p-2.5 rounded-lg border border-gray-200 italic text-gray-700">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Inline Evidence Photos */}
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="flex gap-3 pt-2">
                        {item.evidence.map((ev: any) => (
                          <img 
                            key={ev.id}
                            src={`/api/inspection-evidence/${ev.id}`}
                            alt="Bukti Temuan"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Dates & Signatures */}
        <div className="border-t-2 border-gray-200 pt-6 flex justify-between items-center text-xs text-gray-500">
          <div>
            <p><strong>Tanggal Inspeksi:</strong> {inspectionDateStr}</p>
            <p><strong>Tanggal Cetak Dokumen:</strong> {printDateStr}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800">Timbul Motor Kebumen</p>
            <p className="text-[10px] text-gray-400">Dokumen Digital Terverifikasi</p>
          </div>
        </div>

      </div>
    </div>
  );
}
