"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";

export function PropertyCardGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string;
}) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  function go(next: number, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((next + images.length) % images.length);
  }

  return (
    <div className="group/gallery relative aspect-square overflow-hidden rounded-md bg-surface-soft">
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
      >
        {images.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0">
            <Image
              src={src}
              alt={`${alt} photo ${i + 1}`}
              fill
              sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </motion.div>

      {badge ? (
        <span className="absolute left-3 top-3 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink shadow-card">
          {badge}
        </span>
      ) : null}

      {hasMultiple ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(event) => go(index - 1, event)}
            className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/90 text-ink opacity-0 shadow-card transition-opacity group-hover/gallery:opacity-100"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(event) => go(index + 1, event)}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/90 text-ink opacity-0 shadow-card transition-opacity group-hover/gallery:opacity-100"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={(event) => go(i, event)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-3 bg-canvas" : "w-1.5 bg-canvas/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
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
