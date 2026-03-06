"use client";

import { useActionState } from "react";
import { submitProfile } from "./actions";

type State = { error?: string } | null;

export function ProfileForm({
  initial,
  participantId,
}: {
  initial?: { age?: number; gender?: string; diagnosis?: string };
  participantId: string;
}) {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    submitProfile,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden participantId so the action can use it if needed */}
      <input type="hidden" name="participantId" value={participantId} />

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
          Alter <span className="text-red-500">*</span>
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min={0}
          max={120}
          required
          defaultValue={initial?.age}
          placeholder="z.B. 65"
          className="block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          Geschlecht <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          required
          defaultValue={initial?.gender ?? ""}
          className="block w-48 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>Bitte wählen</option>
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
          <option value="divers">Divers</option>
          <option value="keine Angabe">Keine Angabe</option>
        </select>
      </div>

      <div>
        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
          Hauptdiagnose <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="diagnosis"
          name="diagnosis"
          type="text"
          defaultValue={initial?.diagnosis}
          placeholder="z.B. Schlaganfall, Multiple Sklerose"
          className="block w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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
          {isPending ? "..." : "Weiter"}
        </button>
      </div>
    </form>
  );
}
