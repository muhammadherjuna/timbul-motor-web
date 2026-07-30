import prisma from "@/lib/db";
import StokClient from "./StokClient";

export const dynamic = "force-dynamic";

export default async function StokPage() {
  const motorsData: any = await prisma.motor.findMany({
    orderBy: { createdAt: "desc" },
    include: { pricing: true, document: true, history: true, inspection: true }
  } as any);

  const motors: any[] = motorsData.map((m: any) => ({
    ...m, ...(m.pricing||{}), ...(m.document||{}), ...(m.history||{}), ...(m.inspection||{})
  }));

  return <StokClient initialMotors={motors} />;
}
