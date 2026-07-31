"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: suppliers };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, error: "Gagal mengambil data supplier" };
  }
}

export async function getSupplierById(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });
    if (!supplier) return { success: false, error: "Supplier tidak ditemukan" };
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return { success: false, error: "Gagal mengambil data supplier" };
  }
}

export async function createSupplier(data: { name: string; contact?: string; address?: string }) {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contact: data.contact || null,
        address: data.address || null,
      },
    });
    revalidatePath("/admin/suppliers");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { success: false, error: "Gagal membuat data supplier" };
  }
}

export async function updateSupplier(id: string, data: { name: string; contact?: string; address?: string }) {
  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        contact: data.contact || null,
        address: data.address || null,
      },
    });
    revalidatePath("/admin/suppliers");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: "Gagal memperbarui data supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: "Gagal menghapus supplier. Pastikan tidak ada data kendaraan yang terkait." };
  }
}
