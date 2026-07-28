import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { MapPin, Phone, CheckCircle, ShieldCheck, Calendar, Gauge, Cog, ChevronLeft } from "lucide-react";
import InstallmentCalculator from "@/components/InstallmentCalculator";
import BookingModal from "@/components/public/BookingModal";
import StokImageGallery from "@/components/public/StokImageGallery";

export default async function StokDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const motor = await prisma.motor.findUnique({ where: { id } });
  
  if (!motor) {
    notFound();
  }

  const waMessage = encodeURIComponent(`Halo Timbul Motor, saya tertarik dengan ${motor.name} kode ${motor.code}. Apakah unit masih tersedia?`);

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* BREADCRUMB */}
      <div className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/stok" className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] font-medium transition-colors">
            <ChevronLeft size={20} /> Kembali ke Stok
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* LEFT: IMAGE & BADGES */}
          <div className="space-y-4">
            <StokImageGallery 
              images={motor.images || [motor.image]} 
              name={motor.name} 
              status={motor.status} 
            />
            
            {/* TRUST BOX */}
            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl p-5 mt-6 flex items-start gap-4">
              <ShieldCheck className="text-[var(--primary)] shrink-0 mt-1" size={28} />
              <div>
                <h4 className="font-bold text-[var(--foreground)] mb-1">Garansi Transparansi Timbul Motor</h4>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Semua informasi kondisi dan dokumen kendaraan yang ditampilkan adalah nyata. Anda berhak melakukan pengecekan ulang dan test ride langsung di showroom.
                </p>
              </div>
            </div>

            {/* VIDEO WALKAROUND */}
            {motor.videoUrl && (
              <div className="mt-6">
                <h4 className="font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Video Walkaround 360°
                </h4>
                <div className="relative aspect-[9/16] max-w-[350px] mx-auto rounded-2xl overflow-hidden bg-black shadow-lg">
                  <iframe 
                    src={motor.videoUrl}
                    title="Video Motor"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: INFO & ACTIONS */}
          <div className="flex flex-col">
            <div className="mb-2 text-sm text-[var(--muted-foreground)] font-semibold uppercase tracking-wider flex items-center gap-2">
              <span>{motor.brand}</span> • <span>Kode: {motor.code}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-4">{motor.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[var(--muted-foreground)] mb-6">
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><Calendar size={16}/> {motor.year}</div>
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><Gauge size={16}/> {motor.km.toLocaleString('id-ID')} km</div>
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><Cog size={16}/> {motor.type.toUpperCase()}</div>
            </div>

            <div className="mb-8">
              <div className="text-sm text-[var(--muted-foreground)] font-semibold mb-1">Harga Cash</div>
              <div className="text-4xl font-black text-[var(--primary)]">Rp {motor.price.toLocaleString('id-ID')}</div>
            </div>

            {/* QUICK SPECS */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-6 border-y border-[var(--border)] mb-8">
              <div>
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Kapasitas Mesin</div>
                <div className="font-semibold text-[var(--foreground)]">{motor.cc} cc</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Transmisi</div>
                <div className="font-semibold text-[var(--foreground)]">{motor.transmission}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Pajak</div>
                <div className="font-semibold text-[var(--foreground)]">{motor.tax_status} {motor.tax_expiry ? `(${motor.tax_expiry})` : ""}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Dokumen</div>
                <div className="font-semibold text-[var(--foreground)]">
                  {motor.bpkb_ready ? 'BPKB' : ''} {motor.stnk_ready ? '& STNK' : ''}
                </div>
              </div>
            </div>

            {/* DIGITAL INSPECTION REPORT */}
            <div className="mb-8 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#f0fdf4] px-5 py-4 border-b border-green-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-green-800 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-green-600" /> Hasil Inspeksi Resmi
                  </h3>
                  <p className="text-xs text-green-700 mt-1">Telah dicek oleh mekanik tersertifikasi Timbul Motor</p>
                </div>
              </div>
              
              {(motor.engine_sound || motor.cvt_chain) ? (
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-4">
                    {[
                      { label: 'Suara & Performa Mesin', status: motor.engine_sound },
                      { label: 'CVT / Rantai', status: motor.cvt_chain },
                      { label: 'Kelistrikan & Lampu', status: motor.electrical_lights },
                      { label: 'Sistem Pengereman', status: motor.brakes },
                      { label: 'Suspensi & Kaki-kaki', status: motor.suspension },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-[var(--muted)] pb-2">
                        <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                        {item.status === 'Aman' ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                            <CheckCircle size={14} /> Aman
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            Catatan
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {motor.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <div className="text-xs font-bold text-yellow-800 mb-1">Catatan Teknisi / Minus:</div>
                      <p className="text-sm text-yellow-700 leading-relaxed">
                        {motor.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 border-b border-[var(--muted)] pb-3">
                    <div className="text-sm text-[var(--muted-foreground)]">Kondisi Mesin</div>
                    <div className="col-span-2 text-sm font-semibold">{motor.engine_condition}</div>
                  </div>
                  <div className="grid grid-cols-3 border-b border-[var(--muted)] pb-3">
                    <div className="text-sm text-[var(--muted-foreground)]">Kondisi Bodi</div>
                    <div className="col-span-2 text-sm font-semibold">{motor.body_condition}</div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div className="text-sm text-[var(--danger)] font-medium">Catatan / Minus</div>
                    <div className="col-span-2 text-sm font-semibold">{motor.description || 'Tidak ada catatan'}</div>
                  </div>
                </div>
              )}
            </div>

            {/* CREDIT SIMULATION (INTERACTIVE) */}
            <InstallmentCalculator price={motor.price} minDp={motor.dp_min} />

            {/* BOOKING TEST DRIVE MODAL */}
            <div className="mt-8">
              <BookingModal motorName={motor.name} motorCode={motor.code} />
            </div>

            {/* DESKTOP ACTION BUTTONS */}
            <div className="hidden md:flex gap-4 mt-2">
              <a 
                href={`https://wa.me/6281234567890?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#20b858] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
              >
                <Phone size={20} /> Tanya via WhatsApp
              </a>
              <a 
                href={`https://maps.google.com/?q=Timbul+Motor+Kebumen`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-white border-2 border-[var(--primary)] text-[var(--primary)] py-3 rounded-xl font-bold hover:bg-[var(--primary)]/5 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={20} /> Cek Lokasi Showroom
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR FOR MOBILE ONLY */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--border)] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] z-40 md:hidden">
        <div className="flex gap-3">
          <a 
            href={`https://wa.me/6281234567890?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#20b858] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30"
          >
            <Phone size={18} /> WhatsApp
          </a>
          <a 
            href={`https://maps.google.com/?q=Timbul+Motor+Kebumen`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-white border-2 border-[var(--primary)] text-[var(--primary)] py-3 rounded-xl font-bold text-sm hover:bg-[var(--primary)]/5 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={18} /> Lokasi Showroom
          </a>
        </div>
      </div>
    </main>
  );
}
