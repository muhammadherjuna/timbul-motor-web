"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

interface Props {
  price: number;
  minDp: number;
}

export default function InstallmentCalculator({ price, minDp }: Props) {
  const [dp, setDp] = useState(minDp);
  const [tenor, setTenor] = useState(35); // Default tenor

  // Basic flat interest rate assumption (e.g., 2% per month)
  const principal = Math.max(0, price - dp);
  const interestPerMonth = 0.02; 
  const monthlyInstallment = Math.round((principal / tenor) + (principal * interestPerMonth));

  return (
    <div className="mb-8 p-5 rounded-xl border border-[var(--border)] bg-white">
      <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
        <Calculator size={18} /> Estimasi Cicilan
      </h3>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Uang Muka (DP)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm font-medium text-[var(--foreground)]">Rp</span>
            <input 
              type="number" 
              min={minDp}
              value={dp || ""} 
              onChange={(e) => setDp(Number(e.target.value))}
              className="w-full bg-white border border-[var(--border)] rounded-md pl-9 pr-3 py-2 text-sm font-medium focus:ring-1 focus:ring-[var(--primary)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>
          {dp < minDp && (
            <span className="text-[10px] text-red-500 mt-1 block font-medium">Minimal: Rp {minDp.toLocaleString('id-ID')}</span>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tenor</label>
          <select 
            value={tenor}
            onChange={(e) => setTenor(Number(e.target.value))}
            className="w-full bg-white border border-[var(--border)] rounded-md px-3 py-2 text-sm font-medium cursor-pointer outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)]"
          >
            <option value={11}>11 Bulan</option>
            <option value={23}>23 Bulan</option>
            <option value={35}>35 Bulan</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--primary)]/10 rounded-lg p-4 mb-4 flex items-center justify-between border border-[var(--primary)]/20">
        <div>
          <div className="text-xs font-semibold text-[var(--primary)] mb-1">Perkiraan Angsuran</div>
          <div className="text-2xl font-black text-[var(--primary)]">
            Rp {monthlyInstallment.toLocaleString('id-ID')}
            <span className="text-sm font-medium text-[var(--primary)]/70"> /bln</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[var(--muted-foreground)] italic leading-tight">
        *Nilai cicilan hanya estimasi awal dengan asumsi bunga flat. Silakan hubungi kami untuk perhitungan aktual yang lebih akurat dari leasing rekanan.
      </p>
    </div>
  );
}
