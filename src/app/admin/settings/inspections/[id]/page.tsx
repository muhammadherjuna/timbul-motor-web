import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import PackageDetailClient from "./PackageDetailClient";

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = await prisma.inspectionPackage.findUnique({
    where: { id: params.id },
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
