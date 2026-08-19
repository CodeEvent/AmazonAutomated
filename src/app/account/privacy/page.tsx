import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsHeader } from "@/components/account/settings-header";
import { PrivacyForm } from "@/components/account/privacy-form";

export default async function PrivacyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/privacy");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Privacy" />
      <PrivacyForm marketingOptIn={user.marketingOptIn} searchableProfile={user.searchableProfile} />
    </div>
  );
}
