import prisma from "@/lib/db";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const motorsData: any = await prisma.motor.findMany({
    orderBy: { createdAt: "desc" },
    include: { pricing: true, document: true, history: true, inspection: true }
  } as any);

  const motors: any[] = motorsData.map((m: any) => ({
    ...m, ...(m.pricing||{}), ...(m.document||{}), ...(m.history||{}), ...(m.inspection||{}), id: m.id
  }));

  return <InventoryClient initialMotors={motors} />;
}
