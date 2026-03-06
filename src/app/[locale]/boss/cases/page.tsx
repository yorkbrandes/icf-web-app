import { getBossFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function BossCasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const boss = await getBossFromCookie();
  if (!boss) redirect(`/${locale}/boss/login`);

  const cases = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseNumber: true,
      status: true,
      createdAt: true,
      admin: { select: { username: true } },
      customer: {
        select: { participantId: true, age: true, gender: true, diagnosis: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <a href={`/${locale}/boss/dashboard`} className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </a>
          <h1 className="text-xl font-bold text-gray-900">Alle Fälle</h1>
          <span className="text-sm text-gray-400">({cases.length})</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="bg-white rounded-lg shadow-sm overflow-hidden">
          {cases.length === 0 ? (
            <p className="px-6 py-10 text-sm text-gray-500 text-center">
              Noch keine Fälle vorhanden.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fallnummer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teilnehmer-ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alter / Geschlecht
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-mono text-gray-900">
                      {c.caseNumber}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {c.admin.username}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-gray-700">
                      {c.customer.participantId}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {c.customer.age} J. / {c.customer.gender}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {c.customer.diagnosis ?? "–"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.status === "OPEN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c.status === "OPEN" ? "Offen" : "Abgeschlossen"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
