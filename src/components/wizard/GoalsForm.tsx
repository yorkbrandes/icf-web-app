"use client";

import { useState } from "react";

type Goal = { description: string; timeframe: "short" | "medium" | "long" };

export function GoalsForm({ initial }: { initial?: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(
    initial && initial.length > 0 ? initial : [{ description: "", timeframe: "short" }]
  );

  function addGoal() {
    if (goals.length >= 5) return;
    setGoals([...goals, { description: "", timeframe: "short" }]);
  }

  function removeGoal(i: number) {
    if (goals.length <= 1) return;
    setGoals(goals.filter((_, idx) => idx !== i));
  }

  function updateGoal(i: number, field: keyof Goal, value: string) {
    setGoals(goals.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)));
  }

  return (
    <div className="space-y-4">
      {goals.map((goal, i) => (
        <div key={i} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ziel {i + 1}
              </label>
              <textarea
                name={`goal_description_${i}`}
                value={goal.description}
                onChange={(e) => updateGoal(i, "description", e.target.value)}
                required
                rows={2}
                placeholder="Beschreiben Sie Ihr Ziel..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zeithorizont
              </label>
              <select
                name={`goal_timeframe_${i}`}
                value={goal.timeframe}
                onChange={(e) => updateGoal(i, "timeframe", e.target.value as Goal["timeframe"])}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="short">Kurzfristig (&lt; 3 Monate)</option>
                <option value="medium">Mittelfristig (3–12 Monate)</option>
                <option value="long">Langfristig (&gt; 12 Monate)</option>
              </select>
            </div>
          </div>
          {goals.length > 1 && (
            <button
              type="button"
              onClick={() => removeGoal(i)}
              className="mt-6 text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Hidden field with goal count for server action */}
      <input type="hidden" name="goal_count" value={goals.length} />

      {goals.length < 5 && (
        <button
          type="button"
          onClick={addGoal}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Weiteres Ziel hinzufügen
        </button>
      )}
    </div>
  );
}
