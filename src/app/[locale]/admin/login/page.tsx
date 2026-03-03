"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { validateAdminLogin } from "./actions";

type LoginState = { error?: string } | null;

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    validateAdminLogin,
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          </div>

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {t("username")}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t("password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {state?.error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "..." : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
