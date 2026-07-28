"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, Phone, ArrowRight, Scale } from "lucide-react";
import ComparisonModal from "./public/ComparisonModal";

export default function HomeStockBrowser({ motors = [] }: { motors?: any[] }) {
  const [brand, setBrand] = useState("Semua");
  const [price, setPrice] = useState("Semua");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredMotors = useMemo(() => {
    let result = [...motors];

    if (brand !== "Semua") {
      result = result.filter(m => m.brand.toLowerCase() === brand.toLowerCase());
    }

    if (price === "< Rp 10 Juta") {
      result = result.filter(m => m.price < 10000000);
    } else if (price === "Rp 10 - 15 Juta") {
      result = result.filter(m => m.price >= 10000000 && m.price <= 15000000);
    } else if (price === "> Rp 15 Juta") {
      result = result.filter(m => m.price > 15000000);
    }

    // Sort by ID descending (newest first)
    result.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    return result;
  }, [brand, price]);

  // Max 4 items on homepage
  const displayedMotors = filteredMotors.slice(0, 4);

  // Link to full stock with current filters
  const getStockLink = () => {
    const params = new URLSearchParams();
    if (brand !== "Semua") params.set("brand", brand);
    if (price !== "Semua") params.set("price", price);
    const query = params.toString();
    return `/stok${query ? `?${query}` : ""}`;
  };

  const handleCompareToggle = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 3) {
        alert("Maksimal 3 motor untuk dibandingkan");
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <>
      {/* QUICK SEARCH */}
      <section className="relative -mt-8 mb-16 container mx-auto px-4 z-10">
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
          <Link 
            href={getStockLink()}
            className="w-full md:w-auto bg-[var(--accent)] text-[var(--foreground)] px-8 py-3 rounded-lg font-bold hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-2 text-center whitespace-nowrap"
          >
            Lihat {filteredMotors.length} Hasil <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* LATEST STOCK */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-[var(--primary)] mb-2">
              {brand !== "Semua" || price !== "Semua" ? "Hasil Pencarian" : "Stok Terbaru"}
            </h2>
            <p className="text-[var(--muted-foreground)]">
              {brand !== "Semua" || price !== "Semua" 
                ? `Menampilkan unit yang sesuai dengan kriteria Anda.` 
                : `Unit pilihan yang baru saja masuk showroom.`}
            </p>
          </div>
          <Link href={getStockLink()} className="hidden sm:flex text-[var(--primary)] font-bold items-center gap-1 hover:underline">
            Lihat Semua Hasil <ChevronRight size={16} />
          </Link>
        </div>
        
        {displayedMotors.length === 0 ? (
          <div className="bg-white border border-[var(--border)] rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4 text-[var(--muted-foreground)]">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Motor tidak ditemukan</h3>
            <p className="text-[var(--muted-foreground)] mb-6">Maaf, belum ada stok yang sesuai dengan pilihan Anda saat ini.</p>
            <button 
              onClick={() => { setBrand("Semua"); setPrice("Semua"); }}
              className="bg-white border-2 border-[var(--primary)] text-[var(--primary)] px-6 py-2 rounded-lg font-bold hover:bg-[var(--primary)]/5 transition-colors"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedMotors.map((motor) => (
              <div key={motor.id} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={motor.image} 
                    alt={motor.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      motor.status === 'Tersedia' ? 'bg-green-100 text-green-700' :
                      motor.status === 'Baru Masuk' ? 'bg-[var(--accent)] text-[var(--foreground)]' :
                      motor.status === 'Sedang Dipesan' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {motor.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <label className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer border border-gray-200 hover:bg-white transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                        checked={compareIds.includes(motor.id)}
                        onChange={() => handleCompareToggle(motor.id)}
                      />
                      <span className="text-xs font-bold text-gray-700">Bandingkan</span>
                    </label>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs text-[var(--muted-foreground)] font-semibold mb-1 flex justify-between">
                    <span>{motor.code}</span>
                    <span>{motor.year} • {motor.km.toLocaleString('id-ID')} km</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-3 text-[var(--foreground)]">{motor.name}</h3>
                  
                  <div className="mt-auto">
                    <div className="text-2xl font-black text-[var(--primary)] mb-1">
                      Rp {motor.price.toLocaleString('id-ID')}
                    </div>
                    {motor.dp_min && (
                      <div className="text-sm text-[var(--muted-foreground)] mb-4">
                        DP mulai <span className="font-semibold text-[var(--foreground)]">Rp {motor.dp_min.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/stok/${motor.id}`} 
                        className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-center py-2 rounded-lg font-bold text-sm hover:bg-[var(--border)] transition-colors"
                      >
                        Detail
                      </Link>
                      <a 
                        href={`https://wa.me/6282326921142?text=Halo%20Timbul%20Motor,%20saya%20tertarik%20dengan%20${encodeURIComponent(motor.name)}%20kode%20${motor.code}.%20Apakah%20unit%20masih%20tersedia?`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#25D366] text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-[#20b858] transition-colors flex items-center justify-center"
                      >
                        <Phone size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link href={getStockLink()} className="block bg-[var(--muted)] text-[var(--foreground)] text-center py-3 rounded-lg font-bold w-full hover:bg-[var(--border)] transition-colors">
            {filteredMotors.length > 4 ? `Lihat ${filteredMotors.length - 4} Motor Lainnya` : "Lihat Semua Hasil"}
          </Link>
        </div>
      </section>

      {/* FLOATING COMPARISON BAR */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 w-full max-w-md px-4">
          <div className="bg-[var(--foreground)] text-[var(--background)] p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--background)]/20 rounded-full flex items-center justify-center">
                <Scale size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Membandingkan Motor</p>
                <p className="text-xs text-gray-400">{compareIds.length} dari 3 dipilih</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCompareIds([])}
                className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => setShowCompare(true)}
                disabled={compareIds.length < 2}
                className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bandingkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompare && (
        <ComparisonModal 
          motorIds={compareIds} 
          onClose={() => setShowCompare(false)} 
        />
      )}
    </>
  );
}
