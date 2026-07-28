"use client";

import { useState } from "react";
import { CalendarDays, X, Calendar, Clock, User, Phone } from "lucide-react";

interface BookingModalProps {
  motorName: string;
  motorCode: string;
}

export default function BookingModal({ motorName, motorCode }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Halo Timbul Motor, saya ${formData.name} ingin *Booking Test Ride* untuk:\n\nMotor: *${motorName}*\nKode: *${motorCode}*\n\n*Rencana Kedatangan:*\nTanggal: ${formData.date}\nJam: ${formData.time}\n\nMohon konfirmasinya ya. Terima kasih.`;
    
    const waUrl = `https://wa.me/6282326921142?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-[var(--primary)] text-white py-3.5 rounded-xl font-bold hover:bg-[var(--primary)]/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 mb-3"
      >
        <CalendarDays size={20} /> Booking Test Ride
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--muted)]/50">
              <h2 className="font-bold text-lg text-[var(--foreground)] flex items-center gap-2">
                <CalendarDays size={20} className="text-[var(--primary)]" />
                Jadwalkan Test Ride
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-2 border border-blue-100">
                Unit: <strong>{motorName}</strong> ({motorCode})
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama Anda" 
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm transition-shadow" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="Contoh: 08123456789" 
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm transition-shadow" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Tanggal Kedatangan</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm transition-shadow" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Jam Perkiraan</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="time" 
                      required
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-sm transition-shadow" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--primary)]/90 transition-colors mt-2"
              >
                Konfirmasi Jadwal via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
