import prisma from "@/lib/db";
import { Package, CheckCircle, Clock, PlusCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export default async function AdminDashboard() {
  const sessionCookie = (await cookies()).get("session")?.value;
  let role = "ADMIN";
  if (sessionCookie) {
    const payload = await verifySession(sessionCookie);
    if (payload) {
      role = payload.role as string;
    }
  }

  const motorsData: any = await prisma.motor.findMany({
    orderBy: { createdAt: 'desc' },
    include: { pricing: true, document: true, history: true, inspection: true }
  } as any);

  let pendingApprovals: any[] = [];
  let completedInspectionsCount = 0;
  if (role === "SUPERVISOR") {
    pendingApprovals = await prisma.inspectionSession.findMany({
      where: { status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { motor: true }
    });
    completedInspectionsCount = await prisma.inspectionSession.count({
      where: { status: "APPROVED" }
    });
  }

  const motors: any[] = motorsData.map((m: any) => ({
    ...m, ...(m.pricing||{}), ...(m.document||{}), ...(m.history||{}), ...(m.inspection||{}), id: m.id
  }));

  const totalMotors = motors.length;
  const availableMotors = motors.filter(m => m.status === "Tersedia" || m.status === "Baru Masuk").length;
  const soldMotors = motors.filter(m => m.status === "Terjual").length;
  const bookedMotors = motors.filter(m => m.status === "Sedang Dipesan").length;
  
  // Deteksi pajak mati / mau habis
  const taxAlerts = motors.filter(m => {
    if (!m.tax_status) return false;
    const lower = m.tax_status.toLowerCase();
    return lower.includes("mati") || lower.includes("habis");
  });

  const adminCards = [
    { title: "Total Stok", value: totalMotors, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Tersedia", value: availableMotors, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "Dipesan", value: bookedMotors, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { title: "Terjual", value: soldMotors, icon: Package, color: "text-gray-600", bg: "bg-gray-100" },
  ];

  const mechanicCards = [
    { title: "Total Unit", value: totalMotors, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Baru Masuk (Perlu Cek)", value: motors.filter(m => m.status === "Baru Masuk").length, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Siap Jual", value: availableMotors, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  ];

  const supervisorCards = [
    { title: "Menunggu Approval", value: pendingApprovals.length, icon: ShieldCheck, color: "text-red-600", bg: "bg-red-100" },
    { title: "Inspeksi Approved", value: completedInspectionsCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Tersedia", value: availableMotors, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  const statCards = role === "MECHANIC" ? mechanicCards : (role === "SUPERVISOR" ? supervisorCards : adminCards);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {role === "MECHANIC" ? "Dashboard Mekanik" : (role === "SUPERVISOR" ? "Dashboard Supervisor" : "Ringkasan Dashboard")}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {role === "MECHANIC" ? "Pantau tugas inspeksi dan status unit." : (role === "SUPERVISOR" ? "Kelola persetujuan inspeksi dan pantau ketersediaan stok." : "Pantau status stok dan performa penjualan.")}
          </p>
        </div>
        {role !== "MECHANIC" && (
          <Link 
            href="/admin/inventory/add" 
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            <PlusCircle size={18} />
            Tambah Stok Baru
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">{stat.title}</p>
              <h3 className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* WIDGET SUPERVISOR: MENUNGGU PERSETUJUAN */}
      {role === "SUPERVISOR" && pendingApprovals.length > 0 && (
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-orange-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-orange-600" size={20} />
              <h2 className="font-bold text-orange-900">Menunggu Persetujuan Inspeksi</h2>
            </div>
            <Link href="/admin/inspections" className="text-sm text-orange-700 font-medium hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="text-sm divide-y divide-[var(--border)]">
                {pendingApprovals.map((sess) => (
                  <tr key={sess.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[var(--foreground)]">{sess.motor?.name || "Unknown"}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Oleh: {sess.inspectorName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        Grade {sess.grade || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/inventory/${sess.motorId}/edit?tab=4`} 
                        className="inline-block px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Tinjau Form
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WIDGET PERINGATAN PAJAK */}
      {role !== "MECHANIC" && taxAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm mt-8">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            <h2 className="font-bold text-red-800 text-lg">Perhatian: Dokumen Jatuh Tempo</h2>
          </div>
          <p className="text-sm text-red-700 mb-4">Ada {taxAlerts.length} unit motor yang status pajaknya mati atau hampir habis. Segera tindaklanjuti untuk menghindari penurunan harga jual.</p>
          
          <div className="space-y-3">
            {taxAlerts.map(motor => (
              <div key={motor.id} className="bg-white border border-red-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                    <img src={motor.image || ''} alt={motor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Link href={`/admin/inventory/${motor.id}/edit`} className="font-semibold text-gray-800 hover:text-[var(--primary)] hover:underline">
                      {motor.name}
                    </Link>
                    <p className="text-xs text-gray-500">{motor.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                    {motor.tax_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-[var(--foreground)]">{role === "MECHANIC" ? "Unit Masuk Terbaru" : "Stok Baru Ditambahkan"}</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm">
                <th className="px-6 py-3 font-medium">Kode</th>
                <th className="px-6 py-3 font-medium">Motor</th>
                {role !== "MECHANIC" && <th className="px-6 py-3 font-medium">Harga</th>}
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[var(--border)]">
              {motors.slice(0, 5).map((motor) => (
                <tr key={motor.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">{motor.code}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden shrink-0">
                        <img src={motor.image || ''} alt={motor.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{motor.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{motor.year} • {motor.type}</p>
                      </div>
                    </div>
                  </td>
                  {role !== "MECHANIC" && (
                    <td className="px-6 py-4 font-semibold text-[var(--primary)]">
                      Rp {motor.price.toLocaleString("id-ID")}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block
                      ${motor.status === "Tersedia" ? "bg-green-100 text-green-700" : ""}
                      ${motor.status === "Baru Masuk" ? "bg-blue-100 text-blue-700" : ""}
                      ${motor.status === "Sedang Dipesan" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${motor.status === "Terjual" ? "bg-gray-100 text-gray-700" : ""}
                    `}>
                      {motor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
