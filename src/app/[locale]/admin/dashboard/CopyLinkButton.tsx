"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyLinkButton({ link }: { link: string }) {
  const t = useTranslations("admin.dashboard");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 whitespace-nowrap"
    >
      {copied ? t("linkCopied") : t("copyLink")}
    </button>
  );
}
