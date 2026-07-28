import prisma from "@/lib/db";
import EditMotorClient from "./EditMotorClient";
import { notFound } from "next/navigation";

export default async function EditMotorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const motor = await prisma.motor.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!motor) {
    notFound();
  }

  return <EditMotorClient motor={motor} />;
}
