"use client";

import { useEffect, useRef } from "react";
import { initWizardSession } from "./actions";

export function StartSession({ locale, referralCode }: { locale: string; referralCode: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form ref={formRef} action={initWizardSession} className="text-center">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="ref" value={referralCode} />
        <p className="text-gray-600 mb-4">Sitzung wird vorbereitet…</p>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Weiter →
        </button>
      </form>
    </div>
  );
}
