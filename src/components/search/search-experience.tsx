"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { clsx } from "clsx";
import { Calendar, type CalendarValue } from "@/components/search/calendar";
import { GuestStepper } from "@/components/search/guest-stepper";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { guestsSummaryLabel, guestsToSearchParams, type GuestCounts } from "@/lib/guests";
import type { TrendingDestination } from "@/lib/trending-destinations";

type Step = "where" | "when" | "who";
const STEPS: Step[] = ["where", "when", "who"];

export function SearchExperience({
  destinations,
  defaultDestination,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
}: {
  destinations: TrendingDestination[];
  defaultDestination?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests: GuestCounts;
}) {
  const router = useRouter();

  const [destination, setDestination] = useState(defaultDestination ?? "");
  const [dateRange, setDateRange] = useState<CalendarValue>({
    checkIn: defaultCheckIn ? new Date(defaultCheckIn) : null,
    checkOut: defaultCheckOut ? new Date(defaultCheckOut) : null,
  });
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileStep, setMobileStep] = useState<Step>("where");
  const [desktopStep, setDesktopStep] = useState<Step | null>(null);

  const dateLabel = useMemo(() => {
    if (dateRange.checkIn && dateRange.checkOut) {
      return `${format(dateRange.checkIn, "MMM d")} – ${format(dateRange.checkOut, "MMM d")}`;
    }
    if (dateRange.checkIn) return `${format(dateRange.checkIn, "MMM d")} – Add checkout`;
    return "Add dates";
  }, [dateRange]);

  const guestLabel = useMemo(() => guestsSummaryLabel(guests), [guests]);

  function goToSearch() {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (dateRange.checkIn) params.set("checkIn", format(dateRange.checkIn, "yyyy-MM-dd"));
    if (dateRange.checkOut) params.set("checkOut", format(dateRange.checkOut, "yyyy-MM-dd"));
    for (const [key, value] of Object.entries(guestsToSearchParams(guests))) {
      params.set(key, value);
    }
    setMobileOpen(false);
    setDesktopStep(null);
    router.push(`/search?${params.toString()}`);
  }

  function clearAll() {
    setDestination("");
    setDateRange({ checkIn: null, checkOut: null });
    setGuests({ adults: 1, children: 0, infants: 0, pets: 0 });
  }

  function handleMobileDestinationPick(city: string) {
    setDestination(city);
    setMobileStep("when");
  }

  function handleDesktopDestinationPick(city: string) {
    setDestination(city);
    setDesktopStep("when");
  }

  function handleMobileDateChange(next: CalendarValue) {
    setDateRange(next);
    if (next.checkIn && next.checkOut) {
      setMobileStep("who");
    }
  }

  function handleDesktopDateChange(next: CalendarValue) {
    setDateRange(next);
    if (next.checkIn && next.checkOut) {
      setDesktopStep("who");
    }
  }

  const summary = [destination || null, dateRange.checkIn ? dateLabel : null].filter(Boolean).join(" · ");

  return (
    <>
      {/* Mobile: collapsed trigger pill, opens full-screen flow */}
      <button
        type="button"
        onClick={() => {
          setMobileOpen(true);
          setMobileStep("where");
        }}
        className="flex w-full items-center gap-3 rounded-full border border-hairline bg-canvas px-6 py-4 text-left shadow-card md:hidden"
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-ink" />
        <span className="truncate text-sm text-ink">{summary || "Start your search"}</span>
      </button>

      {/* Desktop: inline pill with per-segment popovers */}
      <div className="relative mx-auto hidden w-full max-w-3xl md:block">
        <div className="flex items-center rounded-full border border-hairline bg-canvas shadow-card">
          <DesktopSegment
            label="Where"
            value={destination || "Search destinations"}
            active={desktopStep === "where"}
            onClick={() => setDesktopStep(desktopStep === "where" ? null : "where")}
            className="flex-1 border-r border-hairline"
          />
          <DesktopSegment
            label="When"
            value={dateLabel}
            active={desktopStep === "when"}
            onClick={() => setDesktopStep(desktopStep === "when" ? null : "when")}
            className="flex-1 border-r border-hairline"
          />
          <DesktopSegment
            label="Who"
            value={guests.adults > 1 || guests.children || guests.infants || guests.pets ? guestLabel : "Add guests"}
            active={desktopStep === "who"}
            onClick={() => setDesktopStep(desktopStep === "who" ? null : "who")}
            className="flex-1"
          />
          <div className="relative z-50 pr-2">
            <MagneticButton
              type="button"
              onClick={goToSearch}
              aria-label="Search"
              range={40}
              strength={0.3}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-active"
            >
              <SearchIcon className="h-5 w-5" />
            </MagneticButton>
          </div>
        </div>

        {desktopStep ? (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setDesktopStep(null)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div
              className={clsx(
                "absolute top-full z-50 mt-3 rounded-md border border-hairline bg-canvas p-6 shadow-card",
                desktopStep === "where" && "left-0 w-96",
                desktopStep === "when" && "left-1/2 w-[640px] -translate-x-1/2",
                desktopStep === "who" && "right-0 w-96",
              )}
            >
              {desktopStep === "where" ? (
                <DestinationList
                  destinations={destinations}
                  query={destination}
                  onPick={handleDesktopDestinationPick}
                />
              ) : null}
              {desktopStep === "when" ? (
                <Calendar months={2} value={dateRange} onChange={handleDesktopDateChange} />
              ) : null}
              {desktopStep === "who" ? <GuestStepper value={guests} onChange={setGuests} /> : null}
            </div>
          </>
        ) : null}
      </div>

      {/* Mobile: full-screen search flow */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-4">
            <p className="text-base font-semibold text-ink">Search</p>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {STEPS.map((step) => (
              <MobileAccordionStep
                key={step}
                step={step}
                active={mobileStep === step}
                onOpen={() => setMobileStep(step)}
                summary={
                  step === "where"
                    ? destination || "Where to?"
                    : step === "when"
                      ? dateLabel
                      : guestLabel
                }
              >
                {step === "where" ? (
                  <DestinationList
                    destinations={destinations}
                    query={destination}
                    onPick={handleMobileDestinationPick}
                  />
                ) : null}
                {step === "when" ? <Calendar value={dateRange} onChange={handleMobileDateChange} /> : null}
                {step === "who" ? <GuestStepper value={guests} onChange={setGuests} /> : null}
              </MobileAccordionStep>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-hairline px-4 py-4">
            <button type="button" onClick={clearAll} className="text-sm font-semibold text-ink underline">
              Clear all
            </button>
            <button
              type="button"
              onClick={goToSearch}
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-on-primary transition-transform duration-150 active:scale-[0.98]"
            >
              Search
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DesktopSegment({
  label,
  value,
  active,
  onClick,
  className,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "relative z-50 rounded-full px-6 py-3 text-left transition-colors",
        active ? "bg-surface-strong" : "hover:bg-surface-soft",
        className,
      )}
    >
      <span className="block text-xs font-semibold text-ink">{label}</span>
      <span className="block truncate text-sm text-muted">{value}</span>
    </button>
  );
}

function MobileAccordionStep({
  step,
  active,
  onOpen,
  summary,
  children,
}: {
  step: Step;
  active: boolean;
  onOpen: () => void;
  summary: string;
  children: ReactNode;
}) {
  const titles: Record<Step, string> = { where: "Where", when: "When", who: "Who" };

  return (
    <div className="border-b border-hairline-soft py-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between text-left"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
            {titles[step]}
          </span>
          <span className="block text-base text-ink">{summary}</span>
        </span>
        <ChevronDownIcon className={clsx("transition-transform", active && "rotate-180")} />
      </button>
      {active ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function DestinationList({
  destinations,
  query,
  onPick,
}: {
  destinations: TrendingDestination[];
  query: string;
  onPick: (city: string) => void;
}) {
  const [input, setInput] = useState(query);
  const filtered = input
    ? destinations.filter(
        (d) =>
          d.city.toLowerCase().includes(input.toLowerCase()) ||
          d.country.toLowerCase().includes(input.toLowerCase()),
      )
    : destinations;

  return (
    <div>
      <label className="mb-4 block">
        <span className="sr-only">Search destinations</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search destinations"
          className="h-12 w-full rounded-sm border border-hairline px-4 text-sm text-ink focus:border-2 focus:border-ink focus:outline-none"
        />
      </label>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Suggested destinations
      </p>
      <ul className="space-y-1">
        {filtered.length === 0 ? (
          <li className="py-2 text-sm text-muted">No matching destinations.</li>
        ) : (
          filtered.map((d) => (
            <li key={`${d.city}-${d.country}`}>
              <button
                type="button"
                onClick={() => onPick(d.city)}
                className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left hover:bg-surface-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-surface-strong">
                  <PinIcon />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {d.city}, {d.country}
                  </span>
                  <span className="block text-xs text-muted">
                    {d.count} stay{d.count === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={3}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={clsx("h-4 w-4 shrink-0 text-muted", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 text-ink" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
