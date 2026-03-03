"use server";

import { compare } from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

type LoginState = { error?: string } | null;

export async function validateAdminLogin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Benutzername und Passwort erforderlich." };
  }

  if (!checkRateLimit(`admin:${username}`)) {
    return { error: "Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten." };
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) return { error: "Ungültige Anmeldedaten." };
    if (!admin.isActive) return { error: "Ihr Konto ist deaktiviert." };

    const passwordValid = await compare(password, admin.password);
    if (!passwordValid) return { error: "Ungültige Anmeldedaten." };

    const token = await signToken({
      role: "admin",
      adminId: admin.id,
      username: admin.username,
    });

    const cookieStore = await cookies();
    cookieStore.set("icf_admin_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
  } catch {
    return { error: "Serverfehler. Bitte versuchen Sie es später erneut." };
  }

  redirect("/de/admin/dashboard");
}
