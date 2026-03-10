"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWizardSession, updateStepData, WIZARD_COOKIE } from "@/lib/wizard";

type State = { error?: string } | null;

export async function submitAids(
  _prev: State,
  formData: FormData
): Promise<State> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) return { error: "Sitzung abgelaufen." };

  const session = await getWizardSession(token);
  if (!session) return { error: "Sitzung abgelaufen." };

  const aidWishMissing = (formData.get("aidWishMissing") as string)?.trim() || undefined;
  const aidWishHave = (formData.get("aidWishHave") as string)?.trim() || undefined;
  const aidWishWant = (formData.get("aidWishWant") as string)?.trim() || undefined;

  const locale = (session.stepData as { locale?: string }).locale ?? "de";
  await updateStepData(token, { aidWishMissing, aidWishHave, aidWishWant });
  redirect(`/${locale}/start/summary`);
}
