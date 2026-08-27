"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signInSchema } from "@/lib/validation";
import { setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/admin-session";

export type AdminAuthActionState = { error: string } | null;

export async function adminLoginAction(
  _prevState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminPasswordHash) {
    return { error: "Admin login isn't configured on this server." };
  }

  if (parsed.data.email !== adminEmail) {
    return { error: "Invalid email or password" };
  }

  const passwordsMatch = await bcrypt.compare(parsed.data.password, adminPasswordHash);
  if (!passwordsMatch) {
    return { error: "Invalid email or password" };
  }

  await setAdminSessionCookie(adminEmail);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
