"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWizardSession, updateStepData, WIZARD_COOKIE } from "@/lib/wizard";

type State = { error?: string } | null;

export async function submitConsent(
  _prev: State,
  formData: FormData
): Promise<State> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) return { error: "Sitzung abgelaufen. Bitte starten Sie erneut." };

  const session = await getWizardSession(token);
  if (!session) return { error: "Sitzung abgelaufen. Bitte starten Sie erneut." };

  const consent = formData.get("consent") === "on";
  const ageConfirm = formData.get("age_confirm") === "on";

  if (!consent || !ageConfirm) {
    return { error: "Bitte stimmen Sie beiden Punkten zu, um fortzufahren." };
  }

  await updateStepData(token, { consentGiven: true, consentAge: true });
  redirect("consent/../profile");
}
