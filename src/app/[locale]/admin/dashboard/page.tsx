import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CopyLinkButton } from "./CopyLinkButton";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAdminFromCookie();
  if (!session) redirect(`/${locale}/admin/login`);

  const t = await getTranslations("admin.dashboard");

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: {
      username: true,
      referralCode: true,
      cases: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          caseNumber: true,
          status: true,
          createdAt: true,
          customer: {
            select: { participantId: true, age: true, gender: true, diagnosis: true },
          },
        },
      },
    },
  });

  if (!admin) redirect(`/${locale}/admin/login`);

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const affiliateLink = `${appUrl}/${locale}/start?ref=${admin.referralCode}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{admin.username}</span>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Affiliate Link */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t("affiliateLink")}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm font-mono text-gray-800 break-all">
              {affiliateLink}
            </code>
            <CopyLinkButton link={affiliateLink} />
          </div>
        </section>

        {/* Cases */}
        <section className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t("cases")}</h2>
          </div>

          {admin.cases.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              Noch keine Fälle vorhanden. Teile deinen Affiliate-Link, damit Klienten den Wizard starten können.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fallnummer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teilnehmer-ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alter / Geschlecht</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admin.cases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{c.caseNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{c.customer.participantId}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.customer.age} J. / {c.customer.gender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.customer.diagnosis ?? "–"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.status === "OPEN"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {c.status === "OPEN" ? "Offen" : "Abgeschlossen"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/${locale}/admin/cases/${c.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Öffnen
                      </a>
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
