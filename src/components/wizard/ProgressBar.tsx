const STEPS = [
  "Einwilligung",
  "Basisdaten",
  "Körperfunktionen",
  "Umwelt",
  "Ziele",
  "Hilfsmittel",
  "Zusammenfassung",
  "Unterschrift",
];

export function ProgressBar({ currentStep }: { currentStep: number }) {
  // currentStep: 1 = consent … 8 = signature
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">
            Schritt {currentStep} von {STEPS.length}
          </span>
          <span className="text-xs text-gray-500">{STEPS[currentStep - 1]}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
