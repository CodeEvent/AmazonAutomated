"use client";

import { useRef } from "react";

export function RailScroller({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.round(track.clientWidth * 0.9) * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="group/rail relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-1/2 hidden -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-hairline bg-white p-2 shadow-md transition-opacity duration-150 hover:scale-105 group-hover/rail:md:flex"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-hairline bg-white p-2 shadow-md transition-opacity duration-150 hover:scale-105 group-hover/rail:md:flex"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-4 w-4 fill-none stroke-ink stroke-2 ${direction === "left" ? "" : "rotate-180"}`}
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
