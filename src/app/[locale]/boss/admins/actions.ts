"use server";

import { hash } from "bcrypt";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getBossFromCookie } from "@/lib/auth";
import { generateReferralCode } from "@/lib/referral";

async function requireBoss() {
  const boss = await getBossFromCookie();
  if (!boss) throw new Error("Unauthorized");
  return boss;
}

type ActionResult = { error?: string } | null;

export async function createAdmin(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireBoss();

  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || username.length < 3) {
    return { error: "Benutzername muss mindestens 3 Zeichen haben." };
  }
  if (!password || password.length < 8) {
    return { error: "Passwort muss mindestens 8 Zeichen haben." };
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    return { error: "Benutzername bereits vergeben." };
  }

  const hashedPassword = await hash(password, 12);
  let referralCode = generateReferralCode();

  // Ensure uniqueness (extremely unlikely collision, but safe)
  while (await prisma.admin.findUnique({ where: { referralCode } })) {
    referralCode = generateReferralCode();
  }

  await prisma.admin.create({
    data: { username, password: hashedPassword, referralCode },
  });

  revalidatePath("/[locale]/boss/admins", "page");
  return null;
}

export async function toggleAdmin(adminId: string): Promise<void> {
  await requireBoss();

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) return;

  await prisma.admin.update({
    where: { id: adminId },
    data: { isActive: !admin.isActive },
  });

  revalidatePath("/[locale]/boss/admins", "page");
}

export async function deleteAdmin(adminId: string): Promise<{ error?: string }> {
  await requireBoss();

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) return { error: "Admin nicht gefunden." };
  if (admin.isActive) return { error: "Nur deaktivierte Admins können gelöscht werden." };

  await prisma.admin.delete({ where: { id: adminId } });

  revalidatePath("/[locale]/boss/admins", "page");
  return {};
}
