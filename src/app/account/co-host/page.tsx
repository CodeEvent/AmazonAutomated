import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsHeader } from "@/components/account/settings-header";
import { CoHostForm } from "@/components/account/co-host-form";

export default async function FindCoHostPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/co-host");
  }

  const inquiries = await prisma.coHostInquiry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Find a co-host" />

      <p className="text-base text-body">
        Co-hosts help with messaging guests, coordinating cleanings, and managing your listing
        while you&apos;re away. Tell us about your place and we&apos;ll connect you with a co-host in your
        area.
      </p>

      <div className="mt-6">
        <CoHostForm />
      </div>

      {inquiries.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-ink">Your inquiries</h2>
          <div className="mt-3 divide-y divide-hairline-soft border-y border-hairline-soft">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="py-4">
                <p className="text-sm font-semibold text-ink">{inquiry.city}</p>
                <p className="mt-1 text-sm text-muted">{inquiry.message}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
                    inquiry.createdAt,
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
