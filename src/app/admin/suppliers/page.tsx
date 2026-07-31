import { getSuppliers, deleteSupplier } from "@/actions/supplier";
import { Plus, Edit, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function SuppliersPage() {
  const { success, data, error } = await getSuppliers();
  const suppliers = data || [];

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteSupplier(id);
    revalidatePath("/admin/suppliers");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Manajemen Supplier</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola data penyuplai atau makelar penyedia motor bekas.</p>
        </div>
        <Link href="/admin/suppliers/add" className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors">
          <Plus size={18} /> Tambah Supplier
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--muted)]/50 text-[var(--muted-foreground)] uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Nama Supplier</th>
                <th className="px-6 py-4">Kontak (No HP)</th>
                <th className="px-6 py-4">Alamat Lengkap</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                    Belum ada data supplier.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier: any) => (
                  <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--foreground)]">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Truck size={16} />
                        </div>
                        {supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">
                      {supplier.contact || "-"}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)] max-w-xs truncate" title={supplier.address}>
                      {supplier.address || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/suppliers/${supplier.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Supplier">
                          <Edit size={16} />
                        </Link>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={supplier.id} />
                          <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Supplier">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  
