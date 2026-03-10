import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "./db";

export type IcfAnswer = {
  icfCode: string;
  qualifier: number;
  note?: string;
};

export type Goal = {
  description: string;
  timeframe: "short" | "medium" | "long";
};

export type WizardStepData = {
  locale?: string;
  // Step 2
  consentGiven?: boolean;
  consentAge?: boolean;
  // Step 3
  participantId?: string;
  age?: number;
  gender?: string;
  diagnosis?: string;
  // Step 4
  icfAnswers?: IcfAnswer[];
  // Step 5
  eAnswers?: IcfAnswer[];
  livingSituation?: string;
  supportPersons?: string;
  // Step 6
  goals?: Goal[];
  // Step 7
  aidWishMissing?: string;
  aidWishHave?: string;
  aidWishWant?: string;
  // Step 9
  signatureBase64?: string;
};

export const WIZARD_COOKIE = "icf_wizard_token";
const SESSION_HOURS = 24;

export async function createWizardSession(adminId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await prisma.wizardSession.create({
    data: { token, adminId, expiresAt, stepData: {} },
  });
  return token;
}

export async function getWizardSession(token: string) {
  const session = await prisma.wizardSession.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.wizardSession.delete({ where: { token } }).catch(() => null);
    return null;
  }
  return session;
}

export async function getWizardSessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) return null;
  return getWizardSession(token);
}

export async function updateStepData(
  token: string,
  data: Partial<WizardStepData>
): Promise<void> {
  const session = await prisma.wizardSession.findUnique({ where: { token } });
  if (!session) return;
  const current = (session.stepData ?? {}) as WizardStepData;
  await prisma.wizardSession.update({
    where: { token },
    data: { stepData: { ...current, ...data } },
  });
}

export async function deleteWizardSession(token: string): Promise<void> {
  await prisma.wizardSession.delete({ where: { token } }).catch(() => null);
}

export function getStepData(session: { stepData: unknown }): WizardStepData {
  return (session.stepData ?? {}) as WizardStepData;
}
