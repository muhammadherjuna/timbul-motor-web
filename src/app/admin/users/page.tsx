import { getUsers, deleteUser } from "@/actions/user";
import { Plus, Edit, Trash2, Shield, Wrench, UserCog } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function UsersPage() {
  const { success, data, error } = await getUsers();
  const users = data || [];

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteUser(id);
    revalidatePath("/admin/users");
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <UserCog size={16} className="text-blue-500" />;
      case "MECHANIC": return <Wrench size={16} className="text-orange-500" />;
      case "SUPERVISOR": return <Shield size={16} className="text-purple-500" />;
      default: return <UserCog size={16} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Admin</span>;
      case "MECHANIC": return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">Mekanik</span>;
      case "SUPERVISOR": return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">Supervisor</span>;
      default: return <span>{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Manajemen Pengguna</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Kelola akun staf, mekanik, dan supervisor Timbul Motor.</p>
        </div>
        <Link href="/admin/users/add" className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors">
          <Plus size={18} /> Tambah Akun
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
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Email / Username</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4">Dibuat Pada</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)]">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Akun">
                          <Edit size={16} />
                        </Link>
                        <form action={handleDelete}>
                          <input type="hidden" name="id" value={user.id} />
                          <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Akun">
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
  
