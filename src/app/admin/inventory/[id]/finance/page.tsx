"use client";

import { mockMotors } from "@/data/mockData";
import { ArrowLeft, Calculator, Copy, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, use, useEffect } from "react";

export default function FinanceSimulatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const motor = mockMotors.find(m => m.id === id);
  
  const [dp, setDp] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Default to min DP if motor exists
  useEffect(() => {
    if (motor) {
      setDp(motor.dp_min);
    }
  }, [motor]);

  if (!motor) {
    return notFound();
  }

  // Simple calculation (mock logic)
  const principal = motor.price - dp;
  const interestRate = 0.025; // 2.5% flat per month assumption
  
  const calcInstallment = (months: number) => {
    const totalInterest = principal * interestRate * months;
    return Math.round((principal + totalInterest) / months);
  };

  const installments = {
    11: calcInstallment(11),
    23: calcInstallment(23),
    35: calcInstallment(35)
  };

  const waText = `Halo kak! Berikut adalah penawaran spesial dari *Timbul Motor Kebumen*:\n\n*${motor.name} (${motor.year})*\nHarga Cash: Rp ${motor.price.toLocaleString('id-ID')}\n\n*Simulasi Kredit (DP Rp ${dp.toLocaleString('id-ID')}):*\n- 11x Rp ${installments[11].toLocaleString('id-ID')}\n- 23x Rp ${installments[23].toLocaleString('id-ID')}\n- 35x Rp ${installments[35].toLocaleString('id-ID')}\n\n_Catatan: Hitungan ini adalah estimasi dan bisa berubah sesuai kebijakan pihak leasing saat pengajuan._\n\nApakah berminat untuk cek fisik unitnya di showroom kami kak?`;

  const handleCopy = () => {
    navigator.clipboard.writeText(waText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/inventory" 
          className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--muted-foreground)]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Simulasi Kredit & Follow Up</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Buat penawaran kredit untuk {motor.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Kalkulator Kiri */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <img src={motor.image} alt={motor.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-bold text-lg">{motor.name}</p>
              <p className="text-[var(--primary)] font-semibold">Harga: Rp {motor.price.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Down Payment (DP) Pelanggan</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-[var(--muted-foreground)]">Rp</span>
                <input 
                  type="number" 
                  value={dp}
                  onChange={(e) => setDp(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 text-lg font-bold"
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Minimal DP anjuran: Rp {motor.dp_min.toLocaleString('id-ID')}</p>
            </div>

            <div className="bg-[var(--muted)] p-4 rounded-lg space-y-3">
              <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase">Hasil Perhitungan</h3>
              <div className="flex justify-between items-center bg-white p-3 rounded border border-[var(--border)]">
                <span className="font-semibold">11 Bulan</span>
                <span className="font-bold text-[var(--foreground)]">Rp {installments[11].toLocaleString('id-ID')} /bln</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded border border-[var(--border)]">
                <span className="font-semibold">23 Bulan</span>
                <span className="font-bold text-[var(--foreground)]">Rp {installments[23].toLocaleString('id-ID')} /bln</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded border border-[var(--border)]">
                <span className="font-semibold">35 Bulan</span>
                <span className="font-bold text-[var(--foreground)]">Rp {installments[35].toLocaleString('id-ID')} /bln</span>
              </div>
            </div>
          </div>
        </div>

        {/* Teks WA Kanan */}
        <div className="bg-[#e7f8ec] p-6 rounded-xl border border-[#25D366]/30 shadow-sm flex flex-col h-full">
          <h2 className="font-bold text-[#075e54] flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#25D366]"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Teks Balasan WhatsApp
          </h2>
          
          <div className="flex-1 bg-white p-4 rounded-lg border border-[#25D366]/20 whitespace-pre-wrap font-sans text-sm text-gray-800 shadow-inner mb-4 overflow-y-auto">
            {waText}
          </div>

          <button 
            onClick={handleCopy}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              copied 
                ? "bg-green-600 text-white" 
                : "bg-[#25D366] text-white hover:bg-[#20b858] shadow-lg shadow-[#25D366]/30"
            }`}
          >
            {copied ? (
              <><Check size={20} /> Berhasil Disalin!</>
            ) : (
              <><Copy size={20} /> Copy Teks ke WA</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
