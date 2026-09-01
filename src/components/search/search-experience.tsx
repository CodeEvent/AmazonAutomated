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

type HeroTabKey = "hotels" | "homesApts";
const HERO_TABS: Array<{ key: HeroTabKey; label: string } | { key: string; label: string; comingSoon: true }> = [
  { key: "hotels", label: "Hotels" },
  { key: "homesApts", label: "Homes & Apts" },
  { key: "longStays", label: "Long stays", comingSoon: true },
  { key: "airportTransfer", label: "Airport transfer", comingSoon: true },
];

export function SearchExperience({
  destinations,
  defaultDestination,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
  defaultEntirePlaceOnly = false,
  variant = "compact",
}: {
  destinations: TrendingDestination[];
  defaultDestination?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests: GuestCounts;
  defaultEntirePlaceOnly?: boolean;
  variant?: "compact" | "hero";
}) {
  const router = useRouter();

  const [destination, setDestination] = useState(defaultDestination ?? "");
  const [dateRange, setDateRange] = useState<CalendarValue>({
    checkIn: defaultCheckIn ? new Date(defaultCheckIn) : null,
    checkOut: defaultCheckOut ? new Date(defaultCheckOut) : null,
  });
  const [guests, setGuests] = useState<GuestCounts>(defaultGuests);
  const [entirePlaceOnly, setEntirePlaceOnly] = useState(defaultEntirePlaceOnly);
  const [heroTab, setHeroTab] = useState<HeroTabKey>(defaultEntirePlaceOnly ? "homesApts" : "hotels");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileStep, setMobileStep] = useState<Step>("where");
  const [desktopStep, setDesktopStep] = useState<Step | null>(null);

  function selectHeroTab(tab: HeroTabKey) {
    setHeroTab(tab);
    setEntirePlaceOnly(tab === "homesApts");
  }

  const dateLabel = useMemo(() => {
    if (dateRange.checkIn && dateRange.checkOut) {
      return `${format(dateRange.checkIn, "MMM d")} – ${format(dateRange.checkOut, "MMM d")}`;
    }
    if (dateRange.checkIn) return `${format(dateRange.checkIn, "MMM d")} – Add checkout`;
    return "Add dates";
  }, [dateRange]);

  const guestLabel = useMemo(() => guestsSummaryLabel(guests), [guests]);
  const checkInLabel = dateRange.checkIn ? format(dateRange.checkIn, "EEE, MMM d") : "Add date";
  const checkOutLabel = dateRange.checkOut ? format(dateRange.checkOut, "EEE, MMM d") : "Add date";

  function goToSearch() {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (dateRange.checkIn) params.set("checkIn", format(dateRange.checkIn, "yyyy-MM-dd"));
    if (dateRange.checkOut) params.set("checkOut", format(dateRange.checkOut, "yyyy-MM-dd"));
    for (const [key, value] of Object.entries(guestsToSearchParams(guests))) {
      params.set(key, value);
    }
    if (entirePlaceOnly) params.set("entirePlace", "1");
    setMobileOpen(false);
    setDesktopStep(null);
    router.push(`/search?${params.toString()}`);
  }

  function clearAll() {
    setDestination("");
    setDateRange({ checkIn: null, checkOut: null });
    setGuests({ adults: 1, children: 0, infants: 0, pets: 0 });
    setEntirePlaceOnly(false);
    setHeroTab("hotels");
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

  return (
    <>
      {/* Mobile: always-expanded search card, each row opens the full-screen flow at that step */}
      <div className="rounded-2xl border border-hairline bg-canvas p-4 shadow-card md:hidden">
        {variant === "hero" ? (
          <HeroTabsRow activeTab={heroTab} onSelect={selectHeroTab} className="mb-3" />
        ) : null}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            setMobileStep("where");
          }}
          className="flex h-14 w-full items-center gap-3 rounded-xl border-2 border-hairline px-4 text-left"
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <span className="truncate text-base text-ink">
            {destination || <span className="text-muted">Where would you like to go?</span>}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            setMobileStep("when");
          }}
          className="mt-3 flex w-full items-stretch rounded-xl border border-hairline text-left"
        >
          <span className="flex flex-1 items-center gap-2.5 px-4 py-3">
            <CalendarIcon className="h-5 w-5 shrink-0 text-muted" />
            <span>
              <span className="block text-xs text-muted">Check-in</span>
              <span className="block text-base font-semibold text-ink">{checkInLabel}</span>
            </span>
          </span>
          <span className="w-px shrink-0 bg-hairline" />
          <span className="flex flex-1 items-center gap-2.5 px-4 py-3">
            <CalendarIcon className="h-5 w-5 shrink-0 text-muted" />
            <span>
              <span className="block text-xs text-muted">Check-out</span>
              <span className="block text-base font-semibold text-ink">{checkOutLabel}</span>
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            setMobileStep("who");
          }}
          className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-hairline px-4 py-3 text-left"
        >
          <PersonIcon className="h-5 w-5 shrink-0 text-muted" />
          <span className="text-base text-ink">
            <span className="font-semibold text-brand">1</span> Room,{" "}
            <span className="font-semibold text-brand">{guests.adults}</span> Adult
            {guests.adults === 1 ? "" : "s"}, <span className="font-semibold text-brand">{guests.children}</span>{" "}
            Children
          </span>
        </button>

        {variant === "hero" ? (
          <label className="mt-4 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={entirePlaceOnly}
              onChange={(e) => setEntirePlaceOnly(e.target.checked)}
              className="h-4 w-4 rounded-sm border-hairline accent-primary"
            />
            Show me only entire homes and apartments
          </label>
        ) : null}

        <button
          type="button"
          onClick={goToSearch}
          className="mt-4 w-full rounded-xl bg-primary py-4 text-base font-bold uppercase tracking-wide text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
        >
          Search
        </button>
      </div>

      {/* Desktop: compact variant is an inline pill with per-segment popovers;
          hero variant is a stacked card matching the Booking.com-style reference. */}
      <div className="relative mx-auto hidden w-full max-w-3xl md:block">
        {variant === "hero" ? (
          <div className="rounded-2xl bg-canvas p-6 shadow-card">
            <HeroTabsRow activeTab={heroTab} onSelect={selectHeroTab} className="mb-5" />

            <button
              type="button"
              onClick={() => setDesktopStep(desktopStep === "where" ? null : "where")}
              className={clsx(
                "flex h-14 w-full items-center gap-3 rounded-lg border-2 px-4 text-left transition-colors",
                desktopStep === "where" ? "border-ink" : "border-hairline hover:border-ink",
              )}
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
              <span className="truncate text-base text-ink">
                {destination || <span className="text-muted">Search destinations</span>}
              </span>
            </button>

            <div className="mt-3 flex items-stretch rounded-lg border border-hairline">
              <button
                type="button"
                onClick={() => setDesktopStep(desktopStep === "when" ? null : "when")}
                className="flex flex-1 items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-soft"
              >
                <CalendarIcon className="h-5 w-5 shrink-0 text-muted" />
                <span>
                  <span className="block text-xs text-muted">Check-in</span>
                  <span className="block text-sm font-semibold text-ink">{checkInLabel}</span>
                </span>
              </button>
              <span className="w-px shrink-0 bg-hairline" />
              <button
                type="button"
                onClick={() => setDesktopStep(desktopStep === "when" ? null : "when")}
                className="flex flex-1 items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-soft"
              >
                <CalendarIcon className="h-5 w-5 shrink-0 text-muted" />
                <span>
                  <span className="block text-xs text-muted">Check-out</span>
                  <span className="block text-sm font-semibold text-ink">{checkOutLabel}</span>
                </span>
              </button>
              <span className="w-px shrink-0 bg-hairline" />
              <button
                type="button"
                onClick={() => setDesktopStep(desktopStep === "who" ? null : "who")}
                className="flex flex-1 items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-soft"
              >
                <PersonIcon className="h-5 w-5 shrink-0 text-muted" />
                <span>
                  <span className="block text-xs text-muted">Guests</span>
                  <span className="block truncate text-sm font-semibold text-ink">
                    {guests.adults > 1 || guests.children || guests.infants || guests.pets
                      ? guestLabel
                      : "Add guests"}
                  </span>
                </span>
              </button>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={entirePlaceOnly}
                onChange={(e) => setEntirePlaceOnly(e.target.checked)}
                className="h-4 w-4 rounded-sm border-hairline accent-primary"
              />
              Show me only entire homes and apartments
            </label>

            <button
              type="button"
              onClick={goToSearch}
              className="mt-5 w-full rounded-full bg-primary py-4 text-base font-bold uppercase tracking-wide text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
            >
              Search
            </button>
          </div>
        ) : (
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
              value={
                guests.adults > 1 || guests.children || guests.infants || guests.pets ? guestLabel : "Add guests"
              }
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
        )}

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

function HeroTabsRow({
  activeTab,
  onSelect,
  className,
}: {
  activeTab: HeroTabKey;
  onSelect: (tab: HeroTabKey) => void;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-6 border-b border-hairline-soft", className)}>
      {HERO_TABS.map((tab) =>
        "comingSoon" in tab ? (
          <span
            key={tab.key}
            title="Coming soon"
            className="flex items-center gap-1 pb-3 text-sm font-semibold text-muted-soft"
          >
            {tab.label}
            <span className="rounded-full border border-hairline px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-muted">
              New
            </span>
          </span>
        ) : (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            className={clsx(
              "border-b-2 pb-3 text-sm font-semibold transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ),
      )}
    </div>
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
