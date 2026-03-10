import { getWizardSessionFromCookie, getStepData } from "@/lib/wizard";
import { redirect } from "next/navigation";
import { ICF_E_CODES } from "@/lib/icf-codes";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { QualifierSelect } from "@/components/wizard/QualifierSelect";
import { submitEnvironment } from "./actions";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getWizardSessionFromCookie();
  if (!session) redirect(`/${locale}/start`);

  const data = getStepData(session);
  if (!data.icfAnswers) redirect(`/${locale}/start/icf-body`);

  const existing = data.eAnswers ?? [];
  function getQ(code: string) {
    return existing.find((a) => a.icfCode === code)?.qualifier ?? 0;
  }
  function getNote(code: string) {
    return existing.find((a) => a.icfCode === code)?.note ?? "";
  }

  return (
    <>
      <ProgressBar currentStep={4} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Umweltfaktoren</h1>
        <p className="text-sm text-gray-500 mb-8">
          Umweltfaktoren können Ihre Situation erleichtern (Förderfaktor) oder erschweren (Barriere).
        </p>

        <form action={submitEnvironment} className="space-y-8">
          {/* e-codes */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Umweltfaktoren
            </h2>
            <div className="space-y-6">
              {ICF_E_CODES.map((code) => (
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
                    className="mt-2 block w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Living situation */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div>
              <label htmlFor="livingSituation" className="block text-sm font-medium text-gray-700 mb-1">
                Wohnsituation
              </label>
              <select
                id="livingSituation"
                name="livingSituation"
                defaultValue={data.livingSituation ?? "alone"}
                className="block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="alone">Allein</option>
                <option value="withFamily">Mit Familie</option>
                <option value="assisted">Betreutes Wohnen</option>
                <option value="care">Pflegeeinrichtung</option>
              </select>
            </div>
            <div>
              <label htmlFor="supportPersons" className="block text-sm font-medium text-gray-700 mb-1">
                Wer unterstützt Sie aktuell?
              </label>
              <input
                id="supportPersons"
                name="supportPersons"
                type="text"
                defaultValue={data.supportPersons}
                placeholder="z.B. Ehepartner, Kinder, Pflegedienst"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
