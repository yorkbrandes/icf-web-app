import { getWizardSessionFromCookie, getStepData } from "@/lib/wizard";
import { generateParticipantId } from "@/lib/participant-id";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getWizardSessionFromCookie();
  if (!session) redirect(`/${locale}/start`);

  const data = getStepData(session);
  if (!data.consentGiven) redirect(`/${locale}/start/consent`);

  // Pre-generate participantId for display (not yet saved)
  const displayId = data.participantId ?? generateParticipantId();

  return (
    <>
      <ProgressBar currentStep={2} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ihre Basisdaten</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ihre Angaben werden anonym gespeichert und ausschließlich zur ICF-Dokumentation verwendet.
        </p>

        {/* Participant ID display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-1">Ihre Teilnehmer-ID</p>
          <p className="text-2xl font-bold text-blue-900 font-mono">{displayId}</p>
          <p className="text-xs text-blue-700 mt-1">
            Bitte notieren Sie diese Nummer. Ihr Therapeut kann damit Ihren Fall zuordnen.
          </p>
        </div>

        <ProfileForm
          initial={{ age: data.age, gender: data.gender, diagnosis: data.diagnosis }}
          participantId={displayId}
        />
      </main>
    </>
  );
}
