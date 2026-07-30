"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getBranches() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return branches;
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function createBranch(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;

    if (!name) {
      throw new Error("Nama cabang wajib diisi");
    }

    await prisma.branch.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
      }
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/inventory/add");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating branch:", error);
    return { success: false, error: error.message || "Failed to create branch" };
  }
}

export async function updateBranch(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;

    if (!name) {
      throw new Error("Nama cabang wajib diisi");
    }

    await prisma.branch.update({
      where: { id },
      data: {
        name,
        address: address || null,
        phone: phone || null,
      }
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/inventory/add");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating branch:", error);
    return { success: false, error: error.message || "Failed to update branch" };
  }
}

export async function deleteBranch(id: string) {
  try {
    await prisma.branch.delete({
      where: { id }
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/inventory/add");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting branch:", error);
    return { success: false, error: error.message || "Failed to delete branch" };
  }
}
