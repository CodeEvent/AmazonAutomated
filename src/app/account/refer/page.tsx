import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsHeader } from "@/components/account/settings-header";
import { CopyLinkButton } from "@/components/account/copy-link-button";

export default async function ReferAHostPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/refer");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "wayfarer-booking.vercel.app";
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  const referralUrl = `${protocol}://${host}/signup?ref=${user.referralCode}`;

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Refer a host" />

      <p className="text-base text-body">
        Know someone with a great place to stay? Share your link — when they list a property on
        Wayfarer, you&apos;ll both get a discount on your next trip.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-hairline-soft p-4">
        <p className="min-w-0 flex-1 truncate text-sm text-ink">{referralUrl}</p>
        <CopyLinkButton text={referralUrl} />
      </div>

      <p className="mt-4 text-sm text-muted">Your referral code: {user.referralCode}</p>
    </div>
  );
}
