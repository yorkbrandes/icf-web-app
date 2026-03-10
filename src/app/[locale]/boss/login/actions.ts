"use server";

import { compare } from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

// In-memory rate limiting (per IP, per process)
// For production, use Redis or similar
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}

type LoginState = {
  error?: string;
} | null;

export async function validateBossLogin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "de";

  // Basic validation
  if (!email || !password) {
    return { error: "E-Mail und Passwort erforderlich" };
  }

  // Rate limiting (using a placeholder IP since we can't access headers easily in Server Actions)
  // In production with a proper setup, extract real IP from headers
  const ip = "server-action";
  if (!checkRateLimit(ip)) {
    return { error: "Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten." };
  }

  try {
    const boss = await prisma.boss.findUnique({ where: { email } });

    if (!boss) {
      return { error: "Ungültige Anmeldedaten" };
    }

    const passwordValid = await compare(password, boss.password);
    if (!passwordValid) {
      return { error: "Ungültige Anmeldedaten" };
    }

    const token = await signToken({ role: "boss", bossId: boss.id });

    const cookieStore = await cookies();
    cookieStore.set("icf_boss_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });
  } catch {
    return { error: "Serverfehler. Bitte versuchen Sie es später erneut." };
  }

  redirect(`/${locale}/boss/dashboard`);
}
