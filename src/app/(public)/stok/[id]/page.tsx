import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { MapPin, Phone, CheckCircle, ShieldCheck, Calendar, Gauge, Cog, ChevronLeft, FileText, History, Info, AlertTriangle } from "lucide-react";
import InstallmentCalculator from "@/components/InstallmentCalculator";
import BookingModal from "@/components/public/BookingModal";
import StokImageGallery from "@/components/public/StokImageGallery";

export default async function StokDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const motorData: any = await prisma.motor.findUnique({ 
    where: { id },
    include: { document: true, history: true, inspection: true, pricing: true }
  } as any);
  
  if (!motorData) {
    notFound();
  }

  const motor: any = {
    ...motorData,
    ...(motorData.document || {}),
    ...(motorData.history || {}),
    ...(motorData.inspection || {}),
    ...(motorData.pricing || {}),
    id: motorData.id
  };

  const waMessage = encodeURIComponent(`Halo Timbul Motor, saya tertarik dengan ${motor.name} kode ${motor.code}. Apakah unit masih tersedia?`);

  // Mask sensitive data
  const maskString = (str: string | null | undefined, visibleChars: number = 3) => {
    if (!str) return "Tidak tersedia";
    if (str.length <= visibleChars) return "***";
    return str.substring(0, visibleChars) + "********" + str.substring(str.length - 2);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
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
          <div className="space-y-6">
            <StokImageGallery 
              images={motor.images || [motor.image]} 
              name={motor.name} 
              status={motor.status} 
            />
            
            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl p-5 flex items-start gap-4">
              <ShieldCheck className="text-[var(--primary)] shrink-0 mt-1" size={28} />
              <div>
                <h4 className="font-bold text-[var(--foreground)] mb-1">Garansi Transparansi Timbul Motor</h4>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Semua informasi kondisi dan dokumen kendaraan yang ditampilkan adalah nyata. Anda berhak melakukan pengecekan ulang dan test ride langsung di showroom.
                </p>
              </div>
            </div>

            {motor.videoUrl && (
              <div>
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
            <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-4">{motor.name} {motor.variant ? `- ${motor.variant}` : ''}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-[var(--muted-foreground)] mb-6">
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><Calendar size={16}/> {motor.year}</div>
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><Gauge size={16}/> {motor.km.toLocaleString('id-ID')} km</div>
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><Cog size={16}/> {motor.type.toUpperCase()}</div>
              <div className="flex items-center gap-1.5 bg-[var(--muted)] px-3 py-1.5 rounded-md"><MapPin size={16}/> {motor.location || "Showroom Timbul Motor"}</div>
            </div>

            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl">
              <div className="text-sm text-blue-800 font-semibold mb-1">Harga Cash {motor.is_nego ? "(Bisa Nego)" : "(Nett)"}</div>
              <div className="text-4xl font-black text-blue-600">Rp {motor.price.toLocaleString('id-ID')}</div>
              {motor.credit_price && (
                <div className="mt-2 text-sm text-gray-600">Harga Khusus Kredit: <strong className="text-gray-900">Rp {motor.credit_price.toLocaleString('id-ID')}</strong></div>
              )}
            </div>



            {/* TAB: SPESIFIKASI */}
            <div className="mb-6 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-5 py-4 border-b border-[var(--border)]">
                <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Cog size={18} /> Spesifikasi Teknis
                </h3>
              </div>
              <div className="grid grid-cols-2 p-5 gap-y-4 gap-x-4">
                <div><div className="text-xs text-[var(--muted-foreground)]">Kapasitas Mesin</div><div className="font-semibold text-sm">{motor.cc} cc</div></div>
                <div><div className="text-xs text-[var(--muted-foreground)]">Transmisi</div><div className="font-semibold text-sm">{motor.transmission}</div></div>
                <div><div className="text-xs text-[var(--muted-foreground)]">Bahan Bakar</div><div className="font-semibold text-sm">{motor.fuel_system || "Injeksi"}</div></div>
                <div><div className="text-xs text-[var(--muted-foreground)]">Warna Asli</div><div className="font-semibold text-sm">{motor.color}</div></div>
              </div>
            </div>

            {/* TAB: DOKUMEN & LEGALITAS */}
            <div className="mb-6 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#eff6ff] px-5 py-4 border-b border-blue-200">
                <h3 className="font-bold text-blue-900 flex items-center gap-2">
                  <FileText size={18} /> Dokumen & Legalitas
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="text-xs text-[var(--muted-foreground)]">Status STNK</div>
                    <div className="font-semibold text-sm flex items-center gap-1 text-green-700"><CheckCircle size={14}/> {motor.stnk_status || (motor.stnk_ready ? "Ada" : "Proses")}</div>
                  </div>
                  <div><div className="text-xs text-[var(--muted-foreground)]">Status BPKB</div>
                    <div className="font-semibold text-sm flex items-center gap-1 text-green-700"><CheckCircle size={14}/> {motor.bpkb_status || (motor.bpkb_ready ? "Ada" : "Proses")}</div>
                  </div>
                  <div><div className="text-xs text-[var(--muted-foreground)]">Pajak Tahunan</div>
                    <div className={`font-semibold text-sm ${motor.tax_status === "Mati" ? "text-red-600" : "text-green-700"}`}>{motor.tax_status} {motor.tax_expiry ? `(s/d ${motor.tax_expiry})` : ""}</div>
                  </div>
                  <div><div className="text-xs text-[var(--muted-foreground)]">Plat Nomor</div>
                    <div className="font-semibold text-sm">{motor.plate_number ? motor.plate_number.replace(/([a-zA-Z]+) (\d+) ([a-zA-Z]+)/, (m:string, p1:string, p2:string, p3:string) => `${p1} ${p2.charAt(0) + '*'.repeat(p2.length > 1 ? p2.length - 1 : 3)} ${p3.charAt(0) + '*'.repeat(p3.length > 1 ? p3.length - 1 : 1)}`) : "Rahasia"} ({motor.plate_area || "-"})</div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg text-xs grid grid-cols-2 gap-2 mt-4">
                  <div className="text-gray-500">No. Rangka: <span className="font-mono font-bold text-gray-800">{maskString(motor.chassis_number, 5)}</span></div>
                  <div className="text-gray-500">No. Mesin: <span className="font-mono font-bold text-gray-800">{maskString(motor.engine_number, 5)}</span></div>
                  <div className="col-span-2 text-green-600 font-medium">✓ Rangka & Mesin 100% Sesuai Dokumen</div>
                </div>
              </div>
            </div>

            {/* TAB: RIWAYAT UNIT */}
            <div className="mb-6 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-5 py-4 border-b border-[var(--border)]">
                <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <History size={18} /> Riwayat Pemakaian
                </h3>
              </div>
              <div className="grid grid-cols-2 p-5 gap-y-4 gap-x-4">
                <div><div className="text-xs text-[var(--muted-foreground)]">Odometer (KM)</div><div className="font-semibold text-sm">{motor.odo_status || "Terverifikasi"}</div></div>
                <div><div className="text-xs text-[var(--muted-foreground)]">Penggunaan</div><div className="font-semibold text-sm">{motor.usage_type || "Pribadi"}</div></div>
                <div><div className="text-xs text-[var(--muted-foreground)]">Riwayat Banjir</div><div className="font-semibold text-sm">{motor.flood_history || "Bebas Banjir"}</div></div>
                <div><div className="text-xs text-[var(--muted-foreground)]">Riwayat Tabrak</div><div className="font-semibold text-sm">{motor.crash_history || "Bebas Tabrak"}</div></div>
              </div>
            </div>

            {/* DIGITAL INSPECTION REPORT */}
            <div className="mb-8 bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#f0fdf4] px-5 py-4 border-b border-green-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-green-800 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-green-600" /> Laporan Inspeksi Mekanik
                  </h3>
                  <p className="text-xs text-green-700 mt-1">Grade: <strong>{motor.inspection_grade || "Grade A"}</strong> | Inspektor: {motor.inspector_name || "Mekanik Timbul Motor"}</p>
                </div>
              </div>
              
              <div className="p-5 border-b border-[var(--border)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { label: 'Starter & Cold Start', status: motor.engine_start || "Sangat Baik" },
                    { label: 'Suara & Performa Mesin', status: motor.engine_sound || motor.engine_condition || "Sangat Baik" },
                    { label: 'CVT / Rantai', status: motor.cvt_chain || "Sangat Baik" },
                    { label: 'Kelistrikan & Lampu', status: motor.electrical_lights || "Sangat Baik" },
                    { label: 'Sistem Pengereman', status: motor.brakes || "Sangat Baik" },
                    { label: 'Suspensi & Kaki-kaki', status: motor.suspension || "Sangat Baik" },
                    { label: 'Cat & Bodi', status: motor.body_paint || motor.body_condition || "Sangat Baik" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-[var(--muted)] pb-2">
                      <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                      {item.status === 'Sangat Baik' || item.status === 'Baik' || item.status === 'Aman' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                          <CheckCircle size={14} /> {item.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          <AlertTriangle size={14} /> {item.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {motor.notes && (
                <div className="p-5 bg-yellow-50/50">
                  <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
                    <div className="text-xs font-bold text-yellow-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> 
                      Catatan Minus (Transparansi):
                    </div>
                    <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">
                      {motor.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <InstallmentCalculator price={motor.price} minDp={motor.dp_min} />

            <div className="mt-8">
              <BookingModal motorName={motor.name} motorCode={motor.code} />
            </div>

            <div className="hidden md:flex gap-4 mt-2">
              <a 
                href={`https://wa.me/6282326921142?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#20b858] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
              >
                <Phone size={20} /> Tanya via WhatsApp
              </a>
              <a 
                href="https://maps.app.goo.gl/9HkN9obKBcdQxSEx6" 
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--border)] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] z-40 md:hidden">
        <div className="flex gap-3">
          <a 
            href={`https://wa.me/6282326921142?text=${waMessage}`}
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
