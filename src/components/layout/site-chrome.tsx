"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

type HeaderUser = {
  name?: string | null;
  email?: string | null;
} | null;

/**
 * The admin panel is a separate area with its own login, so it skips the
 * guest-facing header/footer/tab bar rather than nesting inside them.
 */
export function SiteChrome({
  user,
  isAuthenticated,
  children,
}: {
  user: HeaderUser;
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader user={user} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileTabBar isAuthenticated={isAuthenticated} />
    </>
  );
}
