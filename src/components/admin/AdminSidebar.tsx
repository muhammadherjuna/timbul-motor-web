"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, LogOut, FileText } from "lucide-react";
import { logout } from "@/lib/auth";

const menuItems = [
  { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { name: "Inventaris Stok", href: "/admin/inventory", icon: Package },
  { name: "Laporan", href: "/admin/reports", icon: FileText },
  { name: "Pengaturan", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[var(--border)] h-full flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <Link href="/admin" className="font-black text-xl text-[var(--primary)] tracking-tight">
          TIMBUL MOTOR <span className="text-[var(--accent)]">ADMIN</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-[var(--muted-foreground)] mb-4 px-2 uppercase tracking-wider">
          Menu Utama
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[var(--primary)] text-white" 
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-[var(--muted-foreground)]"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold text-sm">
            N
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-[var(--foreground)] truncate">Admin Timbul</p>
            <form action={logout}>
              <button type="submit" className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors flex items-center gap-1 mt-0.5">
                <LogOut size={12} /> Keluar
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
