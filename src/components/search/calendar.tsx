"use client";

import { useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { clsx } from "clsx";
import type { DateRange } from "@/lib/availability";

export type CalendarValue = { checkIn: Date | null; checkOut: Date | null };

export function Calendar({
  value,
  onChange,
  disabledRanges = [],
  months = 1,
  minDate,
}: {
  value: CalendarValue;
  onChange: (value: CalendarValue) => void;
  disabledRanges?: DateRange[];
  months?: 1 | 2;
  minDate?: Date;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value.checkIn ?? new Date()));
  const floor = startOfDay(minDate ?? new Date());

  function isBlocked(day: Date): boolean {
    return disabledRanges.some(
      (range) => day >= startOfDay(range.checkIn) && day < startOfDay(range.checkOut),
    );
  }

  function isDisabled(day: Date): boolean {
    return isBefore(day, floor) || isBlocked(day);
  }

  function hasBlockedBetween(start: Date, end: Date): boolean {
    let cursor = addDays(start, 1);
    while (isBefore(cursor, end)) {
      if (isBlocked(cursor)) return true;
      cursor = addDays(cursor, 1);
    }
    return false;
  }

  function handleDayClick(day: Date) {
    if (isDisabled(day)) return;

    const { checkIn, checkOut } = value;
    if (!checkIn || checkOut) {
      onChange({ checkIn: day, checkOut: null });
      return;
    }

    if (!isAfter(day, checkIn)) {
      onChange({ checkIn: day, checkOut: null });
      return;
    }

    if (hasBlockedBetween(checkIn, day)) {
      onChange({ checkIn: day, checkOut: null });
      return;
    }

    onChange({ checkIn, checkOut: day });
  }

  const monthOffsets = months === 2 ? [0, 1] : [0];

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={isSameMonth(viewMonth, floor) || isBefore(viewMonth, floor)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink disabled:opacity-30"
        >
          <ChevronIcon direction="left" />
        </button>
        {months === 1 ? (
          <p className="text-base font-semibold text-ink">{format(viewMonth, "MMMM yyyy")}</p>
        ) : null}
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className={clsx("grid gap-6", months === 2 && "grid-cols-1 sm:grid-cols-2")}>
        {monthOffsets.map((offset) => (
          <MonthGrid
            key={offset}
            month={addMonths(viewMonth, offset)}
            showHeader={months === 2}
            value={value}
            isDisabled={isDisabled}
            onDayClick={handleDayClick}
          />
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  showHeader,
  value,
  isDisabled,
  onDayClick,
}: {
  month: Date;
  showHeader: boolean;
  value: CalendarValue;
  isDisabled: (day: Date) => boolean;
  onDayClick: (day: Date) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div>
      {showHeader ? (
        <p className="mb-2 text-center text-sm font-semibold text-ink">{format(month, "MMMM yyyy")}</p>
      ) : null}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => (
          <span key={i} className="text-xs font-medium text-muted">
            {label}
          </span>
        ))}

        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const disabled = isDisabled(day);
          const isStart = value.checkIn ? isSameDay(day, value.checkIn) : false;
          const isEnd = value.checkOut ? isSameDay(day, value.checkOut) : false;
          const inRange =
            value.checkIn && value.checkOut
              ? isAfter(day, value.checkIn) && isBefore(day, value.checkOut)
              : false;

          return (
            <div key={day.toISOString()} className="relative py-0.5">
              {inRange || (isStart && value.checkOut) || (isEnd && value.checkIn) ? (
                <span
                  className="absolute inset-y-0.5 bg-surface-soft"
                  style={{
                    left: isStart ? "50%" : 0,
                    right: isEnd ? "50%" : 0,
                  }}
                  aria-hidden
                />
              ) : null}
              <button
                type="button"
                disabled={disabled || !inMonth}
                onClick={() => onDayClick(day)}
                className={clsx(
                  "relative z-10 mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm",
                  !inMonth && "invisible",
                  disabled && inMonth && "cursor-not-allowed text-muted-soft line-through",
                  !disabled && inMonth && !isStart && !isEnd && "text-ink hover:bg-surface-soft",
                  (isStart || isEnd) && "bg-ink font-semibold text-on-dark",
                )}
              >
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}
