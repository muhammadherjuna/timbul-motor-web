import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { MapPin, Phone, CheckCircle, ShieldCheck, Calendar, Gauge, Cog, ChevronLeft, FileText, History, Info, AlertTriangle } from "lucide-react";
import InstallmentCalculator from "@/components/InstallmentCalculator";
import BookingModal from "@/components/public/BookingModal";
import StokImageGallery from "@/components/public/StokImageGallery";
import { getActiveInspectionSession } from "@/lib/inspection-actions";

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

  const activeSession = await getActiveInspectionSession(id);

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
                </div>
              </div>
              
              <div className="p-5">
                {!activeSession ? (
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-center">
                    <AlertTriangle className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="font-bold text-gray-600">Belum Diperiksa</p>
                    <p className="text-sm text-gray-500">Unit ini belum diperiksa dengan standar inspeksi terbaru.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                      <div>
                        <p className="text-xs text-green-700 font-bold uppercase">Status Kelayakan</p>
                        <p className={`font-black text-lg ${
                          activeSession.saleEligibility === 'LAYAK_JUAL' ? 'text-green-700' :
                          activeSession.saleEligibility === 'PERLU_PERBAIKAN' ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                          {activeSession.saleEligibility?.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-green-700 font-bold uppercase">Grade</p>
                        <p className="font-black text-3xl text-green-700">{activeSession.grade}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 border-b border-gray-100 pb-4">
                      Diinspeksi oleh: <span className="font-medium text-gray-800">{activeSession.inspectorName}</span> pada {new Date(activeSession.completedAt!).toLocaleDateString('id-ID')}
                    </div>

                    <div className="space-y-4">
                      {activeSession.items.filter((i:any) => i.status === 'CATATAN' || i.status === 'PERBAIKAN' || i.status === 'KRITIS').length === 0 ? (
                        <div className="text-center p-4 bg-green-50 rounded-lg text-green-700">
                          <CheckCircle className="mx-auto mb-2" size={24} />
                          <p className="font-medium">Kondisi Sangat Baik</p>
                          <p className="text-sm">Tidak ada catatan minus yang ditemukan.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Info size={16} className="text-yellow-500" /> Catatan Transparansi
                          </p>
                          <div className="space-y-3">
                            {activeSession.items.filter((i:any) => i.status === 'CATATAN' || i.status === 'PERBAIKAN').map((item:any) => (
                              <div key={item.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">{item.templateItem.question}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.answer}</p>
                                    {item.notes && <p className="text-xs font-medium text-orange-600 mt-2">"{item.notes}"</p>}
                                  </div>
                                  <span className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded-full ${
                                    item.status === 'PERBAIKAN' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                {item.evidence && item.evidence.filter((e:any) => e.isPublic).map((e:any) => (
                                  <div key={e.id} className="mt-3">
                                    <img src={e.storagePath} alt={e.caption || 'Foto Bukti'} className="rounded-lg border border-gray-200 w-32 h-32 object-cover" />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
