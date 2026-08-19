import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsHeader } from "@/components/account/settings-header";
import { yearsOnPlatformLabel } from "@/lib/member-since";

export default async function ViewProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { _count: { select: { bookings: true, reviews: true } } },
  });

  const initial = (user.name ?? user.email).trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-[480px] px-4 py-10 sm:px-8">
      <SettingsHeader title="View profile" />
      <p className="mb-6 text-sm text-muted">This is how your profile appears to hosts and other guests.</p>

      <div className="rounded-xl border border-hairline-soft p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ink text-2xl font-semibold text-canvas">
          {initial}
        </div>
        <p className="mt-4 text-lg font-semibold text-ink">{user.name ?? "Traveler"}</p>
        {user.searchableProfile ? null : (
          <p className="mt-1 text-xs text-muted">Your profile is currently private.</p>
        )}

        <div className="mt-6 grid grid-cols-3 divide-x divide-hairline-soft border-t border-hairline-soft pt-4">
          <div>
            <p className="text-lg font-bold text-ink">{user._count.bookings}</p>
            <p className="text-xs text-muted">Trips</p>
          </div>
          <div>
            <p className="text-lg font-bold text-ink">{user._count.reviews}</p>
            <p className="text-xs text-muted">Reviews</p>
          </div>
          <div>
            <p className="text-lg font-bold text-ink">{yearsOnPlatformLabel(user.createdAt)}</p>
            <p className="text-xs text-muted">On Wayfarer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
