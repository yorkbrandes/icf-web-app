"use client";

import { useActionState } from "react";
import { createAid } from "./actions";

const CATEGORIES = [
  "Mobilität", "Bad & Sanitär", "Sicherheit", "Pflege",
  "Alltagshilfe", "Kommunikation", "Sonstiges",
];

type State = { error?: string } | null;

export function CreateAidForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    createAid,
    null
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          name="name"
          type="text"
          required
          placeholder="z.B. Rollator"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
        <select
          name="category"
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Bitte wählen</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
        <input
          name="description"
          type="text"
          placeholder="Kurzbeschreibung (optional)"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {isPending ? "..." : "Anlegen"}
        </button>
      </div>
      {state?.error && (
        <p className="sm:col-span-4 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
