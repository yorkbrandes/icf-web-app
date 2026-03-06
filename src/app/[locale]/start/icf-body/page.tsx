import { getWizardSessionFromCookie, getStepData } from "@/lib/wizard";
import { redirect } from "next/navigation";
import { ICF_B_CODES, ICF_D_CODES } from "@/lib/icf-codes";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { QualifierSelect } from "@/components/wizard/QualifierSelect";
import { submitIcfBody } from "./actions";

export default async function IcfBodyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getWizardSessionFromCookie();
  if (!session) redirect(`/${locale}/start`);

  const data = getStepData(session);
  if (!data.participantId) redirect(`/${locale}/start/profile`);

  const existingAnswers = data.icfAnswers ?? [];
  function getQ(code: string) {
    return existingAnswers.find((a) => a.icfCode === code)?.qualifier ?? 0;
  }
  function getNote(code: string) {
    return existingAnswers.find((a) => a.icfCode === code)?.note ?? "";
  }

  return (
    <>
      <ProgressBar currentStep={3} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Körperfunktionen & Aktivitäten</h1>
        <p className="text-sm text-gray-500 mb-8">
          Bitte bewerten Sie die folgenden Bereiche. 0 = kein Problem, 4 = vollständiges Problem.
        </p>

        <form action={submitIcfBody} className="space-y-10">
          {/* b-codes */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Körperfunktionen
            </h2>
            <div className="space-y-6">
              {ICF_B_CODES.map((code) => (
                <div key={code.code} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="font-mono text-xs text-blue-600 font-medium">{code.code}</span>
                      <p className="font-medium text-gray-900">{code.de}</p>
                      {code.descriptionDe && (
                        <p className="text-xs text-gray-500 mt-0.5">{code.descriptionDe}</p>
                      )}
                    </div>
                  </div>
                  <QualifierSelect name={`qualifier_${code.code}`} defaultValue={getQ(code.code)} />
                  <textarea
                    name={`note_${code.code}`}
                    defaultValue={getNote(code.code)}
                    placeholder="Anmerkung (optional)..."
                    rows={1}
                    className="mt-2 block w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* d-codes */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Aktivitäten & Teilhabe
            </h2>
            <div className="space-y-6">
              {ICF_D_CODES.map((code) => (
                <div key={code.code} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="mb-3">
                    <span className="font-mono text-xs text-blue-600 font-medium">{code.code}</span>
                    <p className="font-medium text-gray-900">{code.de}</p>
                    {code.descriptionDe && (
                      <p className="text-xs text-gray-500 mt-0.5">{code.descriptionDe}</p>
                    )}
                  </div>
                  <QualifierSelect name={`qualifier_${code.code}`} defaultValue={getQ(code.code)} />
                  <textarea
                    name={`note_${code.code}`}
                    defaultValue={getNote(code.code)}
                    placeholder="Anmerkung (optional)..."
                    rows={1}
                    className="mt-2 block w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Weiter
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
