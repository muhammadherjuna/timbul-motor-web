"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function QuickSearch() {
  const router = useRouter();
  const [brand, setBrand] = useState("Semua");
  const [price, setPrice] = useState("Semua");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand !== "Semua") params.set("brand", brand);
    if (price !== "Semua") params.set("price", price);
    
    const query = params.toString();
    router.push(`/stok${query ? `?${query}` : ""}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[var(--border)] p-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full flex-1">
        <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Merek Motor</label>
        <select 
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full bg-[var(--muted)] border-none rounded-lg px-4 py-3 text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] outline-none cursor-pointer"
        >
          <option value="Semua">Semua Merek</option>
          <option value="Honda">Honda</option>
          <option value="Yamaha">Yamaha</option>
          <option value="Suzuki">Suzuki</option>
          <option value="Kawasaki">Kawasaki</option>
        </select>
      </div>
      <div className="w-full flex-1">
        <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Harga Maksimal</label>
        <select 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-[var(--muted)] border-none rounded-lg px-4 py-3 text-[var(--foreground)] font-medium focus:ring-2 focus:ring-[var(--primary)] outline-none cursor-pointer"
        >
          <option value="Semua">Semua Harga</option>
          <option value="< Rp 10 Juta">Di bawah Rp 10 Juta</option>
          <option value="Rp 10 - 15 Juta">Rp 10 - 15 Juta</option>
          <option value="> Rp 15 Juta">Di atas Rp 15 Juta</option>
        </select>
      </div>
      <button 
        onClick={handleSearch}
        className="w-full md:w-auto bg-[var(--accent)] text-[var(--foreground)] px-8 py-3 rounded-lg font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2"
      >
        <Search size={18} /> Cari
      </button>
    </div>
  );
}
