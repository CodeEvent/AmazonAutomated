import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsHeader } from "@/components/account/settings-header";
import { ProfileForm } from "@/components/account/profile-form";
import { PasswordForm } from "@/components/account/password-form";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/settings");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-8">
      <SettingsHeader title="Account settings" />
      <ProfileForm name={user.name ?? ""} email={user.email} />
      {user.passwordHash ? <PasswordForm /> : null}
    </div>
  );
}
