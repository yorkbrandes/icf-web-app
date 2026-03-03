"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getBossFromCookie } from "@/lib/auth";

async function requireBoss() {
  const boss = await getBossFromCookie();
  if (!boss) throw new Error("Unauthorized");
}

type ActionResult = { error?: string } | null;

export async function createAid(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireBoss();

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;

  if (!name) return { error: "Name ist erforderlich." };
  if (!category) return { error: "Kategorie ist erforderlich." };

  const existing = await prisma.aidItem.findUnique({ where: { name } });
  if (existing) return { error: "Ein Hilfsmittel mit diesem Namen existiert bereits." };

  await prisma.aidItem.create({ data: { name, category, description } });
  revalidatePath("/[locale]/boss/aids", "page");
  return null;
}

export async function updateAid(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireBoss();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;

  if (!name) return { error: "Name ist erforderlich." };
  if (!category) return { error: "Kategorie ist erforderlich." };

  const conflict = await prisma.aidItem.findFirst({
    where: { name, NOT: { id } },
  });
  if (conflict) return { error: "Name bereits vergeben." };

  await prisma.aidItem.update({
    where: { id },
    data: { name, category, description },
  });
  revalidatePath("/[locale]/boss/aids", "page");
  return null;
}

export async function toggleAid(id: string): Promise<void> {
  await requireBoss();
  const item = await prisma.aidItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.aidItem.update({
    where: { id },
    data: { isActive: !item.isActive },
  });
  revalidatePath("/[locale]/boss/aids", "page");
}

export async function deleteAid(id: string): Promise<{ error?: string }> {
  await requireBoss();
  const item = await prisma.aidItem.findUnique({ where: { id } });
  if (!item) return { error: "Hilfsmittel nicht gefunden." };
  if (item.isActive) return { error: "Nur deaktivierte Hilfsmittel können gelöscht werden." };
  await prisma.aidItem.delete({ where: { id } });
  revalidatePath("/[locale]/boss/aids", "page");
  return {};
}
