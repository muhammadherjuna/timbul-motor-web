"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ChevronRight, Phone, Filter, Scale } from "lucide-react";
import ComparisonModal from "@/components/public/ComparisonModal";

function StokContent({ initialMotors }: { initialMotors: any[] }) {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("brand") || "Semua";
  const initialPrice = searchParams.get("price") || "Semua";

  const [brandFilter, setBrandFilter] = useState(initialBrand);
  const [priceFilter, setPriceFilter] = useState(initialPrice);
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terbaru Masuk");
  
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const filteredMotors = useMemo(() => {
    let result = [...initialMotors];

    // Filter Merek
    if (brandFilter !== "Semua") {
      result = result.filter(m => m.brand.toLowerCase() === brandFilter.toLowerCase());
    }

    // Filter Harga
    if (priceFilter === "< Rp 10 Juta") {
      result = result.filter(m => m.price < 10000000);
    } else if (priceFilter === "Rp 10 - 15 Juta") {
      result = result.filter(m => m.price >= 10000000 && m.price <= 15000000);
    } else if (priceFilter === "> Rp 15 Juta") {
      result = result.filter(m => m.price > 15000000);
    }

    // Filter Tipe
    if (typeFilter !== "Semua") {
      result = result.filter(m => m.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // Filter Status
    if (statusFilter !== "Semua") {
      result = result.filter(m => m.status === statusFilter);
    }

    // Sorting
    if (sortBy === "Harga Terendah") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Harga Tertinggi") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Tahun Terbaru") {
      result.sort((a, b) => b.year - a.year);
    } else {
      // Terbaru Masuk (sort by createdAt if available, else fallback)
      result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return b.id.localeCompare(a.id);
      });
    }

    return result;
  }, [brandFilter, priceFilter, typeFilter, statusFilter, sortBy, initialMotors]);

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
    <main className="min-h-screen bg-[var(--background)] flex flex-col relative pb-24">
      {/* PAGE HEADER */}
      <div className="bg-[var(--primary)] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-black mb-2">Katalog Motor Bekas</h1>
          <p className="text-blue-100">Temukan motor idaman Anda dengan kondisi transparan dan harga terbaik.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        {/* SIDEBAR FILTER */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-[var(--border)] rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-[var(--foreground)] font-bold text-lg border-b border-[var(--border)] pb-4">
              <Filter size={20} /> Filter Pencarian
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Merek</label>
                <div className="space-y-2">
                  {['Semua', 'Honda', 'Yamaha', 'Suzuki', 'Kawasaki'].map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
                      <input 
                        type="radio" 
                        name="brand" 
                        value={brand}
                        checked={brandFilter === brand}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" 
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Harga</label>
                <div className="space-y-2">
                  {['Semua', '< Rp 10 Juta', 'Rp 10 - 15 Juta', '> Rp 15 Juta'].map(price => (
                    <label key={price} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
                      <input 
                        type="radio" 
                        name="price" 
                        value={price}
                        checked={priceFilter === price}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" 
                      />
                      {price}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Tipe</label>
                <div className="space-y-2">
                  {['Semua', 'Matic', 'Bebek', 'Sport'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        value={type}
                        checked={typeFilter === type}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" 
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--foreground)] mb-3">Status Motor</label>
                <div className="space-y-2">
                  {['Semua', 'Tersedia', 'Sedang Dipesan', 'Terjual'].map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value={status}
                        checked={statusFilter === status}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" 
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full bg-[var(--primary)] text-white mt-8 py-2 rounded-lg font-bold hover:bg-[var(--primary)]/90 transition-colors"
            >
              Terapkan Filter
            </button>
          </div>
        </aside>

        {/* MAIN GRID */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <span className="text-[var(--muted-foreground)] font-medium">Menampilkan {filteredMotors.length} motor</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] font-medium outline-none cursor-pointer focus:ring-1 focus:ring-[var(--primary)] w-full sm:w-auto"
            >
              <option value="Terbaru Masuk">Terbaru Masuk</option>
              <option value="Harga Terendah">Harga Terendah</option>
              <option value="Harga Tertinggi">Harga Tertinggi</option>
              <option value="Tahun Terbaru">Tahun Terbaru</option>
            </select>
          </div>

          {filteredMotors.length === 0 ? (
            <div className="bg-white border border-[var(--border)] rounded-xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4 text-[var(--muted-foreground)]">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Motor tidak ditemukan</h3>
              <p className="text-[var(--muted-foreground)] mb-6">Coba ubah kriteria filter pencarian Anda.</p>
              <button 
                onClick={() => {
                  setBrandFilter("Semua");
                  setPriceFilter("Semua");
                  setTypeFilter("Semua");
                  setStatusFilter("Semua");
                }}
                className="bg-white border-2 border-[var(--primary)] text-[var(--primary)] px-6 py-2 rounded-lg font-bold hover:bg-[var(--primary)]/5 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMotors.map((motor) => (
                <div key={motor.id} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-xl transition-all group flex flex-col relative">
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
        </div>
      </div>

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
    </main>
  );
}

export default function StokClient({ initialMotors }: { initialMotors: any[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-bold text-[var(--muted-foreground)]">Memuat data stok...</div>}>
      <StokContent initialMotors={initialMotors} />
    </Suspense>
  );
}
