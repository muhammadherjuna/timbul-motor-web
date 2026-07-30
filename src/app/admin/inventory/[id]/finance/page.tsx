import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import FinanceClient from "./FinanceClient";

export default async function FinanceSimulatorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const motorData: any = await prisma.motor.findUnique({
    where: { id: resolvedParams.id },
    include: { pricing: true, document: true, history: true, inspection: true }
  } as any);

  if (!motorData) {
    notFound();
  }

  const motor: any = {
    ...motorData,
    ...(motorData.document || {}),
    ...(motorData.history || {}),
    ...(motorData.inspection || {}),
    ...(motorData.pricing || {})
  };

  return <FinanceClient motor={motor} />;
}
