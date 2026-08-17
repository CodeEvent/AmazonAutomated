import Link from "next/link";
import { clsx } from "clsx";
import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";

type HeaderUser = {
  name?: string | null;
  email?: string | null;
} | null;

const NAV_ITEMS = [
  { label: "Stays", href: "/", active: true },
  { label: "Flights", comingSoon: true },
  { label: "Car rentals", comingSoon: true },
] as const;

export function SiteHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="text-xl font-semibold text-primary">
          Wayfarer
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) =>
            "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "text-base font-semibold",
                  item.active ? "text-ink" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="flex items-center gap-1 text-base font-semibold text-muted-soft"
                title="Coming soon"
              >
                {item.label}
                <span className="rounded-full border border-hairline px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-muted">
                  New
                </span>
              </span>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/account/bookings"
                className="hidden text-sm font-medium text-ink sm:block"
              >
                My bookings
              </Link>
              <span className="hidden text-sm text-muted sm:block">
                {user.name ?? user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button href="/login" variant="tertiary" size="sm">
                Log in
              </Button>
              <Button href="/signup" variant="primary" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
