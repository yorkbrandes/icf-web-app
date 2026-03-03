import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getIcfLabel } from "@/lib/icf-codes";
import { AidSelector } from "./AidSelector";
import { toggleCaseStatus } from "./actions";

const QUALIFIER_LABELS: Record<number, string> = {
  0: "0 – kein Problem",
  1: "1 – leichtes Problem",
  2: "2 – mäßiges Problem",
  3: "3 – erhebliches Problem",
  4: "4 – vollständiges Problem",
  8: "8 – nicht spezifiziert",
  9: "9 – nicht anwendbar",
};

export default async function AdminCasePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await getAdminFromCookie();
  if (!session) redirect(`/${locale}/admin/login`);

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      customer: true,
      answers: { orderBy: { icfCode: "asc" } },
      summary: true,
      aidSelections: {
        include: { aidItem: { select: { name: true, category: true } } },
      },
    },
  });

  if (!caseData || caseData.adminId !== session.adminId) {
    redirect(`/${locale}/admin/dashboard`);
  }

  // Fetch all active aids for the selector
  const activeAids = await prisma.aidItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true, description: true },
  });

  const existingSelections = caseData.aidSelections.map((s) => ({
    aidItemId: s.aidItemId,
    note: s.note,
  }));

  const summary = caseData.summary as {
    goals?: { description: string; timeframe: string }[];
    environment?: { livingSituation?: string; supportPersons?: string };
  } | null;

  const isOpen = caseData.status === "OPEN";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <a href={`/${locale}/admin/dashboard`} className="text-sm text-gray-500 hover:text-gray-700">
            ← Übersicht
          </a>
          <h1 className="text-xl font-bold text-gray-900 font-mono">{caseData.caseNumber}</h1>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              isOpen ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {isOpen ? "Offen" : "Abgeschlossen"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Basisdaten */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Teilnehmerdaten</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Teilnehmer-ID</dt>
              <dd className="mt-1 text-sm font-mono font-semibold text-gray-900">
                {caseData.customer.participantId}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Alter</dt>
              <dd className="mt-1 text-sm text-gray-900">{caseData.customer.age} Jahre</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Geschlecht</dt>
              <dd className="mt-1 text-sm text-gray-900">{caseData.customer.gender}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Diagnose</dt>
              <dd className="mt-1 text-sm text-gray-900">{caseData.customer.diagnosis ?? "–"}</dd>
            </div>
          </dl>
        </section>

        {/* ICF-Antworten */}
        <section className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">ICF-Einschätzungen</h2>
          </div>
          {caseData.answers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500">Keine Antworten vorhanden.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bezeichnung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualifier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anmerkung
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caseData.answers.map((answer) => (
                  <tr key={answer.id}>
                    <td className="px-6 py-3 text-sm font-mono text-gray-700">{answer.icfCode}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {getIcfLabel(answer.icfCode, "de")}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {QUALIFIER_LABELS[answer.qualifier] ?? answer.qualifier}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{answer.note ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Ziele & Umwelt */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ziele</h2>
              {(summary.goals ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">Keine Ziele angegeben.</p>
              ) : (
                <ul className="space-y-2">
                  {(summary.goals ?? []).map((g, i) => (
                    <li key={i} className="text-sm text-gray-800">
                      <span className="font-medium">{g.description}</span>
                      <span className="text-gray-500 ml-2">({g.timeframe})</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Umweltfaktoren</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Wohnsituation</dt>
                  <dd className="text-sm text-gray-800">
                    {summary.environment?.livingSituation ?? "–"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Unterstützungspersonen</dt>
                  <dd className="text-sm text-gray-800">
                    {summary.environment?.supportPersons ?? "–"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}

        {/* Hilfsmittelwünsche des Endnutzers */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hilfsmittelwünsche (Angaben des Teilnehmers)
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Was fehlt im Alltag?</dt>
              <dd className="mt-1 text-sm text-gray-800">{caseData.aidWishMissing || "–"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Welche Hilfsmittel werden bereits genutzt?</dt>
              <dd className="mt-1 text-sm text-gray-800">{caseData.aidWishHave || "–"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wider">Was würde helfen?</dt>
              <dd className="mt-1 text-sm text-gray-800">{caseData.aidWishWant || "–"}</dd>
            </div>
          </dl>
        </section>

        {/* Hilfsmittelzuordnung durch Admin */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hilfsmittel zuordnen
          </h2>
          {activeAids.length === 0 ? (
            <p className="text-sm text-gray-500">
              Keine aktiven Hilfsmittel verfügbar. Bitte beim Boss nachfragen.
            </p>
          ) : (
            <AidSelector
              caseId={caseData.id}
              aids={activeAids}
              existing={existingSelections}
            />
          )}
        </section>

        {/* Export */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export</h2>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`/api/admin/cases/${caseData.id}/export?type=pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              PDF exportieren
            </a>
            <a
              href={`/api/admin/cases/${caseData.id}/export?type=docx`}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              DOCX exportieren
            </a>
          </div>
        </section>

        {/* Status ändern */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fallstatus</h2>
          <form
            action={async () => {
              "use server";
              await toggleCaseStatus(id);
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600"
            >
              {isOpen ? "Fall abschließen" : "Fall wieder öffnen"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
