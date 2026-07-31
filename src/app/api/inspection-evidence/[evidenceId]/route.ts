import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evidenceId: string }> }
) {
  try {
    const { evidenceId } = await params;

    const evidence = await prisma.inspectionEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        inspectionItem: {
          include: {
            session: {
              include: {
                motor: true
              }
            }
          }
        }
      }
    });

    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    // Check auth for internal admin access
    const sessionCookie = (await cookies()).get("session")?.value;
    let isInternalAdmin = false;
    if (sessionCookie) {
      const payload = await verifySession(sessionCookie);
      if (payload && ["ADMIN", "SUPER_ADMIN", "MECHANIC", "SUPERVISOR"].includes(payload.role as string)) {
        isInternalAdmin = true;
      }
    }

    const session = evidence.inspectionItem.session;
    const motor = session.motor;

    const isSessionApproved = session.status === "APPROVED";
    const isMotorActive = motor.status !== "SOLD" && motor.status !== "ARCHIVED";

    // Whitelist rule: public access ONLY if (isSessionApproved AND isMotorActive) OR isInternalAdmin
    if (!isInternalAdmin && !(isSessionApproved && isMotorActive)) {
      return NextResponse.json(
        { error: "Access Denied: Inspection evidence is private and pending approval or inactive" },
        { status: 403 }
      );
    }

    // Generate signed URL from Supabase or redirect to publicUrl if already complete URL
    let path = evidence.storagePath;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // If full URL was stored, extract path relative to bucket
      const parts = path.split("/motors/");
      if (parts.length > 1) {
        path = parts[1];
      }
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from("motors")
      .createSignedUrl(path, 300); // 5 minutes validity

    if (signedError || !signedData?.signedUrl) {
      // Fallback: if storage path is full public URL
      if (evidence.storagePath.startsWith("http")) {
        return NextResponse.redirect(evidence.storagePath);
      }
      return NextResponse.json({ error: "Failed to generate media access URL" }, { status: 500 });
    }

    return NextResponse.redirect(signedData.signedUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
