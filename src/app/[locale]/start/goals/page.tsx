"use client";

import { useActionState } from "react";
import { submitGoals } from "./actions";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { GoalsForm } from "@/components/wizard/GoalsForm";

type State = { error?: string } | null;

export default function GoalsPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    submitGoals,
    null
  );

  return (
    <>
      <ProgressBar currentStep={5} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Therapieziele</h1>
        <p className="text-sm text-gray-500 mb-8">
          Was möchten Sie mit therapeutischer Unterstützung erreichen? Bitte geben Sie mindestens ein Ziel an.
        </p>

        <form action={formAction} className="space-y-6">
          <GoalsForm />

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
