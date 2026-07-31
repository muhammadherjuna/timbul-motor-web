import prisma from "@/lib/db";
import Link from "next/link";
import { ClipboardList, Star, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function InspectionsSettingsPage() {
  const packages = await prisma.inspectionPackage.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { categories: true } } }
  });

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Paket Inspeksi</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Kelola paket pertanyaan dan kategori inspeksi motor.</p>
      </div>

      <div className="grid gap-4">
        {packages.map((pkg) => (
          <Link href={`/admin/settings/inspections/${pkg.id}`} key={pkg.id}>
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-all p-5 flex items-center justify-between group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-lg text-gray-800">{pkg.name}</h2>
                    {pkg.isDefault && (
                      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        <Star size={12} className="fill-yellow-500" /> Default
                      </span>
                    )}
                    {!pkg.isActive && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Nonaktif</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                  <p className="text-xs text-gray-400 font-medium">{pkg._count.categories} Kategori Pemeriksaan</p>
                </div>
              </div>
              <div className="text-gray-300 group-hover:text-[var(--primary)] transition-colors pr-2">
                <ChevronRight size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-6">
        <p className="text-sm text-blue-800 font-medium">💡 Informasi Sistem</p>
        <p className="text-xs text-blue-600 mt-1">Anda tidak dapat menambah kategori atau merubah persentase bobot demi menjaga standar kualitas dan objektivitas inspeksi Timbul Motor. Anda hanya diizinkan untuk menonaktifkan (toggle off) item pemeriksaan yang tidak relevan dengan motor tertentu.</p>
      </div>
    </div>
  );
}
