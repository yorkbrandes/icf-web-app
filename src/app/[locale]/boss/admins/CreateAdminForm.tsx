"use client";

import { useActionState } from "react";
import { createAdmin } from "./actions";

type State = { error?: string } | null;

export function CreateAdminForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    createAdmin,
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-48">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Benutzername
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          placeholder="z.B. dr-mueller"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 min-w-48">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="min. 8 Zeichen"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Anlegen..." : "Admin anlegen"}
      </button>

      {state?.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
