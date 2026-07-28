import prisma from "@/lib/db";
import InventoryClient from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const motors = await prisma.motor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <InventoryClient initialMotors={motors} />;
}
