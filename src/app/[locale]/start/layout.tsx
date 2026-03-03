export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <span className="text-sm font-medium">ICF Dokumentations-Wizard</span>
        </div>
      </header>
      {children}
    </div>
  );
}
