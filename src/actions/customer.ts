"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: customers };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, error: "Failed to fetch customers" };
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            motor: true,
            sales: true,
          }
        }
      }
    });
    if (!customer) return { success: false, error: "Customer not found" };
    return { success: true, data: customer };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { success: false, error: "Failed to fetch customer" };
  }
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  nik?: string;
  address?: string;
  email?: string;
}) {
  try {
    const customer = await prisma.customer.create({
      data,
    });
    revalidatePath("/admin/customers");
    return { success: true, data: customer };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Failed to create customer" };
  }
}
