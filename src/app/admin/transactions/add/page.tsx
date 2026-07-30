"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/actions/transaction";
import { getCustomers } from "@/actions/customer";
import { getAvailableMotors } from "@/actions/motor";
import { Save, ArrowLeft, Loader2, CreditCard, Banknote, Motorbike } from "lucide-react";
import Link from "next/link";

export default function AddTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState<any[]>([]);
  const [motors, setMotors] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedMotor, setSelectedMotor] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setFetching(true);
      const [customersRes, motorsRes] = await Promise.all([
        getCustomers(),
        getAvailableMotors()
      ]);
      if (customersRes.success) setCustomers(customersRes.data);
      if (motorsRes.success) setMotors(motorsRes.data);
      setFetching(false);
    }
    loadData();
  }, []);

  const handleMotorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const motorId = e.target.value;
    const motor = motors.find(m => m.id === motorId);
    setSelectedMotor(motor || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      customerId: formData.get("customerId") as string,
      motorId: formData.get("motorId") as string,
      paymentMethod: paymentMethod,
      totalAmount: parseInt(formData.get("totalAmount") as string) || 0,
      dpAmount: formData.get("dpAmount") ? parseInt(formData.get("dpAmount") as string) : undefined,
      leasingProvider: formData.get("leasingProvider") as string,
      tenor: formData.get("tenor") ? parseInt(formData.get("tenor") as string) : undefined,
      monthlyInstall: formData.get("monthlyInstall") ? parseInt(formData.get("monthlyInstall") as string) : undefined,
      notes: formData.get("notes") as string,
    };

    if (!data.customerId || !data.motorId || !data.totalAmount) {
      setError("Silakan lengkapi data yang wajib (Pelanggan, Motor, Total Harga).");
      setLoading(false);
      return;
    }

    const res = await createTransaction(data);
    if (res.success) {
      router.push("/admin/transactions");
    } else {
      setError(res.error || "Terjadi kesalahan saat memproses transaksi.");
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/transactions" className="p-2 bg-white rounded-lg border border-[var(--border)] hover:bg-gray-50 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Transaksi Penjualan Baru</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Buat invoice penjualan motor (Kasir).</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
            <h2 className="font-bold text-lg text-[var(--foreground)]">Informasi Utama</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Pelanggan Pembeli <span className="text-red-500">*</span></label>
              <select name="customerId" required className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm">
                <option value="">-- Pilih Pelanggan --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Jika belum ada, silakan <Link href="/admin/customers/add" className="text-blue-500 hover:underline">tambah pelanggan baru</Link> terlebih dahulu.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Unit Motor Terjual <span className="text-red-500">*</span></label>
              <select name="motorId" required onChange={handleMotorChange} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm">
                <option value="">-- Pilih Motor Tersedia --</option>
                {motors.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.brand} {m.name} {m.year} ({m.code})</option>
                ))}
              </select>
            </div>
            
            {selectedMotor && selectedMotor.pricing && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                <p><strong>Info Harga dari Inventori:</strong></p>
                <p>Harga Tunai: Rp {selectedMotor.pricing.price.toLocaleString('id-ID')}</p>
                {selectedMotor.pricing.credit_price && (
                  <p>Harga Kredit: Rp {selectedMotor.pricing.credit_price.toLocaleString('id-ID')}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/30">
            <h2 className="font-bold text-lg text-[var(--foreground)]">Pembayaran</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CASH' ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' : 'border-gray-200 text-gray-500 hover:border-[var(--primary)]/30'}`}
              >
                <Banknote size={24} className="mb-2" />
                <span className="font-bold">Tunai (Cash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT")}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CREDIT' ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' : 'border-gray-200 text-gray-500 hover:border-[var(--primary)]/30'}`}
              >
                <CreditCard size={24} className="mb-2" />
                <span className="font-bold">Kredit (Leasing)</span>
              </button>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-sm font-medium">Total Harga Kesepakatan Akhir (Rp) <span className="text-red-500">*</span></label>
              <input name="totalAmount" type="number" required defaultValue={selectedMotor?.pricing?.price || ""} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-lg font-bold" />
            </div>

            {paymentMethod === "CREDIT" && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-[var(--border)] mt-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Leasing Provider</label>
                  <input name="leasingProvider" type="text" placeholder="Misal: FIF, Adira, BAF" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Uang Muka (DP) Rp</label>
                  <input name="dpAmount" type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tenor (Bulan)</label>
                  <input name="tenor" type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Angsuran per Bulan (Rp)</label>
                  <input name="monthlyInstall" type="number" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" />
                </div>
              </div>
            )}
            
            <div className="space-y-1 pt-2">
              <label className="text-sm font-medium">Catatan Tambahan</label>
              <textarea name="notes" rows={2} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm" placeholder="Kondisi pengiriman, garansi toko..."></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/transactions" className="px-6 py-2.5 rounded-lg text-sm font-bold border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Proses Transaksi
          </button>
        </div>
      </form>
    </div>
  );
}
