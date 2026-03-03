"use client";

import { useState } from "react";
import { toggleAid, deleteAid, updateAid } from "./actions";

const CATEGORIES = [
  "Mobilität", "Bad & Sanitär", "Sicherheit", "Pflege",
  "Alltagshilfe", "Kommunikation", "Sonstiges",
];

type AidItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isActive: boolean;
  _count: { selections: number };
};

export function AidRow({ item }: { item: AidItem }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function handleToggle() {
    await toggleAid(item.id);
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    const result = await deleteAid(item.id);
    if (result.error) { setDeleteError(result.error); setConfirmDelete(false); }
  }

  async function handleEdit(formData: FormData) {
    formData.set("id", item.id);
    // Call updateAid via useActionState pattern would be cleaner,
    // but for inline editing we use a direct call
    const result = await updateAid(null, formData);
    if (result?.error) { setEditError(result.error); }
    else { setEditing(false); setEditError(null); }
  }

  if (editing) {
    return (
      <tr className="bg-blue-50">
        <td colSpan={5} className="px-6 py-3">
          <form action={handleEdit} className="flex gap-3 items-end flex-wrap">
            <input type="hidden" name="id" value={item.id} />
            <div>
              <label className="block text-xs text-gray-600 mb-1">Name</label>
              <input name="name" defaultValue={item.name} required
                className="rounded border border-gray-300 px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Kategorie</label>
              <select name="category" defaultValue={item.category} required
                className="rounded border border-gray-300 px-2 py-1 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Beschreibung</label>
              <input name="description" defaultValue={item.description ?? ""}
                className="rounded border border-gray-300 px-2 py-1 text-sm w-48" />
            </div>
            <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Speichern</button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-gray-500">Abbrechen</button>
            {editError && <span className="text-red-600 text-xs">{editError}</span>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className={item.isActive ? "" : "bg-gray-50 opacity-60"}>
      <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.name}</td>
      <td className="px-6 py-3 text-sm text-gray-500">
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs">{item.category}</span>
      </td>
      <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description ?? "–"}</td>
      <td className="px-6 py-3">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {item.isActive ? "Aktiv" : "Inaktiv"}
        </span>
      </td>
      <td className="px-6 py-3 text-sm text-gray-500">{item._count.selections}</td>
      <td className="px-6 py-3 text-right text-sm space-x-3 whitespace-nowrap">
        <button onClick={() => setEditing(true)} className="text-blue-600 hover:text-blue-800">Bearbeiten</button>
        <button onClick={handleToggle} className="text-gray-600 hover:text-gray-900">
          {item.isActive ? "Deaktivieren" : "Reaktivieren"}
        </button>
        {!item.isActive && (
          <>
            <button
              onClick={handleDelete}
              className={confirmDelete ? "text-red-700 font-semibold" : "text-red-500 hover:text-red-700"}
            >
              {confirmDelete ? "Wirklich löschen?" : "Löschen"}
            </button>
            {confirmDelete && (
              <button onClick={() => setConfirmDelete(false)} className="text-gray-500">Abbrechen</button>
            )}
          </>
        )}
        {deleteError && <span className="text-red-600 text-xs block mt-1">{deleteError}</span>}
      </td>
    </tr>
  );
}
