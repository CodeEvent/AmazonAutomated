"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function PhotoGrid({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Mobile: full-bleed swipeable carousel, matching the real app's hero. */}
      <div className="-mx-4 mt-4 sm:hidden">
        <MobileCarousel images={images} alt={alt} onShowAll={() => setOpen(true)} />
      </div>

      {/* Desktop: bento photo grid with a "Show all photos" overlay button. */}
      <div className="relative mt-6 hidden overflow-hidden rounded-xl sm:block">
        <Layout images={images} alt={alt} />

        {images.length > 1 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-ink/80 bg-canvas px-3 py-1.5 text-xs font-semibold text-ink shadow-card hover:bg-surface-soft"
          >
            <GridIcon />
            Show all photos
          </button>
        ) : null}
      </div>

      {open ? <Lightbox images={images} alt={alt} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function MobileCarousel({
  images,
  alt,
  onShowAll,
}: {
  images: string[];
  alt: string;
  onShowAll: () => void;
}) {
  const [index, setIndex] = useState(0);

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  };

  return (
    <div className="relative">
      <div
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={src} className="relative aspect-[4/3] w-full shrink-0 snap-start bg-surface-soft">
            <Image
              src={src}
              alt={`${alt} photo ${i + 1}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <button
          type="button"
          onClick={onShowAll}
          className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-canvas"
        >
          {index + 1} / {images.length}
        </button>
      ) : null}
    </div>
  );
}

function Layout({ images, alt }: { images: string[]; alt: string }) {
  const cell = (src: string, index: number, className: string, priority = false) => (
    <div key={src} className={`relative bg-surface-soft ${className}`}>
      <Image
        src={src}
        alt={`${alt} photo ${index + 1}`}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
        priority={priority}
      />
    </div>
  );

  if (images.length === 1) {
    return (
      <div className="grid grid-cols-1">
        {cell(images[0], 0, "aspect-[16/9]", true)}
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {images.map((src, i) => cell(src, i, "aspect-[4/3]", i === 0))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {cell(images[0], 0, "row-span-2 aspect-[3/4]", true)}
        {cell(images[1], 1, "aspect-[16/9.5]")}
        {cell(images[2], 2, "aspect-[16/9.5]")}
      </div>
    );
  }

  if (images.length === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {images.map((src, i) => cell(src, i, "aspect-[4/3]", i === 0))}
      </div>
    );
  }

  const [hero, ...rest] = images;
  const tiles = rest.slice(0, 4);

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2">
      <div className="relative col-span-2 row-span-2 bg-surface-soft">
        <Image
          src={hero}
          alt={`${alt} photo 1`}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {tiles.map((src, i) => cell(src, i + 1, "aspect-square"))}
    </div>
  );
}

function Lightbox({
  images,
  alt,
  onClose,
}: {
  images: string[];
  alt: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-canvas">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline-soft bg-canvas px-4 py-4 sm:px-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo gallery"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft"
        >
          <CloseIcon />
        </button>
        <p className="text-sm font-medium text-ink">
          {images.length} photo{images.length === 1 ? "" : "s"}
        </p>
        <div className="w-9" />
      </div>

      <div className="mx-auto max-w-[900px] space-y-3 px-4 py-6 sm:px-8">
        {images.map((src, i) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-soft">
            <Image
              src={src}
              alt={`${alt} photo ${i + 1}`}
              fill
              sizes="(min-width: 900px) 900px, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-ink stroke-[1.5]">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-ink stroke-2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
