"use client";

import { useActionState, useState } from "react";
import { submitSignature } from "./actions";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { SignatureCanvas } from "@/components/wizard/SignatureCanvas";

type State = { error?: string } | null;

export default function SignaturePage() {
  const [signature, setSignature] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<State, FormData>(
    submitSignature,
    null
  );

  return (
    <>
      <ProgressBar currentStep={8} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unterschrift</h1>
        <p className="text-sm text-gray-500 mb-6">
          Mit Ihrer Unterschrift bestätigen Sie, dass die gemachten Angaben der Wahrheit entsprechen.
          Bitte unterschreiben Sie im Feld unten (mit Maus oder Finger).
        </p>

        <form
          action={(formData) => {
            if (!signature) return;
            formData.set("signature", signature);
            formAction(formData);
          }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <SignatureCanvas onSignatureChange={setSignature} />
          </div>

          {!signature && (
            <p className="text-sm text-amber-600">
              Bitte unterschreiben Sie im Feld oben.
            </p>
          )}

          {state?.error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending || !signature}
              className="rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Wird gespeichert..." : "Jetzt verbindlich absenden"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
