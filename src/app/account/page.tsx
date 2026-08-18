import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-10 sm:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-strong text-xl font-semibold text-ink">
          {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-ink">{session.user.name ?? "Traveler"}</p>
          <p className="text-sm text-muted">{session.user.email}</p>
        </div>
      </div>

      <div className="mt-8 divide-y divide-hairline-soft border-y border-hairline-soft">
        <Link href="/account/bookings" className="flex items-center justify-between py-4">
          <span className="text-base text-ink">My bookings</span>
          <ChevronRightIcon />
        </Link>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
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
