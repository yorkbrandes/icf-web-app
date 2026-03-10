import { getWizardSessionFromCookie, getStepData } from "@/lib/wizard";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { getIcfLabel } from "@/lib/icf-codes";
import Link from "next/link";

const QUALIFIER_LABELS: Record<number, string> = {
  0: "0 – Kein Problem", 1: "1 – Leicht", 2: "2 – Mäßig",
  3: "3 – Erheblich", 4: "4 – Vollständig", 8: "8 – Nicht spezifiziert", 9: "9 – N/A",
};
const TIMEFRAME: Record<string, string> = {
  short: "Kurzfristig", medium: "Mittelfristig", long: "Langfristig",
};

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getWizardSessionFromCookie();
  if (!session) redirect(`/${locale}/start`);

  const data = getStepData(session);
  if (!data.goals) redirect(`/${locale}/start/goals`);

  const icfAnswers = data.icfAnswers ?? [];
  const eAnswers = data.eAnswers ?? [];
  const goals = data.goals ?? [];

  return (
    <>
      <ProgressBar currentStep={7} />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Zusammenfassung</h1>
          <p className="text-sm text-gray-500">Bitte prüfen Sie Ihre Angaben. Sie können über die Links zurückgehen und korrigieren.</p>
        </div>

        {/* Basic data */}
        <Section title="Basisdaten" editHref={`/${locale}/start/profile`}>
          <Row label="Teilnehmer-ID" value={data.participantId ?? "–"} mono />
          <Row label="Alter" value={`${data.age} Jahre`} />
          <Row label="Geschlecht" value={data.gender ?? "–"} />
          <Row label="Diagnose" value={data.diagnosis ?? "–"} />
        </Section>

        {/* ICF b/d */}
        <Section title="Körperfunktionen & Aktivitäten" editHref={`/${locale}/start/icf-body`}>
          {icfAnswers.map((a) => (
            <Row
              key={a.icfCode}
              label={`${a.icfCode} – ${getIcfLabel(a.icfCode, "de")}`}
              value={QUALIFIER_LABELS[a.qualifier] ?? String(a.qualifier)}
              sub={a.note}
            />
          ))}
        </Section>

        {/* e-codes */}
        <Section title="Umweltfaktoren" editHref={`/${locale}/start/environment`}>
          {eAnswers.map((a) => (
            <Row
              key={a.icfCode}
              label={`${a.icfCode} – ${getIcfLabel(a.icfCode, "de")}`}
              value={QUALIFIER_LABELS[a.qualifier] ?? String(a.qualifier)}
              sub={a.note}
            />
          ))}
          <Row label="Wohnsituation" value={data.livingSituation ?? "–"} />
          <Row label="Unterstützung" value={data.supportPersons || "–"} />
        </Section>

        {/* Goals */}
        <Section title="Therapieziele" editHref={`/${locale}/start/goals`}>
          {goals.map((g, i) => (
            <Row
              key={i}
              label={`Ziel ${i + 1} (${TIMEFRAME[g.timeframe] ?? g.timeframe})`}
              value={g.description}
            />
          ))}
        </Section>

        {/* Aid wishes */}
        <Section title="Hilfsmittel-Wünsche" editHref={`/${locale}/start/aids`}>
          <Row label="Was fehlt im Alltag?" value={data.aidWishMissing || "–"} />
          <Row label="Bereits in Verwendung" value={data.aidWishHave || "–"} />
          <Row label="Was würde helfen?" value={data.aidWishWant || "–"} />
        </Section>

        <div className="flex justify-end pt-4">
          <Link
            href={`/${locale}/start/signature`}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Weiter zur Unterschrift
          </Link>
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <Link href={editHref} className="text-xs text-blue-600 hover:text-blue-800">
          Bearbeiten
        </Link>
      </div>
      <dl className="divide-y divide-gray-100">{children}</dl>
    </div>
  );
}

function Row({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-5 py-3">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className={`text-sm text-gray-900 ${mono ? "font-mono font-medium" : ""}`}>
        {value}
        {sub && <span className="block text-xs text-gray-400 mt-0.5">{sub}</span>}
      </dd>
    </div>
  );
}
