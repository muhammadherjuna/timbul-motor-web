"use client";

import { X, CheckCircle } from "lucide-react";
import { mockMotors } from "@/data/mockData";
import { useMemo } from "react";

interface ComparisonModalProps {
  motorIds: string[];
  onClose: () => void;
}

export default function ComparisonModal({ motorIds, onClose }: ComparisonModalProps) {
  const selectedMotors = useMemo(() => {
    return motorIds.map(id => mockMotors.find(m => m.id === id)).filter(Boolean) as typeof mockMotors;
  }, [motorIds]);

  if (selectedMotors.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--muted)]/50 shrink-0">
          <h2 className="font-bold text-xl text-[var(--foreground)]">Perbandingan Spesifikasi</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-auto p-5">
          <div className="min-w-[700px]">
            {/* Header Row (Photos and Names) */}
            <div className="flex gap-4 mb-6">
              <div className="w-1/4 shrink-0 flex items-center justify-center border-b-2 border-transparent">
                {/* Kosong agar sejajar dengan gambar */}
              </div>
              {selectedMotors.map(motor => (
                <div key={motor.id} className="flex-1 bg-white border border-[var(--border)] rounded-xl overflow-hidden flex flex-col relative group">
                  <div className="aspect-[4/3] bg-gray-100">
                    <img src={motor.image} alt={motor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-bold text-sm leading-tight text-[var(--foreground)]">{motor.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{motor.code}</p>
                  </div>
                </div>
              ))}
              {/* Fill empty spots if less than 3 */}
              {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => (
                <button 
                  key={`empty-${i}`} 
                  onClick={onClose}
                  className="flex-1 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center bg-gray-50 text-[var(--muted-foreground)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-colors group p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold">+</span>
                  </div>
                  <span className="text-sm font-bold">Tambah Motor</span>
                  <span className="text-xs mt-1 text-center opacity-70">Pilih dari katalog</span>
                </button>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4">
              <div className="flex gap-4 items-center border-b border-[var(--border)] pb-2">
                <div className="w-1/4 font-semibold text-[var(--foreground)]">Harga Cash</div>
                {selectedMotors.map(m => (
                  <div key={m.id} className="flex-1 font-bold text-[var(--primary)]">Rp {m.price.toLocaleString('id-ID')}</div>
                ))}
                {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => <div key={i} className="flex-1"></div>)}
              </div>

              <div className="flex gap-4 items-center border-b border-[var(--border)] pb-2">
                <div className="w-1/4 font-semibold text-[var(--foreground)]">DP Minimal</div>
                {selectedMotors.map(m => (
                  <div key={m.id} className="flex-1 text-[var(--foreground)]">Rp {m.dp_min.toLocaleString('id-ID')}</div>
                ))}
                {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => <div key={i} className="flex-1"></div>)}
              </div>

              <div className="flex gap-4 items-center border-b border-[var(--border)] pb-2">
                <div className="w-1/4 font-semibold text-[var(--foreground)]">Tahun / Kilometer</div>
                {selectedMotors.map(m => (
                  <div key={m.id} className="flex-1 text-[var(--foreground)]">{m.year} / {m.km.toLocaleString('id-ID')} km</div>
                ))}
                {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => <div key={i} className="flex-1"></div>)}
              </div>

              <div className="flex gap-4 items-center border-b border-[var(--border)] pb-2">
                <div className="w-1/4 font-semibold text-[var(--foreground)]">Mesin & Transmisi</div>
                {selectedMotors.map(m => (
                  <div key={m.id} className="flex-1 text-[var(--foreground)]">{m.specs.cc}cc - {m.specs.transmission}</div>
                ))}
                {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => <div key={i} className="flex-1"></div>)}
              </div>

              <div className="flex gap-4 items-center border-b border-[var(--border)] pb-2">
                <div className="w-1/4 font-semibold text-[var(--foreground)]">Pajak</div>
                {selectedMotors.map(m => (
                  <div key={m.id} className="flex-1 text-[var(--foreground)]">{m.condition.tax}</div>
                ))}
                {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => <div key={i} className="flex-1"></div>)}
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-1/4 font-semibold text-[var(--foreground)]">Kondisi (Minus)</div>
                {selectedMotors.map(m => (
                  <div key={m.id} className="flex-1 text-sm text-[var(--muted-foreground)]">
                    {m.condition.minus === "Tidak ada" ? (
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle size={14} /> Mulus</span>
                    ) : (
                      m.condition.minus
                    )}
                  </div>
                ))}
                {Array.from({ length: 3 - selectedMotors.length }).map((_, i) => <div key={i} className="flex-1"></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
