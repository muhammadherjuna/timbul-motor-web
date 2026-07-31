import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import { Search, MapPin, CheckCircle, ShieldCheck, Phone, ChevronRight } from "lucide-react";
import HomeStockBrowser from "@/components/HomeStockBrowser";
import RandomReviews from "@/components/public/RandomReviews";

export const dynamic = "force-dynamic";

export default async function Home() {
  const motorsData: any = await prisma.motor.findMany({
    where: { status: "Tersedia" },
    orderBy: { createdAt: "desc" },
    include: { pricing: true, document: true, history: true, inspection: true }
  } as any);

  const motors: any[] = motorsData.map((m: any) => ({
    ...m, ...(m.pricing||{}), ...(m.document||{}), ...(m.history||{}), ...(m.inspection||{}), id: m.id
  }));

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
      {/* TESTIMONIALS */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-[var(--foreground)] mb-4">Apa Kata Pelanggan Kami</h2>
            <p className="text-[var(--muted-foreground)]">Lebih dari 1000+ pelanggan telah mempercayakan pembelian motor mereka kepada Timbul Motor.</p>
          </div>
          
          <RandomReviews />
        </div>
      </section>
    </main>
  );
}
