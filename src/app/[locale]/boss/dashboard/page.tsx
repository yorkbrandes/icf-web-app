import { getBossFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function BossDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const boss = await getBossFromCookie();

  if (!boss) {
    redirect(`/${locale}/boss/login`);
  }

  const t = await getTranslations("boss.dashboard");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
          <form action="/api/boss/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Abmelden
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-8 text-gray-600">{t("welcome")}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title={t("admins")}
            href={`/${locale}/boss/admins`}
            description="Admins anlegen, bearbeiten und verwalten"
          />
          <DashboardCard
            title={t("aids")}
            href={`/${locale}/boss/aids`}
            description="Hilfsmittel-Katalog pflegen"
          />
          <DashboardCard
            title={t("cases")}
            href={`/${locale}/boss/cases`}
            description="Alle Fälle systemweit einsehen"
          />
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
    >
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </a>
  );
}
