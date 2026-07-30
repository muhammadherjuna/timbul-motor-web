import { getBranches } from "@/lib/branch-actions";
import BranchClient from "./BranchClient";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "Manajemen Cabang | Timbul Motor",
};

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[var(--primary)] border border-[var(--border)]">
          <MapPin size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Manajemen Cabang</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola lokasi showroom atau cabang untuk penempatan unit motor.</p>
        </div>
      </div>

      <BranchClient initialBranches={branches} />
    </div>
  );
}
