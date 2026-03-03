"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

async function requireAdmin() {
  const session = await getAdminFromCookie();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function verifyAdminOwnsCase(adminId: string, caseId: string) {
  const c = await prisma.case.findUnique({ where: { id: caseId }, select: { adminId: true } });
  if (!c || c.adminId !== adminId) throw new Error("Forbidden");
}

export async function saveAidSelections(
  caseId: string,
  selections: { aidItemId: string; note: string }[]
): Promise<{ error?: string }> {
  const session = await requireAdmin();
  await verifyAdminOwnsCase(session.adminId, caseId);

  // Delete existing selections, then re-create
  await prisma.aidSelection.deleteMany({ where: { caseId } });

  if (selections.length > 0) {
    await prisma.aidSelection.createMany({
      data: selections.map((s) => ({
        caseId,
        aidItemId: s.aidItemId,
        note: s.note.trim() || null,
      })),
    });
  }

  revalidatePath(`/[locale]/admin/cases/${caseId}`, "page");
  return {};
}

export async function toggleCaseStatus(caseId: string): Promise<void> {
  const session = await requireAdmin();
  await verifyAdminOwnsCase(session.adminId, caseId);

  const c = await prisma.case.findUnique({ where: { id: caseId }, select: { status: true } });
  if (!c) return;

  await prisma.case.update({
    where: { id: caseId },
    data: { status: c.status === "OPEN" ? "CLOSED" : "OPEN" },
  });

  revalidatePath(`/[locale]/admin/cases/${caseId}`, "page");
}
