"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const HIDDEN_PREFIXES = ["/property/", "/login", "/signup"];

export function MobileTabBar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const items = [
    { href: "/", label: "Explore", icon: ExploreIcon, match: (p: string) => p === "/" || p.startsWith("/search") },
    {
      href: isAuthenticated ? "/account/bookings" : "/login?callbackUrl=/account/bookings",
      label: "Trips",
      icon: TripsIcon,
      match: (p: string) => p.startsWith("/account/bookings") || p.startsWith("/booking/"),
    },
    {
      href: isAuthenticated ? "/account" : "/login?callbackUrl=/account",
      label: "Account",
      icon: AccountIcon,
      match: (p: string) => p === "/account",
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-hairline bg-canvas py-2 md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-1 px-4 py-1 text-[11px] font-medium",
              active ? "text-primary" : "text-muted",
            )}
          >
            <Icon className="h-6 w-6" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ExploreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TripsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 11l18-8-8 18-2-8-8-2z" strokeLinejoin="round" />
    </svg>
  );
}

function AccountIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
