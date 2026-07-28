import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand & Intro */}
          <div>
            <h2 className="text-2xl font-black text-white mb-4">TIMBUL MOTOR</h2>
            <p className="text-sm leading-relaxed mb-6">
              Pusat jual beli motor bekas berkualitas di Jawa Tengah. Kami mengutamakan kejujuran kondisi, surat yang terjamin, dan harga yang bersahabat untuk semua pelanggan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/stok" className="hover:text-white transition-colors">Cari Motor Bekas</Link>
              </li>
              <li>
                <Link href="/jual-motor" className="hover:text-white transition-colors">Jual Motor Anda</Link>
              </li>
              <li>
                <Link href="/tukar-tambah" className="hover:text-white transition-colors">Program Tukar Tambah</Link>
              </li>
              <li>
                <Link href="/tentang-kami" className="hover:text-white transition-colors">Tentang Timbul Motor</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[var(--primary)] shrink-0 mt-1" size={20} />
                <span className="text-sm leading-relaxed">
                  Jl. Raya Kebumen - Banyumas Km. 5<br />
                  Jawa Tengah, Indonesia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--primary)] shrink-0" size={20} />
                <a href="https://wa.me/6282326921142" target="_blank" rel="noreferrer" className="text-sm hover:text-white transition-colors">
                  +62 823-2692-1142
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[var(--primary)] shrink-0" size={20} />
                <a href="mailto:info@timbulmotor.com" className="text-sm hover:text-white transition-colors">
                  info@timbulmotor.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Timbul Motor Kebumen. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
