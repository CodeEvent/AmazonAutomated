import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { auth } from "@/lib/auth";

// Airbnb Cereal VF is a licensed, non-distributable font. Inter is the
// closest open-source substitute (see docs/design.md "Note on Font
// Substitutes"), loaded as the --font-sans value used across the theme.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wayfarer — Find your next stay",
  description: "Search and book hotels, apartments, and homes worldwide.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <MotionConfig reducedMotion="user">
          <SiteHeader user={session?.user ?? null} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </MotionConfig>
      </body>
    </html>
  );
}
