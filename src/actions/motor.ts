"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAvailableMotors() {
  try {
    const motors = await prisma.motor.findMany({
      where: { status: "Tersedia" },
      include: {
        pricing: true,
      }
    });
    return { success: true, data: motors };
  } catch (error) {
    console.error("Error fetching available motors:", error);
    return { success: false, error: "Failed to fetch available motors" };
  }
}
