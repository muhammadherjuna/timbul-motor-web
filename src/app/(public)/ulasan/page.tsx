export default function UlasanPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-black text-[var(--foreground)] mb-6">Ulasan Pelanggan</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Apa kata mereka yang telah mempercayakan pembelian motornya kepada Timbul Motor?
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="text-yellow-400 mb-2">★★★★★</div>
          <p className="text-[var(--foreground)] italic mb-4">"Pelayanan sangat ramah, motor sesuai dengan yang dideskripsikan di web. Mantap!"</p>
          <div className="font-bold text-sm">- Budi Santoso</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="text-yellow-400 mb-2">★★★★★</div>
          <p className="text-[var(--foreground)] italic mb-4">"Tukar tambah di sini dihargai sangat tinggi. Nggak nyesel ke Timbul Motor."</p>
          <div className="font-bold text-sm">- Andi Wijaya</div>
        </div>
      </div>
    </div>
  );
}
