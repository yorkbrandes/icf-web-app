"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWizardSession, updateStepData, WIZARD_COOKIE } from "@/lib/wizard";
import { generateParticipantId } from "@/lib/participant-id";
import { prisma } from "@/lib/db";

type State = { error?: string } | null;

export async function submitProfile(
  _prev: State,
  formData: FormData
): Promise<State> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) return { error: "Sitzung abgelaufen." };

  const session = await getWizardSession(token);
  if (!session) return { error: "Sitzung abgelaufen." };

  const stepData = (session.stepData ?? {}) as { consentGiven?: boolean; participantId?: string };
  if (!stepData.consentGiven) return { error: "Bitte zuerst die Einwilligung geben." };

  const ageRaw = formData.get("age") as string;
  const gender = formData.get("gender") as string;
  const diagnosis = (formData.get("diagnosis") as string)?.trim() || undefined;

  const age = parseInt(ageRaw, 10);
  if (!ageRaw || isNaN(age) || age < 0 || age > 120) {
    return { error: "Bitte geben Sie ein gültiges Alter an (0–120)." };
  }
  if (!gender) return { error: "Bitte wählen Sie ein Geschlecht." };

  // Generate participantId if not yet set
  let participantId = stepData.participantId;
  if (!participantId) {
    // Ensure uniqueness
    do {
      participantId = generateParticipantId();
    } while (await prisma.customer.findUnique({ where: { participantId } }));
  }

  await updateStepData(token, { participantId, age, gender, diagnosis });
  redirect("profile/../icf-body");
}
