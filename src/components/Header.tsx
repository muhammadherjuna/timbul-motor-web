"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Stok Motor", href: "/stok" },
    { name: "Jual Motor", href: "/jual-motor" },
    { name: "Tukar Tambah", href: "/tukar-tambah" },
    { name: "Tentang Kami", href: "/tentang-kami" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60 pt-[max(env(safe-area-inset-top),2rem)] md:pt-0">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu} className="text-2xl font-black text-[var(--primary)] uppercase tracking-tighter">
            Timbul Motor
          </Link>
        </div>
        
        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex gap-4 xl:gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`transition-colors whitespace-nowrap ${pathname === link.href ? 'text-[var(--primary)] font-bold' : 'hover:text-[var(--primary)]'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* WHATSAPP BUTTON (DESKTOP) & HAMBURGER (MOBILE) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <a 
            href="https://wa.me/6281234567890" 
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex bg-[var(--primary)] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[var(--primary)]/90 transition-colors items-center gap-2"
          >
            <Phone size={16} />
            <span>Chat WhatsApp</span>
          </a>
          
          <button 
            className="md:hidden text-[var(--foreground)] p-2 -mr-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[var(--background)] border-b border-[var(--border)] shadow-xl menu-open-anim overflow-hidden">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`p-4 rounded-xl font-bold text-lg transition-colors ${pathname === link.href ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-[var(--border)]">
              <a 
                href="https://wa.me/6281234567890" 
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="w-full bg-[#25D366] text-white px-4 py-4 rounded-xl font-bold text-lg hover:bg-[#20b858] transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Hubungi via WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
