import prisma from "@/lib/db";
import EditMotorClient from "./EditMotorClient";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

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

  const motor: any = {
    ...motorData,
    ...(motorData.document || {}),
    ...(motorData.history || {}),
    ...(motorData.inspection || {}),
    ...(motorData.pricing || {}),
    id: motorData.id
  };

  const sessionCookie = (await cookies()).get("session")?.value;
  let role = "ADMIN";
  if (sessionCookie) {
    const payload = await verifySession(sessionCookie);
    if (payload) {
      role = payload.role as string;
    }
  }

  return <EditMotorClient motor={motor} userRole={role} />;
}
