import { Phone, MapPin, Mail } from "lucide-react";

export default function KontakPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-black text-[var(--foreground)] mb-6 text-center">Hubungi Kami</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Phone size={24} />
          </div>
          <h3 className="font-bold mb-2">WhatsApp / Telepon</h3>
          <p className="text-[var(--muted-foreground)] text-sm">+62 812-3456-7890</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <MapPin size={24} />
          </div>
          <h3 className="font-bold mb-2">Alamat Showroom</h3>
          <p className="text-[var(--muted-foreground)] text-sm">Jl. Raya Kebumen - Banyumas Km. 5, Jawa Tengah</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <Mail size={24} />
          </div>
          <h3 className="font-bold mb-2">Email</h3>
          <p className="text-[var(--muted-foreground)] text-sm">info@timbulmotor.com</p>
        </div>
      </div>
    </div>
  );
}
