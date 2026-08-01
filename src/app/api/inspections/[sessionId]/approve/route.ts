import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-for-development-only"
);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { action, note } = await request.json(); // action: "APPROVE", "REJECT", "REVOKE"

    // 1. Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.sub as string;
    const userRole = payload.role as string;
    const userName = payload.name as string;

    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: requires Supervisor access" }, { status: 403 });
    }

    // 2. Fetch session
    const session = await prisma.inspectionSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const now = new Date();

    // 3. Process action
    if (action === "APPROVE") {
      if (session.status !== "COMPLETED") {
        return NextResponse.json({ error: "Only COMPLETED sessions can be approved" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Update session
        await tx.inspectionSession.update({
          where: { id: sessionId },
          data: {
            status: "APPROVED",
            approvedById: userId,
            approvedByName: userName,
            approvedAt: now,
          },
        });

        // Log event
        await tx.inspectionSessionEvent.create({
          data: {
            sessionId: sessionId,
            actorId: userId,
            actorName: userName,
            type: "APPROVED",
            note: note || "Inspection approved",
          }
        });
      });

    } else if (action === "REJECT") {
      if (session.status !== "COMPLETED") {
        return NextResponse.json({ error: "Only COMPLETED sessions can be rejected" }, { status: 400 });
      }
      
      if (!note) {
        return NextResponse.json({ error: "Rejection note is required" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.inspectionSession.update({
          where: { id: sessionId },
          data: {
            status: "REJECTED",
            rejectedById: userId,
            rejectedByName: userName,
            rejectionNote: note,
            rejectedAt: now,
          },
        });

        await tx.inspectionSessionEvent.create({
          data: {
            sessionId: sessionId,
            actorId: userId,
            actorName: userName,
            type: "REJECTED",
            note: note,
          }
        });
      });

    } else if (action === "REVOKE") {
      if (session.status !== "APPROVED") {
        return NextResponse.json({ error: "Only APPROVED sessions can be revoked" }, { status: 400 });
      }

      if (!note) {
        return NextResponse.json({ error: "Revocation note is required" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.inspectionSession.update({
          where: { id: sessionId },
          data: {
            status: "COMPLETED", // Revert to completed
            // Keep approvedBy fields for history or nullify them? Better to nullify them so it needs fresh approval
            approvedById: null,
            approvedByName: null,
            approvedAt: null,
          },
        });

        await tx.inspectionSessionEvent.create({
          data: {
            sessionId: sessionId,
            actorId: userId,
            actorName: userName,
            type: "REVOKED",
            note: note,
          }
        });
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Session ${action.toLowerCase()} successfully` });

  } catch (error: any) {
    console.error("Approve API Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
