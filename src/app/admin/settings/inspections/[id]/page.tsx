import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import PackageDetailClient from "./PackageDetailClient";

export const dynamic = "force-dynamic";
export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.inspectionPackage.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });

  if (!pkg) {
    notFound();
  }

  return <PackageDetailClient pkg={{ ...pkg, description: pkg.description || "" }} />;
}
