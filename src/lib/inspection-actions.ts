"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getInspectionTemplate(motorType: string = "all") {
  return await prisma.inspectionTemplate.findFirst({
    where: { isActive: true }, // Ideally filter by motorTypeFilter but 'all' is fine for now
    include: {
      groups: {
        orderBy: { orderIndex: 'asc' },
        include: {
          items: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });
}

export async function createInspectionSession(motorId: string, templateId: string, inspectorName: string = "Admin") {
  const session = await prisma.inspectionSession.create({
    data: {
      motorId,
      templateId,
      status: "DRAFT",
      inspectorName,
    }
  });
  revalidatePath(`/admin/inventory/${motorId}/edit`);
  return session;
}

export async function saveInspectionDraft(sessionId: string, answers: any[]) {
  // answers format: [{ templateItemId: "...", answer: "...", status: "...", isCritical: boolean, score: number, notes: "..." }]
  
  // First clear existing items for this session to keep it simple, or upsert.
  await prisma.inspectionItem.deleteMany({
    where: { sessionId }
  });

  if (answers.length > 0) {
    await prisma.inspectionItem.createMany({
      data: answers.map(a => ({
        sessionId,
        templateItemId: a.templateItemId,
        answer: a.answer,
        status: a.status,
        isCritical: a.isCritical,
        score: a.score,
        notes: a.notes,
      }))
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
        include: { templateItem: { include: { group: true } } }
      },
      template: { include: { groups: true } }
    }
  });

  if (!session) throw new Error("Session not found");

  const items = session.items;
  const groups = session.template.groups;

  const hasCritical = items.some(i => i.isCritical && i.status === 'KRITIS');
  
  const scoredItems = items.filter(i => i.score !== null);
  
  let totalScore = 0;
  for (const group of groups) {
    const groupItems = scoredItems.filter(i => i.templateItem.groupId === group.id);
    if (groupItems.length === 0) continue;
    const groupAvg = groupItems.reduce((s, i) => s + i.score!, 0) / groupItems.length;
    totalScore += (groupAvg * group.weight) / 100;
  }

  const grade = hasCritical ? 'C' :
                totalScore >= 90 ? 'A' :
                totalScore >= 75 ? 'B' : 'C';

  const saleEligibility = hasCritical ? 'TIDAK_LAYAK' :
                          grade === 'C' ? 'PERLU_PERBAIKAN' : 'LAYAK_JUAL';

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
  
  // Mark old inspection as archived
  await prisma.motorInspection.updateMany({
    where: { motorId: session.motorId },
    data: { archived: true }
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
          templateItem: { include: { group: true } },
          evidence: true
        }
      }
    }
  });
}

export async function getLatestInspectionSession(motorId: string) {
  return await prisma.inspectionSession.findFirst({
    where: { motorId },
    orderBy: { startedAt: 'desc' },
    include: {
      items: {
        include: {
          templateItem: { include: { group: true } },
          evidence: true
        }
      },
      template: {
        include: {
          groups: {
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
