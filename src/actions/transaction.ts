"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        motor: true,
        sales: true,
      }
    });
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
}

export async function createTransaction(data: {
  customerId: string;
  motorId: string;
  salesId?: string;
  paymentMethod: string;
  totalAmount: number;
  dpAmount?: number;
  leasingProvider?: string;
  tenor?: number;
  monthlyInstall?: number;
  notes?: string;
}) {
  try {
    // 1. Generate Invoice Number (Simple format: INV-YYYYMMDD-Random)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomNum}`;

    // Status: CASH is COMPLETED, CREDIT is PENDING (waiting for leasing approval)
    const status = data.paymentMethod === "CASH" ? "COMPLETED" : "PENDING";
    const motorStatus = "Terjual"; // Mark motor as sold

    // Use a transaction to ensure both records are updated together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          customerId: data.customerId,
          motorId: data.motorId,
          salesId: data.salesId,
          paymentMethod: data.paymentMethod,
          totalAmount: data.totalAmount,
          dpAmount: data.dpAmount,
          leasingProvider: data.leasingProvider,
          tenor: data.tenor,
          monthlyInstall: data.monthlyInstall,
          status: status,
          notes: data.notes,
        },
      });

      // 2. Update motor status
      await tx.motor.update({
        where: { id: data.motorId },
        data: { status: motorStatus },
      });

      return transaction;
    });

    revalidatePath("/admin/transactions");
    revalidatePath("/admin/inventory");
    revalidatePath("/(public)");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Failed to create transaction" };
  }
}
