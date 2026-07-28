import LoginForm from "@/components/admin/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 text-center bg-[var(--primary)] text-white">
            <h1 className="text-2xl font-black tracking-tight mb-2">TIMBUL MOTOR <span className="text-[var(--accent)]">ADMIN</span></h1>
            <p className="text-blue-100 text-sm">Masuk untuk mengelola inventaris dan pengaturan showroom.</p>
          </div>
          
          <div className="p-8">
            <LoginForm />
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Sistem Manajemen Timbul Motor Kebumen &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
