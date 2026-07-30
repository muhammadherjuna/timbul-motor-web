import { getTransactions } from "@/actions/transaction";
import { Receipt, Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function TransactionsPage() {
  const { data: transactions = [] } = await getTransactions();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Transaksi</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola data penjualan dan invoice.</p>
        </div>
        <Link 
          href="/admin/transactions/add" 
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus size={18} />
          Transaksi Baru
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--muted)]/30">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-[var(--primary)]" />
            <h2 className="font-bold text-lg">Daftar Transaksi</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari invoice atau nama..." 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Pelanggan</th>
                <th className="px-6 py-3 font-medium">Motor</th>
                <th className="px-6 py-3 font-medium">Tipe</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-[var(--primary)]">{tx.invoiceNumber}</td>
                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-medium">{tx.customer?.name}</td>
                    <td className="px-6 py-4">{tx.motor?.name} ({tx.motor?.code})</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${tx.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : tx.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      Rp {tx.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data transaksi.
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
