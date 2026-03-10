const QUALIFIER_LABELS: Record<number, string> = {
  0: "0 – Kein Problem (0–4%)",
  1: "1 – Leichtes Problem (5–24%)",
  2: "2 – Mäßiges Problem (25–49%)",
  3: "3 – Erhebliches Problem (50–95%)",
  4: "4 – Vollständiges Problem (96–100%)",
  8: "8 – Nicht spezifiziert",
  9: "9 – Nicht anwendbar",
};

export function QualifierSelect({
  name,
  defaultValue = 0,
}: {
  name: string;
  defaultValue?: number;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {[0, 1, 2, 3, 4, 8, 9].map((q) => (
        <option key={q} value={q}>
          {QUALIFIER_LABELS[q]}
        </option>
      ))}
    </select>
  );
}
