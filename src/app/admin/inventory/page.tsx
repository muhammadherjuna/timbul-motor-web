import prisma from "@/lib/db";
import InventoryClient from "./InventoryClient";

import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const sessionCookie = (await cookies()).get("session")?.value;
  let role = "ADMIN";
  if (sessionCookie) {
    const payload = await verifySession(sessionCookie);
    if (payload) {
      role = payload.role as string;
    }
  }

  const motorsData: any = await prisma.motor.findMany({
    orderBy: { createdAt: "desc" },
    include: { pricing: true, document: true, history: true, inspection: true }
  } as any);

  const motors: any[] = motorsData.map((m: any) => ({
    ...m, ...(m.pricing||{}), ...(m.document||{}), ...(m.history||{}), ...(m.inspection||{}), id: m.id
  }));

  return <InventoryClient initialMotors={motors} userRole={role} />;
}
