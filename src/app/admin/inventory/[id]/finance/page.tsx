import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import FinanceClient from "./FinanceClient";

export default async function FinanceSimulatorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const motor = await prisma.motor.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!motor) {
    notFound();
  }

  return <FinanceClient motor={motor} />;
}
