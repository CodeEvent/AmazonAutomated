import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/layout/logout-button";
import { yearsOnPlatformLabel } from "@/lib/member-since";

const SETTINGS_LINKS: Array<{ href: string; label: string }> = [
  { href: "/account/settings", label: "Account settings" },
  { href: "/account/help", label: "Get help" },
  { href: "/account/profile", label: "View profile" },
  { href: "/account/privacy", label: "Privacy" },
  { href: "/account/refer", label: "Refer a host" },
  { href: "/account/co-host", label: "Find a co-host" },
  { href: "/account/gift-cards", label: "Gift cards" },
  { href: "/account/legal", label: "Legal" },
];

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { _count: { select: { bookings: true, reviews: true } } },
  });

  const initial = (user.name ?? user.email).trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-bold text-ink">Profile</h1>

      <div className="mt-6 flex items-center justify-between gap-6 rounded-xl border border-hairline-soft p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ink text-2xl font-semibold text-canvas">
              {initial}
            </div>
            {user.emailVerified ? (
              <span
                aria-label="Verified"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-canvas shadow-card"
              >
                <CheckIcon />
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-lg font-semibold text-ink">{user.name ?? "Traveler"}</p>
          <p className="text-sm text-muted">Guest</p>
        </div>

        <div className="flex-1 divide-y divide-hairline-soft text-right">
          <div className="pb-3">
            <p className="text-xl font-bold text-ink">{user._count.bookings}</p>
            <p className="text-sm text-muted">Trips</p>
          </div>
          <div className="py-3">
            <p className="text-xl font-bold text-ink">{user._count.reviews}</p>
            <p className="text-sm text-muted">Reviews</p>
          </div>
          <div className="pt-3">
            <p className="text-xl font-bold text-ink">{yearsOnPlatformLabel(user.createdAt)}</p>
            <p className="text-sm text-muted">Years on Wayfarer</p>
          </div>
        </div>
      </div>

      <Link
        href="/account/bookings"
        className="mt-6 flex items-center gap-4 rounded-xl border border-hairline-soft p-5 hover:bg-surface-soft"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-soft text-xl">
          🧳
        </span>
        <div>
          <p className="text-base font-semibold text-ink">Past trips</p>
          <p className="text-sm text-muted">See where you&apos;ve stayed</p>
        </div>
      </Link>

      <Link
        href="/account/become-host"
        className="mt-4 flex items-center gap-4 rounded-xl border border-hairline-soft p-5 hover:bg-surface-soft"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-soft text-xl">
          🏡
        </span>
        <div>
          <p className="text-base font-semibold text-ink">Become a host</p>
          <p className="text-sm text-muted">It&apos;s easy to start hosting and earn extra income.</p>
        </div>
      </Link>

      <div className="mt-8 divide-y divide-hairline-soft border-y border-hairline-soft">
        {SETTINGS_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between py-4">
            <span className="text-base text-ink">{link.label}</span>
            <ChevronRightIcon />
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-canvas stroke-[2.5]">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
