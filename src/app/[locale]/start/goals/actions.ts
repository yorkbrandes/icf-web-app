"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWizardSession, updateStepData, WIZARD_COOKIE } from "@/lib/wizard";
import type { Goal } from "@/lib/wizard";

type State = { error?: string } | null;

export async function submitGoals(
  _prev: State,
  formData: FormData
): Promise<State> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) return { error: "Sitzung abgelaufen." };

  const session = await getWizardSession(token);
  if (!session) return { error: "Sitzung abgelaufen." };

  const count = parseInt(formData.get("goal_count") as string, 10) || 1;
  const goals: Goal[] = [];

  for (let i = 0; i < count; i++) {
    const description = (formData.get(`goal_description_${i}`) as string)?.trim();
    const timeframe = (formData.get(`goal_timeframe_${i}`) as string) as Goal["timeframe"];
    if (description) {
      goals.push({ description, timeframe: timeframe || "short" });
    }
  }

  if (goals.length === 0) {
    return { error: "Bitte geben Sie mindestens ein Therapieziel an." };
  }

  const locale = (session.stepData as { locale?: string }).locale ?? "de";
  await updateStepData(token, { goals });
  redirect(`/${locale}/start/aids`);
}
