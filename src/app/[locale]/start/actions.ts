"use server";

import { prisma } from "@/lib/db";
import { createWizardSession, WIZARD_COOKIE } from "@/lib/wizard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function initWizardSession(formData: FormData): Promise<void> {
  const ref = (formData.get("ref") as string) ?? "";
  const locale = (formData.get("locale") as string) ?? "de";

  const admin = await prisma.admin.findUnique({
    where: { referralCode: ref },
    select: { id: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    redirect(`/${locale}/start?ref=${encodeURIComponent(ref)}&error=invalid`);
  }

  const token = await createWizardSession(admin.id);
  // Store locale in session so all wizard steps can use it for redirects
  const { updateStepData } = await import("@/lib/wizard");
  await updateStepData(token, { locale });
  const cookieStore = await cookies();
  cookieStore.set(WIZARD_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60,
    path: "/",
  });

  redirect(`/${locale}/start/consent`);
}
