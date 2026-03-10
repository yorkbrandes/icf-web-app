"use client";

import { useState } from "react";
import { toggleAdmin, deleteAdmin } from "./actions";

type Admin = {
  id: string;
  username: string;
  referralCode: string;
  isActive: boolean;
  createdAt: Date;
  _count: { cases: number };
};

export function AdminRow({
  admin,
  appUrl,
  locale,
}: {
  admin: Admin;
  appUrl: string;
  locale: string;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const affiliateLink = `${appUrl}/${locale}/start?ref=${admin.referralCode}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggle() {
    await toggleAdmin(admin.id);
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const result = await deleteAdmin(admin.id);
    if (result.error) {
      setDeleteError(result.error);
      setConfirmDelete(false);
    }
  }

  return (
    <tr className={admin.isActive ? "" : "bg-gray-50 opacity-60"}>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {admin.username}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <span>{admin.referralCode}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {copied ? "Kopiert!" : "Link kopieren"}
          </button>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{admin._count.cases}</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            admin.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {admin.isActive ? "Aktiv" : "Inaktiv"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(admin.createdAt).toLocaleDateString("de-DE")}
      </td>
      <td className="px-6 py-4 text-right text-sm space-x-3">
        <button
          onClick={handleToggle}
          className="text-gray-600 hover:text-gray-900"
        >
          {admin.isActive ? "Deaktivieren" : "Reaktivieren"}
        </button>
        {!admin.isActive && (
          <>
            <button
              onClick={handleDelete}
              className={`${
                confirmDelete
                  ? "text-red-700 font-semibold"
                  : "text-red-500 hover:text-red-700"
              }`}
            >
              {confirmDelete ? "Wirklich löschen?" : "Löschen"}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Abbrechen
              </button>
            )}
          </>
        )}
        {deleteError && (
          <span className="text-red-600 text-xs">{deleteError}</span>
        )}
      </td>
    </tr>
  );
}
