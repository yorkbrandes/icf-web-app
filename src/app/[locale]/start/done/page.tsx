export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ cn?: string; pid?: string }>;
}) {
  const { cn, pid } = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="text-5xl mb-6">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Vielen Dank!</h1>
      <p className="text-gray-600 mb-8">
        Ihre Angaben wurden erfolgreich gespeichert. Ihr Ansprechpartner wird sich melden.
      </p>

      {(cn || pid) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left inline-block min-w-72">
          {pid && (
            <div className="mb-3">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                Ihre Teilnehmer-ID
              </p>
              <p className="text-2xl font-bold font-mono text-blue-900">{pid}</p>
            </div>
          )}
          {cn && (
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                Ihre Fallnummer
              </p>
              <p className="text-2xl font-bold font-mono text-blue-900">{cn}</p>
            </div>
          )}
          <p className="text-xs text-blue-700 mt-4">
            Bitte notieren Sie diese Nummern. Ihr Therapeut kann damit Ihre Unterlagen zuordnen.
          </p>
        </div>
      )}

      <p className="text-sm text-gray-400">
        Sie können dieses Fenster jetzt schließen.
      </p>
    </main>
  );
}
