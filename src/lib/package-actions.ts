"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function togglePackageItem(packageItemId: string, isActive: boolean) {
  // Ambil item dan kategorinya
  const item = await prisma.inspectionPackageItem.findUnique({
    where: { id: packageItemId },
    include: { category: { include: { items: true } } }
  });

  if (!item) {
    throw new Error("Item not found");
  }

  // Jika mencoba menonaktifkan, pastikan ini bukan item aktif terakhir di kategorinya
  if (!isActive) {
    const activeItems = item.category.items.filter((i: any) => i.isActive);
    if (activeItems.length <= 1 && item.isActive) {
      throw new Error("Kategori harus memiliki setidaknya satu item yang aktif.");
    }
  }

  await prisma.inspectionPackageItem.update({
    where: { id: packageItemId },
    data: { isActive }
  });

  revalidatePath(`/admin/settings/inspections/${item.category.packageId}`);
  return { success: true };
}
