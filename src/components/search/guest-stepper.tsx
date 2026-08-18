"use client";

import { clsx } from "clsx";
import type { GuestCounts } from "@/lib/guests";
import { occupancy } from "@/lib/guests";

const ROWS = [
  { key: "adults", label: "Adults", subtitle: "Ages 13 or above", min: 1, ceiling: 16 },
  { key: "children", label: "Children", subtitle: "Ages 2 – 12", min: 0, ceiling: 10 },
  { key: "infants", label: "Infants", subtitle: "Under 2", min: 0, ceiling: 10 },
  { key: "pets", label: "Pets", subtitle: "Service animals are always welcome", min: 0, ceiling: 5 },
] as const;

export function GuestStepper({
  value,
  onChange,
  maxOccupancy,
}: {
  value: GuestCounts;
  onChange: (value: GuestCounts) => void;
  maxOccupancy?: number;
}) {
  function update(key: keyof GuestCounts, delta: number) {
    const row = ROWS.find((r) => r.key === key)!;
    const next = value[key] + delta;
    if (next < row.min || next > row.ceiling) return;

    if (maxOccupancy && (key === "adults" || key === "children") && delta > 0) {
      const otherOccupant = key === "adults" ? value.children : value.adults;
      if (next + otherOccupant > maxOccupancy) return;
    }

    onChange({ ...value, [key]: next });
  }

  const atMaxOccupancy = maxOccupancy != null && occupancy(value) >= maxOccupancy;

  return (
    <div className="divide-y divide-hairline-soft">
      {ROWS.map((row) => {
        const count = value[row.key];
        const decrementDisabled = count <= row.min;
        const incrementDisabled =
          count >= row.ceiling || ((row.key === "adults" || row.key === "children") && atMaxOccupancy);

        return (
          <div key={row.key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-base text-ink">{row.label}</p>
              <p className="text-sm text-muted">{row.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => update(row.key, -1)}
                disabled={decrementDisabled}
                aria-label={`Decrease ${row.label}`}
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-lg text-ink",
                  decrementDisabled ? "border-hairline-soft text-muted-soft" : "border-border-strong",
                )}
              >
                −
              </button>
              <span className="w-5 text-center text-base text-ink" aria-live="polite">
                {count}
              </span>
              <button
                type="button"
                onClick={() => update(row.key, 1)}
                disabled={incrementDisabled}
                aria-label={`Increase ${row.label}`}
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-lg text-ink",
                  incrementDisabled ? "border-hairline-soft text-muted-soft" : "border-border-strong",
                )}
              >
                +
              </button>
            </div>
          </div>
        );
      })}

      {maxOccupancy ? (
        <p className="pt-3 text-xs text-muted">This place has a maximum of {maxOccupancy} guests.</p>
      ) : null}
    </div>
  );
}
