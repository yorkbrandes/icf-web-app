"use client";

import { useActionState } from "react";
import { submitConsent } from "./actions";
import { ProgressBar } from "@/components/wizard/ProgressBar";

type State = { error?: string } | null;

export default function ConsentPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    submitConsent,
    null
  );

  return (
    <>
      <ProgressBar currentStep={1} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Einwilligung & Datenschutz</h1>

        {/* Privacy Policy */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Datenschutzerklärung</h2>
          <div className="text-sm text-gray-700 space-y-2 max-h-48 overflow-y-auto pr-2">
            <p><strong>Erhobene Daten:</strong> Anonyme Teilnehmer-ID, Alter, Geschlecht, Hauptdiagnose (optional), ICF-Qualifikatoren, Therapieziele, Hilfsmittel-Wünsche und Unterschrift. Kein Name, keine Adresse, kein Geburtsdatum.</p>
            <p><strong>Zweck:</strong> Ausschließlich ICF-konforme Dokumentation durch Ihren Therapeuten. Keine Weitergabe an Dritte.</p>
            <p><strong>Speicherdauer:</strong> Automatische Löschung nach spätestens 365 Tagen.</p>
            <p><strong>Ihre Rechte:</strong> Auskunft, Berichtigung, Löschung – wenden Sie sich an Ihren Therapeuten.</p>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Nutzungsbedingungen</h2>
          <div className="text-sm text-gray-700 space-y-2 max-h-48 overflow-y-auto pr-2">
            <p>Dieser Fragebogen dient der strukturierten Erfassung Ihrer funktionellen Situation gemäß ICF (WHO). Die Nutzung erfolgt nur über den personalisierten Link Ihres Therapeuten. Die Ergebnisse ersetzen keinen ärztlichen Rat.</p>
            <p>Sie verpflichten sich, die Fragen nach bestem Wissen zu beantworten.</p>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Ich stimme der Datenschutzerklärung und den Nutzungsbedingungen zu.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="age_confirm"
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Ich bin volljährig oder habe einen Erziehungsberechtigten informiert.
            </span>
          </label>

          {state?.error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              {isPending ? "..." : "Weiter"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
