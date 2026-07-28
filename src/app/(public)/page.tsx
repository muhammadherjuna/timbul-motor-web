import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import { Search, MapPin, CheckCircle, ShieldCheck, Phone, ChevronRight } from "lucide-react";
import HomeStockBrowser from "@/components/HomeStockBrowser";

export const dynamic = "force-dynamic";

export default async function Home() {
  const motors = await prisma.motor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[var(--background)]">


      {/* HERO SECTION */}
      <section className="relative w-full bg-[var(--muted)] pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--foreground)] w-fit text-sm font-semibold">
              <ShieldCheck size={16} className="text-[var(--primary)]" />
              Dealer Motor Bekas Terpercaya Kebumen
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--primary)] leading-tight">
              Stok Nyata. <br/> Kondisi Jelas. <br/> <span className="text-[var(--accent)]">Siap Jalan.</span>
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-[480px]">
              Cari Motor Bekas Berkualitas di Kebumen. Pilih motor sesuai kebutuhan dan anggaran. Cek kondisi, lihat detail unit, dan jadwalkan kunjungan langsung melalui WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Link 
                href="/stok" 
                className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg font-bold text-center hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center gap-2"
              >
                Lihat Stok Motor <ChevronRight size={18} />
              </Link>
              <Link 
                href="/tukar-tambah" 
                className="bg-white border-2 border-[var(--border)] text-[var(--foreground)] px-6 py-3 rounded-lg font-bold text-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
              >
                Jual / Tukar Tambah
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-6 text-sm text-[var(--muted-foreground)] font-medium">
              <span className="flex items-center gap-1"><span className="text-yellow-500 text-lg">★</span> 4.7 Rating Google</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={16}/> Showroom Kebumen</span>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-[var(--primary)]/10">
            <img 
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80" 
              alt="Showroom Timbul Motor"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      <HomeStockBrowser motors={motors} />

      {/* WHY CHOOSE US */}
      <section className="bg-[var(--primary)] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black mb-4">Mengapa Memilih Timbul Motor?</h2>
            <p className="text-blue-100">Komitmen kami untuk memberikan unit terbaik dengan proses yang jujur dan transparan.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Kondisi Terbuka", desc: "Minus pada unit dijelaskan secara transparan, tidak ada yang ditutupi." },
              { title: "Dokumen Aman", desc: "BPKB dan STNK diperiksa ketat sebelum unit dipasarkan." },
              { title: "Bisa Test Ride", desc: "Silakan datang, cek fisik, dan coba motornya langsung di showroom." },
              { title: "Bantu Balik Nama", desc: "Kami melayani bantuan proses mutasi dan balik nama kendaraan." },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
                <CheckCircle className="text-[var(--accent)] mb-4" size={32} />
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-[var(--foreground)] text-white py-12 border-t-4 border-[var(--accent)]">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-2xl font-black text-[var(--accent)] mb-4">TIMBUL MOTOR</h3>
            <p className="text-gray-400 mb-6 max-w-sm">
              Dealer motor bekas terpercaya di Kebumen. Stok nyata, kondisi jelas, siap jalan.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Kontak & Lokasi</h4>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin size={20} className="shrink-0 text-[var(--accent)]"/>
                <span>Jl. Raya Jemur, Karangwungu, Karangpoh, Kec. Pejagoan, Kabupaten Kebumen, Jawa Tengah 54361</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={20} className="text-[var(--accent)]"/>
                <span>0812-3456-7890 (WhatsApp)</span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Jam Operasional</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex justify-between"><span>Senin - Sabtu:</span> <span>08.00 - 17.00 WIB</span></p>
              <p className="flex justify-between"><span>Minggu:</span> <span>Libur</span></p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Timbul Motor Kebumen. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
