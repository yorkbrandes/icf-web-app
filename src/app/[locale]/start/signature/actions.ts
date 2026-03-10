"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  getWizardSession,
  getStepData,
  deleteWizardSession,
  WIZARD_COOKIE,
} from "@/lib/wizard";
import { prisma } from "@/lib/db";
import { generateCaseNumber } from "@/lib/case-number";
import { generateReport } from "@/lib/text-generator";

type State = { error?: string } | null;

export async function submitSignature(
  _prev: State,
  formData: FormData
): Promise<State> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WIZARD_COOKIE)?.value;
  if (!token) return { error: "Sitzung abgelaufen." };

  const session = await getWizardSession(token);
  if (!session) return { error: "Sitzung abgelaufen." };

  const signature = formData.get("signature") as string;
  if (!signature || !signature.startsWith("data:image/png;base64,")) {
    return { error: "Bitte unterschreiben Sie vor dem Absenden." };
  }

  const data = getStepData(session);
  const locale = data.locale ?? "de";
  if (!data.participantId || !data.age || !data.gender || !data.goals?.length) {
    return { error: "Unvollständige Daten. Bitte gehen Sie zurück und füllen Sie alle Pflichtfelder aus." };
  }

  let caseNumber: string;
  let caseId: string;

  try {
    // Create Customer
    const customer = await prisma.customer.create({
      data: {
        participantId: data.participantId,
        age: data.age,
        gender: data.gender,
        diagnosis: data.diagnosis,
        adminId: session.adminId,
      },
    });

    // Generate case number
    caseNumber = await generateCaseNumber();

    // Create Case
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        adminId: session.adminId,
        customerId: customer.id,
        aidWishMissing: data.aidWishMissing,
        aidWishHave: data.aidWishHave,
        aidWishWant: data.aidWishWant,
      },
    });
    caseId = newCase.id;

    // Save signature file
    const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
    const sigDir = path.join(uploadDir, "signatures");
    await mkdir(sigDir, { recursive: true });
    const base64Data = signature.replace(/^data:image\/png;base64,/, "");
    const sigPath = path.join(sigDir, `${caseId}.png`);
    await writeFile(sigPath, Buffer.from(base64Data, "base64"));

    await prisma.case.update({
      where: { id: caseId },
      data: { signaturePath: sigPath },
    });

    // Create CaseAnswers (b+d codes)
    if (data.icfAnswers?.length) {
      await prisma.caseAnswer.createMany({
        data: data.icfAnswers.map((a) => ({
          caseId,
          icfCode: a.icfCode,
          qualifier: a.qualifier,
          note: a.note,
        })),
      });
    }
    // e-codes also as CaseAnswers
    if (data.eAnswers?.length) {
      await prisma.caseAnswer.createMany({
        data: data.eAnswers.map((a) => ({
          caseId,
          icfCode: a.icfCode,
          qualifier: a.qualifier,
          note: a.note,
        })),
      });
    }

    // Generate text report
    const report = generateReport({
      caseId,
      icfAnswers: data.icfAnswers ?? [],
      eAnswers: data.eAnswers ?? [],
      goals: data.goals ?? [],
      livingSituation: data.livingSituation ?? "alone",
      supportPersons: data.supportPersons ?? "",
      aidItems: [],
      locale: (locale as "de" | "en" | "fr"),
    });

    // Create CaseSummary
    await prisma.caseSummary.create({
      data: {
        caseId,
        goals: data.goals ?? [],
        environment: {
          livingSituation: data.livingSituation,
          supportPersons: data.supportPersons,
        },
        generatedText: report,
      },
    });

    // Clean up session
    await deleteWizardSession(token);
    cookieStore.delete(WIZARD_COOKIE);
  } catch (err) {
    console.error("[signature action]", err);
    return { error: "Fehler beim Speichern. Bitte versuchen Sie es erneut." };
  }

  redirect(`/${locale}/start/done?cn=${encodeURIComponent(caseNumber!)}&pid=${encodeURIComponent(data.participantId)}`);
}
