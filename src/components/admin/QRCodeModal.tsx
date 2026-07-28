"use client";

import { X, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  motor: {
    id: string;
    name: string;
    price: number;
    image: string;
    code: string;
  } | null;
}

export default function QRCodeModal({ isOpen, onClose, motor }: QRCodeModalProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (motor) {
      // Create the URL that points to the public detail page
      setUrl(`${window.location.origin}/stok/${motor.id}`);
    }
  }, [motor]);

  if (!isOpen || !motor) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:w-auto print:max-w-none">
        
        {/* Header - Hidden during print */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--muted)]/50 print:hidden">
          <h2 className="font-bold text-lg text-[var(--foreground)]">Label QR Code Showroom</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 print:p-0 flex flex-col items-center">
          <div className="border-4 border-[var(--primary)] rounded-3xl overflow-hidden w-[300px] bg-white shadow-2xl print:shadow-none print:border-8">
            
            {/* ID Card Header */}
            <div className="bg-[var(--primary)] text-white text-center py-4 px-6 border-b-4 border-[var(--accent)]">
              <h1 className="font-black text-2xl uppercase tracking-wider">Timbul Motor</h1>
              <p className="text-xs opacity-90 mt-1">Scan untuk Detail & Cicilan</p>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center bg-gray-50">
              <p className="text-xs font-bold text-[var(--muted-foreground)] mb-1 uppercase tracking-widest">{motor.code}</p>
              <h2 className="text-xl font-bold text-center text-[var(--foreground)] leading-tight mb-2">{motor.name}</h2>
              <div className="text-2xl font-black text-[var(--primary)] mb-6">
                Rp {motor.price.toLocaleString('id-ID')}
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-2">
                <QRCodeSVG 
                  value={url} 
                  size={160} 
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center w-full truncate">
                {url}
              </p>
            </div>

            {/* Footer */}
            <div className="bg-[var(--primary)]/10 text-center py-3 border-t border-gray-200">
              <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Showroom Timbul Motor Kebumen</p>
            </div>

          </div>
        </div>

        {/* Action - Hidden during print */}
        <div className="p-5 border-t border-[var(--border)] bg-gray-50 flex justify-end print:hidden">
          <button 
            onClick={handlePrint}
            className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors flex items-center gap-2"
          >
            <Printer size={18} />
            Cetak Label (A4)
          </button>
        </div>
      </div>
    </div>
  );
}
