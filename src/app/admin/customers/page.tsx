import { getCustomers } from "@/actions/customer";
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function CustomersPage() {
  const { data: customers = [] } = await getCustomers();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Pelanggan</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola data pelanggan dan riwayat transaksi.</p>
        </div>
        <Link 
          href="/admin/customers/add" 
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus size={18} />
          Tambah Pelanggan
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--muted)]/30">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[var(--primary)]" />
            <h2 className="font-bold text-lg">Daftar Pelanggan</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau no. HP..." 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium">No. HP</th>
                <th className="px-6 py-3 font-medium">NIK</th>
                <th className="px-6 py-3 font-medium">Terdaftar</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers && customers.length > 0 ? (
                customers.map((customer: any) => (
                  <tr key={customer.id} className="border-b border-[var(--border)] hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">{customer.name}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{customer.nik || '-'}</td>
                    <td className="px-6 py-4">{new Date(customer.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/customers/${customer.id}`} className="text-[var(--primary)] font-medium hover:underline">Detail</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data pelanggan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
