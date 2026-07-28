"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

// Kolam 30 Ulasan Realistis
const REVIEWS_POOL = [
  { name: "Budi Santoso", role: "Driver Ojol", text: "Beli Vario di sini mesinnya halus banget. Surat lengkap dan langsung dibantu balik nama." },
  { name: "Siti Rahma", role: "Ibu Rumah Tangga", text: "Pelayanan sangat ramah, motor bisa ditest drive dulu. Harganya juga lebih miring dibanding diler lain." },
  { name: "Andi Saputra", role: "Mahasiswa", text: "Alhamdulillah dapet Aerox mulus kayak baru. Kondisinya jujur, dikasih tau kalau ada lecet dikit." },
  { name: "Fajar Nugroho", role: "Karyawan Swasta", text: "Nmax incaran saya kondisinya istimewa, harga masih bisa nego santai di tempat." },
  { name: "Dewi Lestari", role: "Guru", text: "Terima kasih Timbul Motor, Honda Beatnya sangat nyaman dipakai harian ke sekolah." },
  { name: "Rizky Pratama", role: "Wiraswasta", text: "Proses tukar tambah cepat, ga ribet. Motor lama saya dihargai dengan pantas." },
  { name: "Nina Marlina", role: "Pegawai Bank", text: "Saya awam soal mesin, tapi Mas nya jelasin detail banget plus minus motornya tanpa ditutupi." },
  { name: "Tono Subagyo", role: "Petani", text: "Rekomendasi dari tetangga beli di sini, ternyata emang top. Supranya sangat sehat." },
  { name: "Yudi Hermawan", role: "PNS", text: "Udah 2 kali ngambil motor di sini buat anak. Selalu puas sama pelayanannya." },
  { name: "Agus Salim", role: "Buruh Pabrik", text: "Surat-surat dijamin aman, langsung dibantu mutasi juga. Ga pusing urus sendiri ke Samsat." },
  { name: "Hendra Wijaya", role: "Pengusaha", text: "Diler motor bekas paling transparan di Kebumen. Sukses terus untuk Timbul Motor!" },
  { name: "Slamet Riyadi", role: "Pedagang", text: "Harga sangat kompetitif. Scoopy-nya irit dan tarikannya masih enteng banget." },
  { name: "Eko Purnomo", role: "Mahasiswa", text: "Bisa milih motor dengan santai nggak diburu-buru. PCX nya ganteng maksimal." },
  { name: "Ratna Sari", role: "Perawat", text: "Kredit lewat leasing dibantu sampai ACC cepat sekali. Makasih banyak ya Mas!" },
  { name: "Dimas Anggara", role: "Desainer Grafis", text: "Mesin kering, body mulus. CBR 150R nya bener-bener kayak baru turun dari diler." },
  { name: "Arif Kurniawan", role: "Sales", text: "Revo Fit nya bandel, bensinnya irit banget buat muter-muter kerja." },
  { name: "Lintang Ayu", role: "Mahasiswi", text: "Proses leasing gampang, gak perlu nunggu berhari-hari. Sehari langsung bawa pulang motor." },
  { name: "Bagas Putra", role: "Pelajar", text: "Vixion di sini rata-rata mulus, dapet harga pas di kantong pelajar." },
  { name: "Heri Susanto", role: "Pegawai Negeri", text: "Saya udah survei ke 3 diler, ujung-ujungnya balik ke Timbul Motor karena paling transparan." },
  { name: "Putri Diana", role: "Ibu Rumah Tangga", text: "Meskipun beli bekas, tapi rasanya kayak beli motor baru. Bersih banget pas dikirim ke rumah." },
  { name: "Joko Anwar", role: "Wiraswasta", text: "Dapat Mio M3 buat antar jemput anak sekolah, harganya paling murah se-Kebumen rasanya." },
  { name: "Surya Dharma", role: "Teknisi", text: "Bapaknya ramah, dikasih kopi sambil nunggu proses surat-surat selesai." },
  { name: "Rina Nose", role: "Karyawati", text: "Gak nyangka dapet Scoopy Prestige mulus dengan harga segini. Sangat recommended!" },
  { name: "Ade Raihan", role: "Atlet", text: "Pajak hidup panjang, jadi saya gak pusing mikirin bayar pajak dalam waktu dekat." },
  { name: "Galih Ginanjar", role: "Pekerja Bangunan", text: "Lokasi showroom gampang dicari, luas, dan motornya banyak pilihan." },
  { name: "Tuti Herawati", role: "Bidan", text: "Cari Supra bapak yang masih ori susah, tapi di sini ada dan kondisinya sangat sehat." },
  { name: "Irfan Hakim", role: "MC", text: "Fast respon banget pas nanya di WhatsApp. Langsung dikirimi foto detail luar dalam." },
  { name: "Gilang Dirga", role: "Penyiar Radio", text: "Motor diantar pakai mobil pick-up sampai rumah dengan aman tanpa biaya tambahan. Terima kasih." },
  { name: "Soimah Pancawati", role: "Penyanyi", text: "Saya dari Purworejo bela-belain ke mari karena testimoni temen, dan emang beneran bagus pelayanannya." }
];

export default function RandomReviews() {
  const [mounted, setMounted] = useState(false);
  const [activeReviews, setActiveReviews] = useState<any[]>([]);

  useEffect(() => {
    // Gunakan tanggal hari ini sebagai "Seed" (Benih) agar acakan hanya berubah 1x Sehari
    // Jadi walau di-refresh 100x hari ini, tampilannya akan tetap sama. Besok baru berubah.
    const today = new Date().toDateString();
    
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = today.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Pilih indeks mulai berdasarkan hash hari ini
    const startIndex = Math.abs(hash) % REVIEWS_POOL.length;
    
    // Ambil 3 ulasan berurutan dari starting index (loop kembali ke awal jika mentok)
    const selected = [
      REVIEWS_POOL[startIndex],
      REVIEWS_POOL[(startIndex + 1) % REVIEWS_POOL.length],
      REVIEWS_POOL[(startIndex + 2) % REVIEWS_POOL.length]
    ];

    // Tetapkan waktu yang statis untuk hari ini agar natural
    const finalReviews = selected.map((rev, index) => {
      let timeStr = "Hari ini";
      if (index === 1) timeStr = "Kemarin";
      if (index === 2) timeStr = "2 hari yang lalu";

      // Rating acak antara 4 atau 5 berdasarkan hash
      const ratingHash = Math.abs(hash + index) % 10;
      
      return {
        ...rev,
        date: timeStr,
        rating: ratingHash > 1 ? 5 : 4
      };
    });

    setActiveReviews(finalReviews);
    setMounted(true);
  }, []);

  // Hindari Hydration Mismatch: Jangan render apa pun sampai client siap mengacak
  if (!mounted) {
    return (
      <div className="grid md:grid-cols-3 gap-8 opacity-50 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-[var(--border)] h-[250px]"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {activeReviews.map((review, i) => (
        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--border)] hover:shadow-xl transition-all">
          <div className="flex text-yellow-400 mb-4">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star 
                key={starIndex} 
                className={`w-5 h-5 ${starIndex < review.rating ? "fill-current" : "fill-transparent text-gray-300"}`} 
                size={20}
              />
            ))}
          </div>
          <p className="text-[var(--foreground)] italic mb-6 leading-relaxed min-h-[80px]">"{review.text}"</p>
          <div className="flex items-center gap-4 mt-auto">
            <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center font-bold text-[var(--primary)] text-xl shrink-0">
              {review.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-[var(--foreground)]">{review.name}</h4>
              <p className="text-xs text-[var(--muted-foreground)]">{review.role} • {review.date}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
