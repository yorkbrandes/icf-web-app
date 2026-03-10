"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWizardSession, updateStepData, WIZARD_COOKIE } from "@/lib/wizard";
import { ICF_E_CODES } from "@/lib/icf-codes";

export async function submitEnvironment(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) redirect("/de/start");

  const session = await getWizardSession(token);
  if (!session) redirect("/de/start");

  const locale = (session.stepData as { locale?: string }).locale ?? "de";
  const eAnswers = ICF_E_CODES.map((c) => ({
    icfCode: c.code,
    qualifier: parseInt(formData.get(`qualifier_${c.code}`) as string, 10) || 0,
    note: (formData.get(`note_${c.code}`) as string)?.trim() || undefined,
  }));

  const livingSituation = (formData.get("livingSituation") as string) || "alone";
  const supportPersons = (formData.get("supportPersons") as string)?.trim() || "";

  await updateStepData(token, { eAnswers, livingSituation, supportPersons });
  redirect(`/${locale}/start/goals`);
}
