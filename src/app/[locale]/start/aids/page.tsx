"use client";

import { useActionState } from "react";
import { submitAids } from "./actions";
import { ProgressBar } from "@/components/wizard/ProgressBar";

type State = { error?: string } | null;

export default function AidsPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    submitAids,
    null
  );

  return (
    <>
      <ProgressBar currentStep={6} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hilfsmittel-Wünsche</h1>
        <p className="text-sm text-gray-500 mb-6">
          Beschreiben Sie in Ihren eigenen Worten, was Ihnen im Alltag fehlt oder was Ihnen helfen würde.
          Alle Felder sind optional.
        </p>

        <form action={formAction} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <div>
              <label htmlFor="aidWishMissing" className="block text-sm font-medium text-gray-700 mb-1">
                Was fehlt Ihnen im Alltag?
              </label>
              <textarea
                id="aidWishMissing"
                name="aidWishMissing"
                rows={3}
                placeholder="z.B. Ich kann die Treppe nicht mehr alleine steigen..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="aidWishHave" className="block text-sm font-medium text-gray-700 mb-1">
                Welche Hilfsmittel nutzen Sie bereits?
              </label>
              <textarea
                id="aidWishHave"
                name="aidWishHave"
                rows={3}
                placeholder="z.B. Ich benutze bereits einen Gehstock..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="aidWishWant" className="block text-sm font-medium text-gray-700 mb-1">
                Was würde Ihnen helfen?
              </label>
              <textarea
                id="aidWishWant"
                name="aidWishWant"
                rows={3}
                placeholder="z.B. Ein Badewannenlift würde mir sehr helfen..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

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
              {isPending ? "..." : "Weiter zur Zusammenfassung"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
