import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessionCookie = (await cookies()).get("session")?.value;
  let role = "ADMIN";
  let name = "Admin";
  if (sessionCookie) {
    const payload = await verifySession(sessionCookie);
    if (payload) {
      role = payload.role as string;
      name = payload.name as string;
    }
  }

  return (
    <div className="flex h-[100dvh] w-full bg-[var(--muted)] overflow-hidden">
      {/* Sidebar for Desktop */}
      <AdminSidebar role={role} name={name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header (Visible only on small screens) */}
        <header className="md:hidden h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-4">
          <Link href="/admin" className="font-black text-lg text-[var(--primary)] tracking-tight">
            TIMBUL MOTOR
          </Link>
          <button className="p-2 text-[var(--foreground)] bg-[var(--muted)] rounded-md">
            <Menu size={20} />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
