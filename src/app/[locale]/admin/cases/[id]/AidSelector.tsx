"use client";

import { useState } from "react";
import { saveAidSelections } from "./actions";

type AidItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
};

type ExistingSelection = {
  aidItemId: string;
  note: string | null;
};

type Props = {
  caseId: string;
  aids: AidItem[];
  existing: ExistingSelection[];
};

export function AidSelector({ caseId, aids, existing }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(existing.map((s) => [s.aidItemId, true]))
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(existing.map((s) => [s.aidItemId, s.note ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group aids by category
  const grouped = aids.reduce<Record<string, AidItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  function toggleItem(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  }

  function setNote(id: string, value: string) {
    setNotes((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const selections = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([aidItemId]) => ({ aidItemId, note: notes[aidItemId] ?? "" }));
    const result = await saveAidSelections(caseId, selections);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">{category}</h4>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selected[item.id]}
                    onChange={() => toggleItem(item.id)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-800">
                    {item.name}
                    {item.description && (
                      <span className="text-gray-500 ml-1 font-normal">– {item.description}</span>
                    )}
                  </span>
                </label>
                {selected[item.id] && (
                  <input
                    type="text"
                    placeholder="Notiz (optional)"
                    value={notes[item.id] ?? ""}
                    onChange={(e) => setNote(item.id, e.target.value)}
                    className="ml-6 rounded border border-gray-300 px-2 py-1 text-sm w-72"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? "Speichern..." : "Hilfsmittel speichern"}
        </button>
        {saved && <span className="text-sm text-green-600">Gespeichert</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
