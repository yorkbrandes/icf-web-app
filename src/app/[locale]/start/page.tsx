import { prisma } from "@/lib/db";
import { createWizardSession, WIZARD_COOKIE } from "@/lib/wizard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function WizardStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;

  if (!ref) {
    return <InvalidLink locale={locale} message="Kein Referral-Code angegeben." />;
  }

  const admin = await prisma.admin.findUnique({
    where: { referralCode: ref },
    select: { id: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    return <InvalidLink locale={locale} message="Dieser Link ist ungültig oder abgelaufen." />;
  }

  // Create wizard session and set cookie
  const token = await createWizardSession(admin.id);
  const cookieStore = await cookies();
  cookieStore.set(WIZARD_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60,
    path: "/",
  });

  redirect(`/${locale}/start/consent`);
}

function InvalidLink({ message }: { locale?: string; message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center px-4">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ungültiger Link</h1>
        <p className="text-gray-600">{message}</p>
        <p className="mt-4 text-sm text-gray-500">
          Bitte wenden Sie sich an Ihren Therapeuten, um einen neuen Link zu erhalten.
        </p>
      </div>
    </div>
  );
}
