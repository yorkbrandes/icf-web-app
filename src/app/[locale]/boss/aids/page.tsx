import { getBossFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CreateAidForm } from "./CreateAidForm";
import { AidRow } from "./AidRow";

export default async function BossAidsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const boss = await getBossFromCookie();
  if (!boss) redirect(`/${locale}/boss/login`);

  const aids = await prisma.aidItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      isActive: true,
      _count: { select: { selections: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <a href={`/${locale}/boss/dashboard`} className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </a>
          <h1 className="text-xl font-bold text-gray-900">Hilfsmittel verwalten</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Create form */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Neues Hilfsmittel anlegen</h2>
          <CreateAidForm />
        </section>

        {/* Aid list */}
        <section className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beschreibung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  In Fällen
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aids.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Noch keine Hilfsmittel angelegt.
                  </td>
                </tr>
              ) : (
                aids.map((item) => <AidRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
