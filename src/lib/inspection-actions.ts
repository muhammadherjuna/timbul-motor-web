"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SCORE_MAP } from "./inspection-constants";
import { ItemAnswerStatus } from "@prisma/client";

export async function getInspectionPackage(packageId?: string) {
  if (packageId) {
    return await prisma.inspectionPackage.findUnique({
      where: { id: packageId, isActive: true },
      include: {
        categories: {
          orderBy: { orderIndex: 'asc' },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });
  }
  return await prisma.inspectionPackage.findFirst({
    where: { isActive: true, isDefault: true },
    include: {
      categories: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });
}

export async function createInspectionSession(motorId: string, packageId: string, inspectorName: string = "Admin") {
  // Ambil struktur paket untuk di-snapshot
  const pkg = await prisma.inspectionPackage.findUnique({
    where: { id: packageId },
    include: {
      categories: {
        include: { items: { where: { isActive: true } } }
      }
    }
  });

  if (!pkg) throw new Error("Package not found");

  const session = await prisma.inspectionSession.create({
    data: {
      motorId,
      packageId,
      status: "DRAFT",
      inspectorName,
      snapshot: {
        create: pkg.categories.flatMap(cat => 
          cat.items.map(item => ({
            itemKey: item.itemKey,
            question: item.question,
            categoryName: cat.name,
            originalWeight: item.weight,
            isSafetyItem: item.isSafetyItem,
            isCriticalItem: item.isCriticalItem,
            orderIndex: item.orderIndex
          }))
        )
      }
    }
  });
  
  revalidatePath(`/admin/inventory/${motorId}/edit`);
  return session;
}

export async function saveInspectionDraft(sessionId: string, answers: any[]) {
  // answers format: [{ packageItemId: "...", answer: "...", status: "...", notes: "...", evidenceUrl?: string }]
  
  for (const a of answers) {
    const existing = await prisma.inspectionItem.findFirst({
      where: { sessionId, packageItemId: a.packageItemId }
    });

    let itemId = existing?.id;

    if (existing) {
      await prisma.inspectionItem.update({
        where: { id: existing.id },
        data: {
          answer: a.answer,
          status: a.status,
          score: SCORE_MAP[a.status] ?? null,
          notes: a.notes,
        }
      });
    } else {
      const created = await prisma.inspectionItem.create({
        data: {
          sessionId,
          packageItemId: a.packageItemId,
          answer: a.answer,
          status: a.status,
          score: SCORE_MAP[a.status] ?? null,
          notes: a.notes,
        }
      });
      itemId = created.id;
    }

    if (a.evidenceUrl && itemId) {
      const existingEv = await prisma.inspectionEvidence.findFirst({
        where: { inspectionItemId: itemId }
      });
      if (existingEv) {
        await prisma.inspectionEvidence.update({
          where: { id: existingEv.id },
          data: { storagePath: a.evidenceUrl }
        });
      } else {
        await prisma.inspectionEvidence.create({
          data: {
            inspectionItemId: itemId,
            storagePath: a.evidenceUrl,
            isPublic: false
          }
        });
      }
    }
  }

  const answerPackageItemIds = answers.map(a => a.packageItemId);
  if (answerPackageItemIds.length > 0) {
    await prisma.inspectionItem.deleteMany({
      where: {
        sessionId,
        packageItemId: { notIn: answerPackageItemIds }
      }
    });
  }

  await prisma.inspectionSession.update({
    where: { id: sessionId },
    data: { status: "IN_PROGRESS" }
  });

  return { success: true };
}

export async function completeInspectionSession(sessionId: string) {
  const session = await prisma.inspectionSession.findUnique({
    where: { id: sessionId },
    include: { 
      items: {
        include: { packageItem: true }
      },
      snapshot: true,
      package: {
        include: { categories: true }
      }
    }
  });

  if (!session) throw new Error("Session not found");

  const snapshotItems = session.snapshot;
  const items = session.items;
  
  let totalScore = 0;
  let hasCritical = false;

  for (const category of session.package.categories) {
    // Cari snapshot yang berada di kategori ini
    const categorySnapshots = snapshotItems.filter(s => s.categoryName === category.name);
    if (categorySnapshots.length === 0) continue;

    // Hitung total bobot asli dari snapshot kategori ini
    const activeItemsWeightSum = categorySnapshots.reduce((sum, s) => sum + s.originalWeight, 0);
    
    let categoryScore = 0;

    for (const snap of categorySnapshots) {
      // Normalisasi proporsional
      const normalizedWeight = (snap.originalWeight / activeItemsWeightSum) * 100;

      // Cari jawaban user untuk item ini
      // Di DB kita menyimpan relasi lewat packageItemId, dan packageItem punya itemKey
      const answeredItem = items.find(i => i.packageItem.itemKey === snap.itemKey);
      
      const score = answeredItem?.score ?? 0;
      const status = answeredItem?.status ?? "BELUM_DIPERIKSA";

      if ((snap.isSafetyItem || snap.isCriticalItem) && (
        status === "RUSAK" || 
        status === "PERLU_PERBAIKAN" ||
        status === "PERLU_GANTI" ||
        status === "TIDAK_LENGKAP"
      )) {
        hasCritical = true;
      }

      const itemScore = (score * normalizedWeight) / 100;
      categoryScore += itemScore;
    }

    const categoryFinalScore = (categoryScore * category.weight) / 100;
    totalScore += categoryFinalScore;
  }

  let grade = 'D';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 75) grade = 'B';
  else if (totalScore >= 60) grade = 'C';

  // Safety Limiter
  if (hasCritical && (grade === 'A' || grade === 'B')) {
    grade = 'C';
  }

  const saleEligibility = hasCritical ? 'PERLU_PERBAIKAN' :
                          grade === 'D' ? 'TIDAK_LAYAK' : 'LAYAK_JUAL';

  await prisma.inspectionSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      totalScore,
      grade,
      hasCritical,
      saleEligibility
    }
  });

  revalidatePath(`/admin/inventory/${session.motorId}/edit`);
  revalidatePath('/admin/inspections');
  return { success: true };
}

