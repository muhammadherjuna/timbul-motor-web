import prisma from "@/lib/db";
import StokClient from "./StokClient";

export const dynamic = "force-dynamic";

export default async function StokPage() {
  const motors = await prisma.motor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <StokClient initialMotors={motors} />;
}
