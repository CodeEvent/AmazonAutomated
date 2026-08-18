import { formatPrice } from "@/lib/format";

export function MobileReserveBar({ pricePerNight }: { pricePerNight: number }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-hairline bg-canvas px-4 py-3 shadow-card lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <p className="text-sm text-ink">
        <span className="text-base font-semibold">{formatPrice(pricePerNight)}</span> night
      </p>
      <a
        href="#reserve"
        className="rounded-sm bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98]"
      >
        Reserve
      </a>
    </div>
  );
}
