"use client";

import { ArrowLeft, Copy, Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FinanceClient({ motor }: { motor: any }) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "facebook" | "instagram">("whatsapp");
  const [copied, setCopied] = useState(false);

  const priceFormatted = `Rp ${motor.price.toLocaleString('id-ID')}`;
  const dpFormatted = `Rp ${motor.dp_min.toLocaleString('id-ID')}`;
  
  const generateTemplate = (type: string) => {
    const title = type === "whatsapp" 
      ? `📢 *MENDARAT LAGI BOSKU!* 📢\n\n*${motor.name} (${motor.year})*`
      : `🔥 MENDARAT LAGI BOSKU! 🔥\n\nDijual Cepat: ${motor.name} (${motor.year})`;

    const specs = type === "whatsapp"
      ? `✅ Odo: ${motor.km.toLocaleString('id-ID')} KM\n✅ Pajak: ${motor.tax_status} ${motor.tax_expiry ? `(${motor.tax_expiry})` : ""}\n✅ Dokumen: ${motor.bpkb_ready ? 'BPKB' : ''} ${motor.stnk_ready ? '& STNK' : ''} READY\n✅ Warna: ${motor.color || "-"}\n✅ Mesin: ${motor.cc} cc ${motor.transmission}`
      : `👉 Odo: ${motor.km.toLocaleString('id-ID')} KM\n👉 Pajak: ${motor.tax_status} ${motor.tax_expiry ? `(${motor.tax_expiry})` : ""}\n👉 Surat: ${motor.bpkb_ready ? 'BPKB' : ''} ${motor.stnk_ready ? '& STNK' : ''} AMAN JAYA\n👉 Warna: ${motor.color || "-"}`;
    
    const condition = motor.description ? `\n\n*Kondisi & Bonus:*\n${motor.description}` : "";
    const inspection = motor.notes ? `\n\n*Minus/PR:*\n${motor.notes}` : "";

    const priceSection = type === "whatsapp"
      ? `\n\n💰 *Harga Cash: ${priceFormatted}*\n💳 *Bisa Kredit, DP mulai ${dpFormatted}*`
      : `\n\n💰 Harga Cash: ${priceFormatted}\n💳 Kredit dibantu sampai ACC (DP min ${dpFormatted})`;

    const contactInfo = type === "instagram"
      ? `\n\n📍 Lokasi: Timbul Motor Kebumen\n📲 Minat? Langsung klik link di Bio atau DM!\n\n#motorbekas #motorbekaskebumen #timbulmotor #${motor.brand.toLowerCase()} #${motor.name.split(" ")[0].toLowerCase()}`
      : `\n\n📍 Lokasi: Showroom Timbul Motor (Jl. Raya Kebumen - Banyumas Km. 5)\n📲 Minat serius? WA: 082326921142`;

    return `${title}\n\n${specs}${condition}${inspection}${priceSection}${contactInfo}`;
  };

  const textToCopy = generateTemplate(activeTab);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/inventory" 
          className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--muted-foreground)]"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Generator Promosi Sosmed</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Buat caption promosi otomatis untuk {motor.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Pilihan Platform */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm text-[var(--muted-foreground)] uppercase mb-4">Pilih Platform</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("whatsapp")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${activeTab === "whatsapp" ? "border-green-500 bg-green-50 text-green-700" : "border-[var(--border)] hover:border-green-200 text-[var(--foreground)]"}`}
              >
                <MessageCircle size={20} className={activeTab === "whatsapp" ? "text-green-600" : "text-gray-400"} />
                <span className="font-semibold">WhatsApp Story / Chat</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("facebook")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${activeTab === "facebook" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-[var(--border)] hover:border-blue-200 text-[var(--foreground)]"}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${activeTab === "facebook" ? "bg-blue-600 text-white" : "bg-gray-400 text-white"}`}>F</div>
                <span className="font-semibold">Facebook Grup / Beranda</span>
              </button>

              <button 
                onClick={() => setActiveTab("instagram")}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${activeTab === "instagram" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-[var(--border)] hover:border-pink-200 text-[var(--foreground)]"}`}
              >
                <div className={`w-5 h-5 rounded-xl flex items-center justify-center font-bold text-xs border-2 ${activeTab === "instagram" ? "border-pink-600 text-pink-600" : "border-gray-400 text-gray-400"}`}>IG</div>
                <span className="font-semibold">Instagram Feed</span>
              </button>
            </div>
          </div>

          <div className="bg-[var(--muted)] p-4 rounded-xl border border-[var(--border)] shadow-sm">
            <img src={motor.image} alt={motor.name} className="w-full h-auto aspect-video object-cover rounded-lg mb-3 shadow-sm" />
            <p className="text-xs text-[var(--muted-foreground)] text-center">Unduh gambar ini jika diperlukan untuk posting.</p>
          </div>
        </div>

        {/* Kolom Kanan: Teks Hasil */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col h-full min-h-[500px]">
          <h2 className="font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
            Hasil Teks Promosi (Siap Copy-Paste)
          </h2>
          
          <div className="flex-1 bg-gray-50 p-5 rounded-lg border border-[var(--border)] whitespace-pre-wrap font-sans text-sm text-gray-800 shadow-inner mb-6 overflow-y-auto">
            {textToCopy}
          </div>

          <button 
            onClick={handleCopy}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              copied 
                ? "bg-green-600 text-white" 
                : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20"
            }`}
          >
            {copied ? (
              <><Check size={20} /> Teks Berhasil Disalin!</>
            ) : (
              <><Copy size={20} /> Salin Teks Promosi</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
