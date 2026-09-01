import { format } from "date-fns";
import type { CalendarDay } from "@/lib/admin-calendar";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function AvailabilityMonthGrid({
  monthLabel,
  days,
  leadingOffset,
}: {
  monthLabel: string;
  days: CalendarDay[];
  leadingOffset: number;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-4">
      <h3 className="text-sm font-semibold text-ink">{monthLabel}</h3>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: leadingOffset }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            title={
              day.isBlocked
                ? "Blocked"
                : day.remaining <= 0
                  ? "Fully booked"
                  : `${day.remaining} of ${day.quantity} available`
            }
            className={`flex aspect-square items-center justify-center rounded-sm text-xs ${
              day.isBlocked
                ? "bg-ink/10 font-semibold text-ink"
                : day.remaining <= 0
                  ? "bg-primary-disabled text-primary-error-text"
                  : "bg-surface-soft text-ink"
            }`}
          >
            {format(day.date, "d")}
          </div>
        ))}
      </div>
    </div>
  );
}
