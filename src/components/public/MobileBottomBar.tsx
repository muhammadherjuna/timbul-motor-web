"use client";

import Link from "next/link";
import { Phone, MessageCircle, PackageSearch, MapPin } from "lucide-react";

export default function MobileBottomBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        <a 
          href="tel:082326921142" 
          className="flex flex-col items-center justify-center w-full h-full text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
        >
          <Phone size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Telepon</span>
        </a>
        
        <a 
          href="https://wa.me/6282326921142" 
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center w-full h-full text-[#25D366] hover:text-[#20b858] transition-colors relative"
        >
          <div className="absolute -top-3 bg-[#25D366] text-white p-2 rounded-full shadow-lg border-4 border-white">
            <MessageCircle size={22} className="fill-current" />
          </div>
          <span className="text-[10px] font-medium mt-6">WhatsApp</span>
        </a>

        <Link 
          href="/stok" 
          className="flex flex-col items-center justify-center w-full h-full text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
        >
          <PackageSearch size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Lihat Stok</span>
        </Link>
        
        <a 
          href="https://maps.google.com" 
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center w-full h-full text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
        >
          <MapPin size={20} className="mb-1" />
          <span className="text-[10px] font-medium">Rute</span>
        </a>
      </div>
    </div>
  );
}
