"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWizardSession, updateStepData, WIZARD_COOKIE } from "@/lib/wizard";
import { ICF_B_CODES, ICF_D_CODES } from "@/lib/icf-codes";

export async function submitIcfBody(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) redirect("/de/start");

  const session = await getWizardSession(token);
  if (!session) redirect("/de/start");

  const locale = (session.stepData as { locale?: string }).locale ?? "de";
  const allCodes = [...ICF_B_CODES, ...ICF_D_CODES];
  const icfAnswers = allCodes.map((c) => ({
    icfCode: c.code,
    qualifier: parseInt(formData.get(`qualifier_${c.code}`) as string, 10) || 0,
    note: (formData.get(`note_${c.code}`) as string)?.trim() || undefined,
  }));

  await updateStepData(token, { icfAnswers });
  redirect(`/${locale}/start/environment`);
}