export async function approveInspectionSession(sessionId: string, approvedByName: string = "Supervisor", note?: string) {
  const session = await prisma.inspectionSession.update({
    where: { id: sessionId },
    data: {
      status: "APPROVED",
      approvedByName,
      approvalNote: note,
      approvedAt: new Date()
    }
  });

  revalidatePath(`/admin/inventory/${session.motorId}/edit`);
  revalidatePath('/admin/inspections');
  revalidatePath(`/stok/${session.motorId}`);
  return { success: true };
}

export async function rejectInspectionSession(sessionId: string, approvedByName: string = "Supervisor", note?: string) {
  await prisma.inspectionSession.update({
    where: { id: sessionId },
    data: {
      status: "REJECTED",
      approvedByName,
      approvalNote: note,
      approvedAt: new Date()
    }
  });
  revalidatePath('/admin/inspections');
  return { success: true };
}

export async function reopenInspectionSession(sessionId: string, approvedByName: string = "Supervisor", note?: string) {
  await prisma.inspectionSession.update({
    where: { id: sessionId },
    data: {
      status: "IN_PROGRESS",
      approvedByName,
      approvalNote: note,
      grade: null,
      saleEligibility: null,
      totalScore: null,
      completedAt: null,
      approvedAt: null
    }
  });
  revalidatePath('/admin/inspections');
  return { success: true };
}

export async function getActiveInspectionSession(motorId: string) {
  return await prisma.inspectionSession.findFirst({
    where: { 
      motorId,
      status: "APPROVED" 
    },
    orderBy: { approvedAt: 'desc' },
    include: {
      items: {
        include: {
          packageItem: { include: { category: true } },
          evidence: true
        }
      },
      snapshot: true
    }
  });
}

export async function updateItemRepairStatus(itemId: string, repairStatus: string, repairNote?: string) {
  const allowed = ["PERLU_PERBAIKAN", "SUDAH_DIPERBAIKI", "SEBAGAIMANA_ADANYA"];
  if (!allowed.includes(repairStatus)) {
    throw new Error("Invalid repairStatus value");
  }

  const updated = await prisma.inspectionItem.update({
    where: { id: itemId },
    data: {
      repairStatus,
      repairNote,
      repairedAt: repairStatus === "SUDAH_DIPERBAIKI" ? new Date() : null
    },
    include: {
      session: true
    }
  });

  revalidatePath(`/admin/inventory/${updated.session.motorId}/edit`);
  revalidatePath(`/stok/${updated.session.motorId}`);
  return { success: true };
}

export async function getLatestInspectionSession(motorId: string) {
  return await prisma.inspectionSession.findFirst({
    where: { motorId },
    orderBy: { startedAt: 'desc' },
    include: {
      items: {
        include: {
          packageItem: { include: { category: true } },
          evidence: true
        }
      },
      snapshot: true,
      package: {
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
      }
    }
  });
}

export async function getPendingInspectionSessions() {
  return await prisma.inspectionSession.findMany({
    where: { status: "COMPLETED" },
    orderBy: { completedAt: 'desc' },
    include: {
      motor: true
    }
  });
}
