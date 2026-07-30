import prisma from "@/lib/db";
import EditMotorClient from "./EditMotorClient";
import { notFound } from "next/navigation";

export default async function EditMotorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const motorData: any = await prisma.motor.findUnique({
    where: { id: resolvedParams.id },
    include: {
      document: true,
      history: true,
      inspection: true,
      pricing: true
    }
  } as any);

  if (!motorData) {
    notFound();
  }

  // Flatten the motor object so the client component (which expects flat properties) still works
  const motor: any = {
    ...motorData,
    ...(motorData.document || {}),
    ...(motorData.history || {}),
    ...(motorData.inspection || {}),
    ...(motorData.pricing || {})
  };

  return <EditMotorClient motor={motor} />;
}
