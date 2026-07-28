import Image from "next/image";
import { ShieldCheck, Target, Users, MapPin, CheckCircle, Award } from "lucide-react";

export default function TentangKamiPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 bg-[var(--foreground)] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)] to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-[var(--accent)] font-bold tracking-widest uppercase mb-4 block">Tentang Kami</span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Menjadi Standar Emas Motor Bekas di Kebumen
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Timbul Motor hadir untuk memberikan ketenangan pikiran dalam membeli motor bekas. Kejujuran kondisi dan legalitas adalah nyawa dari bisnis kami.
            </p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative -mt-16 z-20 mb-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-[var(--border)]">
              <div>
                <div className="text-4xl font-black text-[var(--primary)] mb-2">10+</div>
                <div className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Tahun Pengalaman</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[var(--primary)] mb-2">1000+</div>
                <div className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Motor Terjual</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[var(--primary)] mb-2">100%</div>
                <div className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Surat Terjamin</div>
              </div>
              <div>
                <div className="text-4xl font-black text-[var(--primary)] mb-2">24/7</div>
                <div className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Layanan Bantuan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm mb-2">
                <Target size={16} /> Visi & Misi Kami
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[var(--foreground)] leading-tight">
                Membangun Kepercayaan Lewat Transparansi
              </h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">
                Berawal dari garasi kecil di tahun 2012, Timbul Motor melihat banyak masyarakat yang ragu dan khawatir tertipu saat membeli motor bekas. 
              </p>
              <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">
                Kami hadir untuk mematahkan stigma tersebut. Setiap motor yang masuk ke showroom kami harus melewati tahapan inspeksi ketat, pengecekan nomor rangka & mesin di Samsat, hingga perbaikan kelayakan jalan. Jika motor tidak aman, kami tidak akan menjualnya kepada Anda.
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  "Proses kurasi dan inspeksi mekanik 360 derajat.",
                  "Garansi keaslian BPKB dan STNK 100% uang kembali.",
                  "Bebas biaya tersembunyi, harga yang Anda lihat adalah harga final."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-[var(--primary)] shrink-0 mt-1" size={20} />
                    <span className="text-[var(--foreground)] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1558981033-0f0309284409?q=80&w=800&auto=format&fit=crop" 
                  alt="Showroom Timbul Motor" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-[var(--border)] max-w-xs hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--foreground)]">Dealer Terpercaya</h4>
                    <p className="text-xs text-[var(--muted-foreground)]">Pilihan Utama Warga Kebumen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-20 bg-[var(--primary)] text-white mt-12">
        <div className="container mx-auto px-4 text-center">
          <MapPin size={48} className="mx-auto text-[var(--accent)] mb-6" />
          <h2 className="text-3xl font-black mb-4">Kunjungi Showroom Kami</h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
            Pintu kami selalu terbuka. Silakan mampir untuk melihat langsung stok motor, konsultasi, atau test ride gratis. Kami siap menyambut Anda.
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4 justify-center w-full">
            <a 
              href="https://maps.google.com/?q=Timbul+Motor+Kebumen" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-[var(--primary)] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Buka di Google Maps
            </a>
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[var(--accent)] text-[var(--foreground)] px-8 py-4 rounded-xl font-bold hover:bg-[var(--accent)]/90 transition-colors shadow-lg"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
