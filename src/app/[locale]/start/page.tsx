import { prisma } from "@/lib/db";
import { StartSession } from "./StartSession";

export default async function WizardStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { ref, error } = await searchParams;

  if (!ref) {
    return <InvalidLink message="Kein Referral-Code angegeben." />;
  }

  if (error === "invalid") {
    return <InvalidLink message="Dieser Link ist ungültig oder abgelaufen." />;
  }

  const admin = await prisma.admin.findUnique({
    where: { referralCode: ref },
    select: { id: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    return <InvalidLink message="Dieser Link ist ungültig oder abgelaufen." />;
  }

  return <StartSession locale={locale} referralCode={ref} />;
}

function InvalidLink({ message }: { message: string }) {
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
